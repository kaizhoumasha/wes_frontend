import { computed, ref } from 'vue'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import { worklineApiMethods, type WorklinesStartResult } from '@/api/modules/workline'
import {
  clearPendingStartRequest,
  ensurePendingStartRequest,
  getStableStartReason,
  readPendingStartRequest,
  type WorkLineStartReason
} from '@/views/admin/worklines/config/startRequest'

export type WorkLineStartViewState =
  | 'idle'
  | 'submitting'
  | 'succeeded'
  | 'rejected'
  | 'preparation-failed'
  | 'delivery-unknown'

export function useWorkLineStart(
  options: {
    createRequestId?: () => string
  } = {}
) {
  const workline = ref<Workline | null>(null)
  const state = ref<WorkLineStartViewState>('idle')
  const result = ref<WorklinesStartResult | null>(null)
  const rejectionReason = ref<WorkLineStartReason | null>(null)
  const submitting = computed(() => state.value === 'submitting')

  function open(row: Workline): void {
    if (submitting.value) return

    workline.value = row
    result.value = null
    rejectionReason.value = null
    try {
      state.value = readPendingStartRequest(row.id) ? 'delivery-unknown' : 'idle'
    } catch {
      state.value = 'preparation-failed'
    }
  }

  async function submit(): Promise<void> {
    if (
      !workline.value ||
      (state.value !== 'idle' &&
        state.value !== 'delivery-unknown' &&
        state.value !== 'preparation-failed')
    ) {
      return
    }

    const row = workline.value
    let requestId: string
    try {
      requestId = ensurePendingStartRequest(row.id, options.createRequestId)
    } catch {
      state.value = 'preparation-failed'
      return
    }
    state.value = 'submitting'

    try {
      result.value = await worklineApiMethods
        .worklinesStart({ workline_id: row.id }, { request_id: requestId })
        .send()
      clearPendingStartRequest(row.id)
      state.value = 'succeeded'
    } catch (error) {
      const reason = getStableStartReason(error)
      if (reason) {
        clearPendingStartRequest(row.id)
        rejectionReason.value = reason
        state.value = 'rejected'
      } else {
        state.value = 'delivery-unknown'
      }
    }
  }

  return {
    workline,
    state,
    result,
    rejectionReason,
    submitting,
    open,
    submit
  }
}
