import { describe, expect, it, vi } from 'vitest'
import { useTransportDebugRun } from '@/views/ops/transport-diagnostics/useTransportDebugRun'

const snapshot = (version: number, status = 'RUNNING') => ({
  run_id: 'run-1', status, rack_id: '510056', face_groups: [], current_group_index: 0,
  current_phase: 'RACK_TO_STATION', current_step: null, observed_bin_ids: [], attention_code: null,
  attention_detail: null, can_abort: false, version, created_by_user_id: 1, aborted_by_user_id: null,
  aborted_reason: null, created_at: '2026-09-03T00:00:00Z', updated_at: '2026-09-03T00:00:00Z'
})

describe('useTransportDebugRun', () => {
  it('uses persisted snapshots and ignores an older refresh', async () => {
    const api = {
      list: vi.fn().mockResolvedValue({ items: [snapshot(2)], next_cursor: null }),
      get: vi.fn().mockResolvedValueOnce(snapshot(3)).mockResolvedValueOnce(snapshot(1)),
      create: vi.fn().mockResolvedValue(snapshot(1)), abort: vi.fn()
    }
    const run = useTransportDebugRun({ api: api as never })
    await run.loadRecentRuns()
    expect(run.activeRun.value?.run_id).toBe('run-1')
    await run.refreshRun('run-1')
    await run.refreshRun('run-1')
    expect(run.currentRun.value?.version).toBe(3)
  })

  it('reconciles a terminal list snapshot when the dialog is reopened', async () => {
    const api = {
      list: vi.fn()
        .mockResolvedValueOnce({ items: [snapshot(1)], next_cursor: null })
        .mockResolvedValueOnce({ items: [snapshot(2, 'COMPLETED')], next_cursor: null }),
      get: vi.fn(), create: vi.fn(), abort: vi.fn()
    }
    const run = useTransportDebugRun({ api: api as never })
    await run.loadRecentRuns()
    await run.loadRecentRuns()
    expect(run.activeRun.value).toBeNull()
    expect(run.currentRun.value).toMatchObject({ version: 2, status: 'COMPLETED' })
  })

  it('does not let an older list response overwrite a newer detail snapshot', async () => {
    let releaseList!: (page: unknown) => void
    const api = {
      list: vi.fn(() => new Promise(resolve => { releaseList = resolve })),
      get: vi.fn().mockResolvedValue(snapshot(3)), create: vi.fn(), abort: vi.fn()
    }
    const run = useTransportDebugRun({ api: api as never })
    const pendingList = run.loadRecentRuns()
    await run.refreshRun('run-1')
    releaseList({ items: [snapshot(1)], next_cursor: null })
    await pendingList
    expect(run.currentRun.value?.version).toBe(3)
    expect(run.activeRun.value?.version).toBe(3)
  })

  it('accepts a slow detail response after a newer refresh has started', async () => {
    let releaseFirst!: (value: ReturnType<typeof snapshot>) => void
    let releaseSecond!: (value: ReturnType<typeof snapshot>) => void
    const api = {
      list: vi.fn().mockResolvedValue({ items: [snapshot(1)], next_cursor: null }),
      get: vi.fn()
        .mockImplementationOnce(() => new Promise(resolve => { releaseFirst = resolve }))
        .mockImplementationOnce(() => new Promise(resolve => { releaseSecond = resolve })),
      create: vi.fn(), abort: vi.fn()
    }
    const run = useTransportDebugRun({ api: api as never })
    await run.loadRecentRuns()
    const first = run.refreshRun('run-1')
    const second = run.refreshRun('run-1')
    releaseFirst(snapshot(2))
    await first
    expect(run.currentRun.value?.version).toBe(2)
    releaseSecond(snapshot(3))
    await second
    expect(run.currentRun.value?.version).toBe(3)
  })

  it('does not let a terminal historical notification replace the active run', async () => {
    const active = { ...snapshot(1), run_id: 'run-2' }
    const historical = { ...snapshot(4, 'COMPLETED'), run_id: 'run-1' }
    const api = {
      list: vi.fn().mockResolvedValue({ items: [active, historical], next_cursor: null }),
      get: vi.fn().mockResolvedValue(historical), create: vi.fn(), abort: vi.fn()
    }
    const run = useTransportDebugRun({ api: api as never })
    await run.loadRecentRuns()
    await run.refreshRun('run-1')
    expect(run.activeRun.value?.run_id).toBe('run-2')
    expect(run.currentRun.value?.run_id).toBe('run-2')
  })

  it('preserves every known run version when an older list response arrives', async () => {
    const terminal = snapshot(2, 'COMPLETED')
    const nextActive = { ...snapshot(1), run_id: 'run-2' }
    const api = {
      list: vi.fn()
        .mockResolvedValueOnce({ items: [snapshot(1)], next_cursor: null })
        .mockResolvedValueOnce({ items: [snapshot(1)], next_cursor: null }),
      get: vi.fn().mockResolvedValue(terminal),
      create: vi.fn().mockResolvedValue(nextActive), abort: vi.fn()
    }
    const run = useTransportDebugRun({ api: api as never })
    await run.loadRecentRuns()
    await run.refreshRun('run-1')
    await run.startRun({ rack_id: '510057', face_groups: [] })
    await run.loadRecentRuns()
    expect(run.activeRun.value?.run_id).toBe('run-2')
    expect(run.recentRuns.value.find(item => item.run_id === 'run-1')).toMatchObject({
      version: 2,
      status: 'COMPLETED'
    })
  })

  it('prevents concurrent starts and sends the exact abort assertion', async () => {
    let release!: () => void
    const api = {
      list: vi.fn(), get: vi.fn(), abort: vi.fn().mockResolvedValue(snapshot(4, 'ABORTED')),
      create: vi.fn(() => new Promise(resolve => { release = () => resolve(snapshot(1)) }))
    }
    const run = useTransportDebugRun({ api: api as never })
    const first = run.startRun({ rack_id: '510056', face_groups: [] })
    await expect(run.startRun({ rack_id: '510056', face_groups: [] })).rejects.toThrow('正在启动')
    release(); await first
    await run.abortRun('run-1', '现场确认静止')
    expect(api.abort).toHaveBeenCalledWith('run-1', {
      assertion: 'PHYSICAL_STATE_VERIFIED', reason: '现场确认静止'
    })
  })
})
