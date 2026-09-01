import { ref } from 'vue'
import {
  transportApiMethods,
  type DebugTasksInput,
  type DebugTasksResult,
  type GetByTransportTaskIdResult,
  type ResetPreviewResult,
  type ResetResult,
  type TasksQuery,
  type TasksResult
} from '@/api/modules/transport'
import type { TransportDebugStepConfirmationInput } from './useTransportDebugLoop'

export interface TransportDiagnosticsApiPort {
  listTasks(query: TasksQuery): Promise<TasksResult>
  getTask(transportTaskId: string): Promise<GetByTransportTaskIdResult>
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
  createTask: input => transportApiMethods.debugTasks(input).send(),
  previewTaskReset: transportTaskId =>
    transportApiMethods.resetPreview({ transport_task_id: transportTaskId }).send(),
  resetTask: (transportTaskId, confirmation) =>
    transportApiMethods
      .reset({ transport_task_id: transportTaskId }, confirmation ?? null)
      .send()
}

export function useTransportDiagnostics(options: UseTransportDiagnosticsOptions = {}) {
  const api = options.api ?? DEFAULT_API
  const tasks = ref<TaskSummary[]>([])
  const detail = ref<GetByTransportTaskIdResult | null>(null)
  const selectedTaskId = ref<string | null>(null)
  const nextCursor = ref<string | null>(null)
  const filters = ref<Pick<TasksQuery, 'kind' | 'status'>>({})
  const loading = ref(false)
  const loadingDetail = ref(false)
  const submitting = ref(false)
  const previewingReset = ref(false)
  const resetting = ref(false)
  const resetPreview = ref<ResetPreviewResult | null>(null)
  const lastError = ref<Error | null>(null)
  let listRequestGeneration = 0
  let detailRequestGeneration = 0

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
    nextCursor,
    filters,
    loading,
    loadingDetail,
    submitting,
    previewingReset,
    resetting,
    resetPreview,
    lastError,
    loadRecent,
    loadMore,
    selectTask,
    handleStreamTask,
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
