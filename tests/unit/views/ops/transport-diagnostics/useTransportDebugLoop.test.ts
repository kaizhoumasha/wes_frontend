import { describe, expect, it, vi } from 'vitest'
import { useTransportDebugLoop } from '@/views/ops/transport-diagnostics/useTransportDebugLoop'
import type { DebugTasksInput } from '@/api/modules/transport'

describe('useTransportDebugLoop', () => {
  it('advances the fixed rack and bin loop only after operator confirmation', async () => {
    const created: DebugTasksInput[] = []
    const confirmations: Array<{ taskId: string; step: string; assertion: string }> = []
    const loop = useTransportDebugLoop({
      createTask: vi.fn(async input => {
        created.push(input)
        return {
          transport_task_id: `transport-${created.length}`,
          client_request_id: input.client_request_id
        }
      }),
      confirmAndReset: vi.fn(async (taskId, confirmation) => {
        confirmations.push({ taskId, ...confirmation })
      })
    })

    await loop.start()
    expect(loop.currentStep.value.key).toBe('RACK_TO_STATION')
    expect(loop.activeTaskId.value).toBe('transport-1')
    expect(created[0]).toMatchObject({
      kind: 'RACK_MOVE',
      station_id: 'CTU01',
      data: {
        rack_id: '510056',
        source: { kind: 'RACK_POSITION', location_code: 'WH01' },
        target: { kind: 'RACK_POSITION', location_code: 'KT16' },
        target_face: 'A'
      }
    })

    await loop.advance()
    expect(confirmations).toEqual([
      {
        taskId: 'transport-1',
        step: 'RACK_TO_STATION',
        assertion: 'PHYSICAL_TARGET_REACHED'
      }
    ])
    expect(loop.currentStep.value.key).toBe('BINS_TO_INFEED')
    expect(created[1]).toMatchObject({
      kind: 'BIN_MOVE',
      station_id: 'CTU01',
      data: {
        moves: [
          {
            bin_id: 'A000001922',
            source: {
              kind: 'RACK_BIN_SLOT',
              rack_id: '510056',
              rack_face: 'A',
              slot_id: '510056A3F2C101'
            },
            target: { kind: 'HANDOFF_POSITION', location_code: 'CNV0301' }
          },
          {
            bin_id: 'A000002653',
            source: {
              kind: 'RACK_BIN_SLOT',
              rack_id: '510056',
              rack_face: 'A',
              slot_id: '510056A2F2C101'
            },
            target: { kind: 'HANDOFF_POSITION', location_code: 'CNV0301' }
          }
        ]
      }
    })

    await loop.advance()
    expect(loop.currentStep.value.key).toBe('CONVEYOR_TO_OUTFEED')
    expect(loop.activeTaskId.value).toBeNull()
    expect(created).toHaveLength(2)

    await loop.advance()
    expect(loop.currentStep.value.key).toBe('BINS_TO_RACK')
    expect(created[2]).toMatchObject({
      kind: 'BIN_MOVE',
      data: {
        moves: [
          {
            bin_id: 'A000001922',
            source: { kind: 'HANDOFF_POSITION', location_code: 'CNV0302' },
            target: {
              kind: 'RACK_BIN_SLOT',
              rack_id: '510056',
              rack_face: 'A',
              slot_id: '510056A3F2C101'
            }
          },
          {
            bin_id: 'A000002653',
            source: { kind: 'HANDOFF_POSITION', location_code: 'CNV0302' },
            target: {
              kind: 'RACK_BIN_SLOT',
              rack_id: '510056',
              rack_face: 'A',
              slot_id: '510056A2F2C101'
            }
          }
        ]
      }
    })

    await loop.advance()
    expect(loop.currentStep.value.key).toBe('RACK_TO_STORAGE')
    expect(created[3]).toMatchObject({
      kind: 'RACK_MOVE',
      data: {
        rack_id: '510056',
        source: { kind: 'RACK_POSITION', location_code: 'KT16' },
        target: { kind: 'RACK_POSITION', location_code: 'WH01' },
        target_face: 'A'
      }
    })

    await loop.advance()
    expect(loop.completedRounds.value).toBe(1)
    expect(loop.isComplete.value).toBe(true)
    expect(confirmations.map(item => item.step)).toEqual([
      'RACK_TO_STATION',
      'BINS_TO_INFEED',
      'BINS_TO_RACK',
      'RACK_TO_STORAGE'
    ])

    await loop.advance()
    expect(loop.currentStep.value.key).toBe('RACK_TO_STATION')
    expect(loop.isComplete.value).toBe(false)
    expect(created).toHaveLength(5)
  })

  it('does not repeat a confirmed reset when dispatching the next step fails', async () => {
    const createTask = vi
      .fn()
      .mockResolvedValueOnce({
        transport_task_id: 'transport-1',
        client_request_id: '019f12d0-58d7-7000-8000-000000000001'
      })
      .mockRejectedValueOnce(new Error('WMS unavailable'))
      .mockResolvedValueOnce({
        transport_task_id: 'transport-2',
        client_request_id: '019f12d0-58d7-7000-8000-000000000002'
      })
    const confirmAndReset = vi.fn().mockResolvedValue(undefined)
    const loop = useTransportDebugLoop({ createTask, confirmAndReset })

    await loop.start()
    await expect(loop.advance()).rejects.toThrow('WMS unavailable')

    expect(loop.currentStep.value.key).toBe('BINS_TO_INFEED')
    expect(loop.activeTaskId.value).toBeNull()
    expect(confirmAndReset).toHaveBeenCalledOnce()

    await loop.advance()
    expect(loop.activeTaskId.value).toBe('transport-2')
    expect(confirmAndReset).toHaveBeenCalledOnce()
  })

  it('keeps the active task when confirmation fails and blocks a concurrent action', async () => {
    let releaseCreate: ((value: { transport_task_id: string; client_request_id: string }) => void) | undefined
    const createTask = vi.fn(
      input =>
        new Promise<{ transport_task_id: string; client_request_id: string }>(resolve => {
          releaseCreate = resolve
          void input
        })
    )
    const confirmAndReset = vi.fn().mockRejectedValueOnce(new Error('confirmation unavailable'))
    const loop = useTransportDebugLoop({ createTask, confirmAndReset })

    const starting = loop.start()
    await expect(loop.start()).rejects.toThrow('联调步进操作正在执行')
    releaseCreate?.({
      transport_task_id: 'transport-1',
      client_request_id: '019f12d0-58d7-7000-8000-000000000001'
    })
    await starting

    await expect(loop.advance()).rejects.toThrow('confirmation unavailable')
    expect(loop.currentStep.value.key).toBe('RACK_TO_STATION')
    expect(loop.activeTaskId.value).toBe('transport-1')
    expect(loop.lastError.value?.message).toBe('confirmation unavailable')
  })
})
