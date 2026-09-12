import { effectScope, nextTick, ref } from 'vue'
import { flushPromises } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import type { DebugRunResult } from '@/api/modules/transport'
import {
  useTransportDebugSequence,
  nextRoundInput
} from '@/views/ops/transport-debug/useTransportDebugSequence'

const input = {
  test_mode: true,
  workstation: 'KT11',
  infeed_position: 'CNV0101',
  outfeed_position: 'CNV0102',
  scan_device_codes: ['STATION_SCAN1', 'STATION_SCAN2', 'STATION_SCAN3', 'STATION_SCAN4'],
  workline_code: 'LINE-1',
  rack_id: '510056',
  face_groups: [
    { face: '90', bins: [{ bin_code: 'B1', slot_id: 'OLD-1' }] },
    { face: '270', bins: [{ bin_code: 'B2', slot_id: 'OLD-2' }] }
  ]
}
const snapshot = (id: string, status = 'RUNNING') =>
  ({
    run_id: id,
    status,
    ...input,
    returned_bins: [
      { bin_code: 'B1', rack_id: '510056', rack_face: '90', slot_id: 'NEW-1' },
      { bin_code: 'B2', rack_id: '510056', rack_face: '270', slot_id: 'NEW-2' }
    ]
  }) as DebugRunResult

function harness() {
  const currentRun = ref<DebugRunResult | null>(null)
  const startRun = vi.fn(async () => {
    const next = snapshot(`run-${startRun.mock.calls.length}`)
    currentRun.value = next
    return next
  })
  const scope = effectScope()
  const sequence = scope.run(() =>
    useTransportDebugSequence({ currentRun, startRun, canStart: () => true })
  )!
  return { currentRun, startRun, sequence, scope }
}

describe('useTransportDebugSequence', () => {
  it('creates independent rounds only after completion and uses actual returned slots', async () => {
    const h = harness()
    await h.sequence.start(input, 2)
    expect(h.startRun).toHaveBeenCalledTimes(1)
    h.currentRun.value = snapshot('run-1', 'COMPLETED')
    await flushPromises()
    expect(h.startRun).toHaveBeenCalledTimes(2)
    expect(h.startRun.mock.calls[1]?.[0]).toMatchObject({
      test_mode: true,
      workstation: 'KT11',
      infeed_position: 'CNV0101',
      outfeed_position: 'CNV0102',
      scan_device_codes: input.scan_device_codes,
      face_groups: [
        { face: '90', bins: [{ bin_code: 'B1', slot_id: 'NEW-1' }] },
        { face: '270', bins: [{ bin_code: 'B2', slot_id: 'NEW-2' }] }
      ]
    })
    h.currentRun.value = snapshot('run-1', 'COMPLETED')
    await flushPromises()
    expect(h.startRun).toHaveBeenCalledTimes(2)
    h.currentRun.value = snapshot('run-2', 'COMPLETED')
    await flushPromises()
    expect(h.sequence.completed.value).toBe(2)
    expect(h.sequence.running.value).toBe(false)
    h.scope.stop()
  })

  it.each(['FAILED', 'ABORTED', 'NEEDS_ATTENTION'])(
    'does not start another round after %s',
    async status => {
      const h = harness()
      await h.sequence.start(input, 3)
      h.currentRun.value = snapshot('run-1', status)
      await flushPromises()
      expect(h.startRun).toHaveBeenCalledTimes(1)
      h.scope.stop()
    }
  )

  it('stops scheduling on page exit, leaving the backend current run intact', async () => {
    const h = harness()
    await h.sequence.start(input, 3)
    window.dispatchEvent(new Event('pagehide'))
    h.currentRun.value = snapshot('run-1', 'COMPLETED')
    await flushPromises()
    expect(h.startRun).toHaveBeenCalledTimes(1)
    expect(h.sequence.running.value).toBe(false)
    h.scope.stop()
  })

  it('does not restart a historical run or resume a previous page session', async () => {
    const h = harness()
    h.currentRun.value = snapshot('historic', 'COMPLETED')
    await flushPromises()
    expect(h.startRun).not.toHaveBeenCalled()
    h.scope.stop()
  })

  it('does not create a follow-up after unmount during an in-flight start', async () => {
    const h = harness()
    let resolve!: (value: DebugRunResult) => void
    h.startRun.mockImplementationOnce(
      () =>
        new Promise(done => {
          resolve = done
        })
    )
    const starting = h.sequence.start(input, 2)
    h.scope.stop()
    resolve(snapshot('run-1', 'COMPLETED'))
    await starting
    await nextTick()
    expect(h.startRun).toHaveBeenCalledTimes(1)
    expect(h.sequence.running.value).toBe(false)
  })

  it('does not retry an uncertain create and requires explicit operator restart', async () => {
    const h = harness()
    h.startRun.mockRejectedValueOnce(new Error('response lost'))
    await h.sequence.start(input, 3)
    expect(h.sequence.error.value).toContain('response lost')
    expect(h.sequence.running.value).toBe(false)
    expect(h.startRun).toHaveBeenCalledTimes(1)
    h.scope.stop()
  })

  it.each([0, -1, 1.5, 1001])('rejects invalid counts %s', async rounds => {
    const h = harness()
    await expect(h.sequence.start(input, rounds)).rejects.toThrow('轮数')
    expect(h.startRun).not.toHaveBeenCalled()
    h.scope.stop()
  })

  it('refuses to reuse incomplete or conflicting returned location evidence', () => {
    const complete = snapshot('run-1', 'COMPLETED')
    expect(() => nextRoundInput({ ...complete, returned_bins: [] })).toThrow('回架')
    expect(() =>
      nextRoundInput({
        ...complete,
        returned_bins: [complete.returned_bins[0]!, complete.returned_bins[0]!]
      })
    ).toThrow('回架')
    expect(() =>
      nextRoundInput({
        ...complete,
        returned_bins: [
          { ...complete.returned_bins[0]!, rack_id: 'OTHER' },
          complete.returned_bins[1]!
        ]
      })
    ).toThrow('回架')
  })
})
