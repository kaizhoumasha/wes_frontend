import { describe, expect, it, vi } from 'vitest'
import { useTransportDiagnostics } from '@/views/ops/transport-diagnostics/useTransportDiagnostics'
import type {
  DebugTasksInput,
  GetByTransportTaskIdResult,
  ResetPreviewResult,
  ResetResult,
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

const RESET_PREVIEW: ResetPreviewResult = {
  transport_task_id: 'transport-1',
  status: 'RECONCILING',
  evidence_count: 0,
  outcome_version: 0,
  member_count: 1,
  binding_count: 1,
  active_binding_count: 1,
  blockers: [],
  eligible: true
}

const RESET_RESULT: ResetResult = {
  transport_task_id: 'transport-1',
  deleted_member_count: 1,
  deleted_binding_count: 1
}

function createApi() {
  return {
    listTasks: vi.fn<(_: Record<string, unknown>) => Promise<TasksResult>>(),
    getTask: vi.fn<(_: string) => Promise<GetByTransportTaskIdResult>>(),
    createTask:
      vi.fn<
        (_: DebugTasksInput) => Promise<{ client_request_id: string; transport_task_id: string }>
      >(),
    previewTaskReset: vi.fn<(_: string) => Promise<ResetPreviewResult>>(),
    resetTask: vi.fn<(_: string) => Promise<ResetResult>>()
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
    let resolveCreate:
      | ((value: { client_request_id: string; transport_task_id: string }) => void)
      | undefined
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

  it('previews the exact selected aggregate before allowing a reset', async () => {
    const api = createApi()
    api.previewTaskReset.mockResolvedValue(RESET_PREVIEW)
    const diagnostics = useTransportDiagnostics({ api })

    const preview = await diagnostics.previewTaskReset('transport-1')

    expect(api.previewTaskReset).toHaveBeenCalledWith('transport-1')
    expect(preview).toEqual(RESET_PREVIEW)
    expect(diagnostics.resetPreview.value).toEqual(RESET_PREVIEW)
  })

  it('clears the deleted selection and reloads the durable task list after reset', async () => {
    const api = createApi()
    api.getTask.mockResolvedValue(DETAIL_1)
    api.resetTask.mockResolvedValue(RESET_RESULT)
    api.listTasks.mockResolvedValue({ items: [TASK_2], next_cursor: null })
    const diagnostics = useTransportDiagnostics({ api })
    await diagnostics.selectTask('transport-1')

    const result = await diagnostics.resetTask('transport-1')

    expect(result).toEqual(RESET_RESULT)
    expect(diagnostics.selectedTaskId.value).toBeNull()
    expect(diagnostics.detail.value).toBeNull()
    expect(diagnostics.resetPreview.value).toBeNull()
    expect(diagnostics.tasks.value).toEqual([TASK_2])
  })

  it('keeps a completed reset successful when only the follow-up list refresh fails', async () => {
    const api = createApi()
    api.getTask.mockResolvedValue(DETAIL_1)
    api.resetTask.mockResolvedValue(RESET_RESULT)
    api.listTasks.mockRejectedValue(new Error('refresh unavailable'))
    const diagnostics = useTransportDiagnostics({ api })
    await diagnostics.selectTask('transport-1')

    await expect(diagnostics.resetTask('transport-1')).resolves.toEqual(RESET_RESULT)

    expect(diagnostics.selectedTaskId.value).toBeNull()
    expect(diagnostics.detail.value).toBeNull()
    expect(diagnostics.lastError.value?.message).toBe('refresh unavailable')
  })
})
