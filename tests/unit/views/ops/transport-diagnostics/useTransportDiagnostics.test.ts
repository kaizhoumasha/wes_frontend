import { describe, expect, it, vi } from 'vitest'
import { useTransportDiagnostics } from '@/views/ops/transport-diagnostics/useTransportDiagnostics'
import type {
  DebugTasksInput,
  GetByTransportTaskIdResult,
  TasksResult
} from '@/api/modules/transport'

const TASK_1: TasksResult['items'][number] = {
  transport_task_id: 'transport-1',
  client_request_id: '019f12d0-58d7-7000-8000-000000000001',
  submit_operation_id: 'submit-1',
  kind: 'RACK_MOVE',
  status: 'PENDING',
  reason_code: null,
  created_at: '2026-08-28T08:00:00Z',
  updated_at: '2026-08-28T08:00:00Z',
  latest_evidence: null
}

const TASK_2: TasksResult['items'][number] = {
  ...TASK_1,
  transport_task_id: 'transport-2',
  client_request_id: '019f12d0-58d7-7000-8000-000000000002',
  submit_operation_id: 'submit-2',
  kind: 'BIN_MOVE'
}

const DETAIL_1: GetByTransportTaskIdResult = {
  ...TASK_1,
  request: { kind: 'RACK_MOVE' },
  result: null
}

function createApi() {
  return {
    listTasks: vi.fn<(_: Record<string, unknown>) => Promise<TasksResult>>(),
    getTask: vi.fn<(_: string) => Promise<GetByTransportTaskIdResult>>(),
    createTask: vi.fn<(_: DebugTasksInput) => Promise<{ client_request_id: string; transport_task_id: string }>>()
  }
}

describe('useTransportDiagnostics', () => {
  it('does not let an older list response overwrite a newer refresh', async () => {
    const api = createApi()
    let resolveOlder: ((value: TasksResult) => void) | undefined
    let resolveNewer: ((value: TasksResult) => void) | undefined
    api.listTasks
      .mockReturnValueOnce(new Promise(resolve => (resolveOlder = resolve)))
      .mockReturnValueOnce(new Promise(resolve => (resolveNewer = resolve)))
    const diagnostics = useTransportDiagnostics({ api })

    const older = diagnostics.loadRecent()
    const newer = diagnostics.loadRecent()
    resolveNewer?.({ items: [TASK_2], next_cursor: null })
    await newer
    resolveOlder?.({ items: [TASK_1], next_cursor: null })
    await older

    expect(diagnostics.tasks.value).toEqual([TASK_2])
  })

  it('keeps detail aligned with the latest selected task when responses arrive out of order', async () => {
    const api = createApi()
    let resolveFirst: ((value: GetByTransportTaskIdResult) => void) | undefined
    let resolveSecond: ((value: GetByTransportTaskIdResult) => void) | undefined
    api.getTask
      .mockReturnValueOnce(new Promise(resolve => (resolveFirst = resolve)))
      .mockReturnValueOnce(new Promise(resolve => (resolveSecond = resolve)))
    const diagnostics = useTransportDiagnostics({ api })
    const detail2 = { ...DETAIL_1, ...TASK_2, request: { kind: 'BIN_MOVE' } }

    const first = diagnostics.selectTask('transport-1')
    const second = diagnostics.selectTask('transport-2')
    resolveSecond?.(detail2)
    await second
    resolveFirst?.(DETAIL_1)
    await first

    expect(diagnostics.selectedTaskId.value).toBe('transport-2')
    expect(diagnostics.detail.value).toEqual(detail2)
  })

  it('loads recent tasks, deduplicates cursor pages and preserves evidence after a failure', async () => {
    vi.useFakeTimers()
    const api = createApi()
    api.listTasks
      .mockResolvedValueOnce({ items: [TASK_1], next_cursor: 'cursor-1' })
      .mockResolvedValueOnce({ items: [TASK_1, TASK_2], next_cursor: null })
      .mockRejectedValueOnce(new Error('network unavailable'))
    const diagnostics = useTransportDiagnostics({ api })

    await diagnostics.loadRecent()
    expect(api.listTasks).toHaveBeenNthCalledWith(1, { limit: 20 })
    await diagnostics.loadMore()
    expect(api.listTasks).toHaveBeenNthCalledWith(2, { limit: 20, cursor: 'cursor-1' })
    expect(diagnostics.tasks.value.map(task => task.transport_task_id)).toEqual([
      'transport-1',
      'transport-2'
    ])

    await expect(diagnostics.loadRecent()).rejects.toThrow('network unavailable')
    expect(diagnostics.tasks.value).toHaveLength(2)
    expect(vi.getTimerCount()).toBe(0)
    vi.useRealTimers()
  })

  it('loads detail only after selection and refreshes only the selected detail for SSE events', async () => {
    const api = createApi()
    api.listTasks.mockResolvedValue({ items: [TASK_1, TASK_2], next_cursor: null })
    api.getTask.mockResolvedValue(DETAIL_1)
    const diagnostics = useTransportDiagnostics({ api })

    await diagnostics.loadRecent()
    expect(api.getTask).not.toHaveBeenCalled()
    await diagnostics.selectTask('transport-1')
    expect(api.getTask).toHaveBeenCalledWith('transport-1')

    await diagnostics.handleStreamTask('transport-2')
    expect(api.getTask).toHaveBeenCalledTimes(1)
    await diagnostics.handleStreamTask('transport-1')
    expect(api.getTask).toHaveBeenCalledTimes(2)
    expect(api.listTasks).toHaveBeenCalledTimes(3)
  })

  it('creates once, refreshes recent tasks and selects the durable task identity', async () => {
    const api = createApi()
    let resolveCreate: ((value: { client_request_id: string; transport_task_id: string }) => void) | undefined
    api.createTask.mockReturnValue(
      new Promise(resolve => {
        resolveCreate = resolve
      })
    )
    api.listTasks.mockResolvedValue({ items: [TASK_1], next_cursor: null })
    api.getTask.mockResolvedValue(DETAIL_1)
    const diagnostics = useTransportDiagnostics({ api })
    const input: DebugTasksInput = {
      kind: 'RACK_MOVE',
      client_request_id: TASK_1.client_request_id,
      data: {
        rack_id: 'RACK-01',
        source: { kind: 'RACK_POSITION', location_code: 'SRC-01' },
        target: { kind: 'RACK_POSITION', location_code: 'DST-01' },
        target_face: 'A'
      }
    }

    const first = diagnostics.submitTask(input)
    await expect(diagnostics.submitTask(input)).rejects.toThrow('Transport 任务正在提交')
    resolveCreate?.({
      client_request_id: TASK_1.client_request_id,
      transport_task_id: 'transport-1'
    })
    await first

    expect(api.createTask).toHaveBeenCalledOnce()
    expect(api.listTasks).toHaveBeenCalledOnce()
    expect(api.getTask).toHaveBeenCalledWith('transport-1')
    expect(diagnostics.selectedTaskId.value).toBe('transport-1')
  })
})
