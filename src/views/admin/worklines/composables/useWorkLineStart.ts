import { computed, ref } from 'vue'
import { workLinesApiMethods, type WorkLinesItem as Workline } from '@/api/modules/workLines'
import { worklineApiMethods, type WorklinesStartResult } from '@/api/modules/workline'
import {
  getStableStartReason,
  type WorkLineStartReason
} from '@/views/admin/worklines/config/startRequest'

export type WorkLineStartViewState =
  | 'idle'
  | 'submitting'
  | 'succeeded'
  | 'rejected'
  | 'delivery-unknown'

const CURRENT_WORKLINE_QUERY_CONFIG = { cacheFor: 0, shareRequest: false } as const

export function useWorkLineStart() {
  const workline = ref<Workline | null>(null)
  const state = ref<WorkLineStartViewState>('idle')
  const result = ref<WorklinesStartResult | null>(null)
  const rejectionReason = ref<WorkLineStartReason | null>(null)
  const refreshing = ref(false)
  const refreshFailed = ref(false)
  const submitting = computed(() => state.value === 'submitting')

  function open(row: Workline): void {
    if (submitting.value || refreshing.value) return
    workline.value = { ...row }
    result.value = null
    rejectionReason.value = null
    refreshFailed.value = false
    state.value = 'idle'
  }

  async function refresh(): Promise<void> {
    if (!workline.value || refreshing.value) return
    refreshing.value = true
    refreshFailed.value = false
    try {
      workline.value = await workLinesApiMethods
        .getById(workline.value.id, {
          config: CURRENT_WORKLINE_QUERY_CONFIG
        })
        .send()
    } catch {
      refreshFailed.value = true
    } finally {
      refreshing.value = false
    }
  }

  async function submit(): Promise<void> {
    if (!workline.value || state.value !== 'idle' || refreshing.value) return
    const row = workline.value
    state.value = 'submitting'
    try {
      result.value = await worklineApiMethods
        .worklinesStart({ workline_id: row.id }, { version: row.version })
        .send()
      state.value = 'succeeded'
    } catch (error) {
      const reason = getStableStartReason(error)
      rejectionReason.value = reason
      state.value = reason ? 'rejected' : 'delivery-unknown'
      // 读取当前状态不能自动形成使用新版本的启动意图。
      if (!reason || reason === 'VERSION_CONFLICT') await refresh()
    }
  }

  return {
    workline,
    state,
    result,
    rejectionReason,
    submitting,
    refreshing,
    refreshFailed,
    open,
    submit,
    refresh
  }
}
