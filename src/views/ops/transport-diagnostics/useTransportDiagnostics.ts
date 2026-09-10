import { ref } from 'vue'
import {
  transportApiMethods,
  type CallbackReceiptsResult,
  type DebugTasksInput,
  type DebugTasksResult,
  type GetByTransportTaskIdResult,
  type ResetPreviewResult,
  type ResetInput,
  type ResetResult,
  type TasksQuery,
  type TasksResult
} from '@/api/modules/transport'

type TransportDebugStepConfirmationInput = NonNullable<ResetInput>

export interface TransportDiagnosticsApiPort {
  listTasks(query: TasksQuery): Promise<TasksResult>
  getTask(transportTaskId: string): Promise<GetByTransportTaskIdResult>
  getCallbackReceipt(operation: string, operationId: string): Promise<CallbackReceiptsResult>
  createTask(input: DebugTasksInput): Promise<DebugTasksResult>
  previewTaskReset(transportTaskId: string): Promise<ResetPreviewResult>
  resetTask(
    transportTaskId: string,
    confirmation?: TransportDebugStepConfirmationInput
  ): Promise<ResetResult>
}

interface UseTransportDiagnosticsOptions {
  api?: TransportDiagnosticsApiPort
}

type TaskSummary = TasksResult['items'][number]

const DEFAULT_API: TransportDiagnosticsApiPort = {
  listTasks: query => transportApiMethods.tasks(query).send(),
  getTask: transportTaskId =>
    transportApiMethods.getByTransportTaskId({ transport_task_id: transportTaskId }).send(),
  getCallbackReceipt: (operation, operationId) =>
    transportApiMethods.callbackReceipts({ operation, operation_id: operationId }).send(),
  createTask: input => transportApiMethods.debugTasks(input).send(),
  previewTaskReset: transportTaskId =>
    transportApiMethods.resetPreview({ transport_task_id: transportTaskId }).send(),
  resetTask: (transportTaskId, confirmation) =>
    transportApiMethods.reset({ transport_task_id: transportTaskId }, confirmation ?? null).send()
}

export function useTransportDiagnostics(options: UseTransportDiagnosticsOptions = {}) {
  const api = options.api ?? DEFAULT_API
  const tasks = ref<TaskSummary[]>([])
  const detail = ref<GetByTransportTaskIdResult | null>(null)
  const selectedTaskId = ref<string | null>(null)
  const callbackReceipt = ref<CallbackReceiptsResult | null>(null)
  const callbackReceiptUnknown = ref(false)
  const callbackReceiptError = ref('')
  const nextCursor = ref<string | null>(null)
  const filters = ref<Pick<TasksQuery, 'kind' | 'status'>>({})
  const loading = ref(false)
  const loadingDetail = ref(false)
  const loadingCallbackReceipt = ref(false)
  const submitting = ref(false)
  const previewingReset = ref(false)
  const resetting = ref(false)
  const resetPreview = ref<ResetPreviewResult | null>(null)
  const lastError = ref<Error | null>(null)
  let listRequestGeneration = 0
  let detailRequestGeneration = 0
  let callbackReceiptRequestGeneration = 0

  async function loadRecent(): Promise<void> {
    await loadPage(false)
  }

  async function loadMore(): Promise<void> {
    if (!nextCursor.value) return
    await loadPage(true)
  }

  async function loadPage(append: boolean): Promise<void> {
    const requestGeneration = ++listRequestGeneration
    loading.value = true
    lastError.value = null
    const query: TasksQuery = {
      limit: 20,
      ...filters.value,
      ...(append && nextCursor.value ? { cursor: nextCursor.value } : {})
    }
    try {
      const page = await api.listTasks(query)
      if (requestGeneration !== listRequestGeneration) return
      tasks.value = append ? deduplicateTasks([...tasks.value, ...page.items]) : page.items
      nextCursor.value = page.next_cursor
    } catch (error) {
      if (requestGeneration !== listRequestGeneration) return
      lastError.value = toError(error)
      throw error
    } finally {
      if (requestGeneration === listRequestGeneration) loading.value = false
    }
  }

  async function selectTask(transportTaskId: string): Promise<void> {
    const requestGeneration = ++detailRequestGeneration
    selectedTaskId.value = transportTaskId
    resetPreview.value = null
    loadingDetail.value = true
    lastError.value = null
    try {
      const nextDetail = await api.getTask(transportTaskId)
      if (requestGeneration !== detailRequestGeneration) return
      detail.value = nextDetail
    } catch (error) {
      if (requestGeneration !== detailRequestGeneration) return
      lastError.value = toError(error)
      throw error
    } finally {
      if (requestGeneration === detailRequestGeneration) loadingDetail.value = false
    }
  }

  async function handleStreamTask(transportTaskId: string | null): Promise<void> {
    await loadRecent()
    if (transportTaskId && selectedTaskId.value === transportTaskId) {
      await selectTask(transportTaskId)
    }
  }

  async function loadCallbackReceipt(operation: string, operationId: string): Promise<void> {
    const requestGeneration = ++callbackReceiptRequestGeneration
    callbackReceipt.value = null
    callbackReceiptUnknown.value = false
    callbackReceiptError.value = ''
    loadingCallbackReceipt.value = true
    try {
      const receipt = await api.getCallbackReceipt(operation, operationId)
      if (requestGeneration !== callbackReceiptRequestGeneration) return
      callbackReceipt.value = receipt
    } catch (error) {
      if (requestGeneration !== callbackReceiptRequestGeneration) return
      if (isUnknownReceiptError(error)) {
        callbackReceiptUnknown.value = true
        callbackReceiptError.value = toError(error).message
        return
      }
      callbackReceiptError.value = toError(error).message
      throw error
    } finally {
      if (requestGeneration === callbackReceiptRequestGeneration) {
        loadingCallbackReceipt.value = false
      }
    }
  }

  async function submitTask(input: DebugTasksInput): Promise<DebugTasksResult> {
    if (submitting.value) throw new Error('Transport 任务正在提交')
    submitting.value = true
    lastError.value = null
    try {
      const created = await api.createTask(input)
      await loadRecent()
      await selectTask(created.transport_task_id)
      return created
    } catch (error) {
      lastError.value = toError(error)
      throw error
    } finally {
      submitting.value = false
    }
  }

  async function previewTaskReset(transportTaskId: string): Promise<ResetPreviewResult> {
    if (previewingReset.value) throw new Error('Transport 任务清理预检正在执行')
    previewingReset.value = true
    resetPreview.value = null
    lastError.value = null
    try {
      const preview = await api.previewTaskReset(transportTaskId)
      resetPreview.value = preview
      return preview
    } catch (error) {
      lastError.value = toError(error)
      throw error
    } finally {
      previewingReset.value = false
    }
  }

  async function resetTask(
    transportTaskId: string,
    confirmation?: TransportDebugStepConfirmationInput
  ): Promise<ResetResult> {
    if (resetting.value) throw new Error('Transport 任务正在清理')
    resetting.value = true
    lastError.value = null
    try {
      const result = await api.resetTask(transportTaskId, confirmation)
      if (selectedTaskId.value === transportTaskId) {
        detailRequestGeneration += 1
        selectedTaskId.value = null
        detail.value = null
        loadingDetail.value = false
      }
      resetPreview.value = null
      try {
        await loadRecent()
      } catch {
        // 清理结果已经确定，保留 loadRecent 写入的错误供页面提示，禁止诱导重复清理。
      }
      return result
    } catch (error) {
      lastError.value = toError(error)
      throw error
    } finally {
      resetting.value = false
    }
  }

  function setFilters(nextFilters: Pick<TasksQuery, 'kind' | 'status'>): void {
    filters.value = { ...nextFilters }
  }

  return {
    tasks,
    detail,
    selectedTaskId,
    callbackReceipt,
    callbackReceiptUnknown,
    callbackReceiptError,
    nextCursor,
    filters,
    loading,
    loadingDetail,
    loadingCallbackReceipt,
    submitting,
    previewingReset,
    resetting,
    resetPreview,
    lastError,
    loadRecent,
    loadMore,
    selectTask,
    handleStreamTask,
    loadCallbackReceipt,
    submitTask,
    previewTaskReset,
    resetTask,
    setFilters
  }
}

function deduplicateTasks(tasks: TaskSummary[]): TaskSummary[] {
  const seen = new Set<string>()
  return tasks.filter(task => {
    if (seen.has(task.transport_task_id)) return false
    seen.add(task.transport_task_id)
    return true
  })
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error))
}

function httpStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined
  if ('status' in error && typeof error.status === 'number') return error.status
  if ('statusCode' in error && typeof error.statusCode === 'number') return error.statusCode
  if (
    'response' in error &&
    typeof error.response === 'object' &&
    error.response !== null &&
    'status' in error.response &&
    typeof error.response.status === 'number'
  ) {
    return error.response.status
  }
  return undefined
}

function isUnknownReceiptError(error: unknown): boolean {
  const status = httpStatus(error)
  if (status === 404 || status === 503) return true
  if (typeof error !== 'object' || error === null || !('code' in error)) return false
  return error.code === '3000' || error.code === '5030'
}
