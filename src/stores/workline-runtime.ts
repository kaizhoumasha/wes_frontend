import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { runtimeApiMethods } from '@/api/modules/runtime'
import type {
  RuntimeWorklineSummary,
  RuntimeWorklineDetailResponse,
} from '@/types/runtime'
import {
  aggregateSessionsByDevice,
  getWorklineRiskScore,
  pickDominantValue,
  sortByScoreDesc,
} from '@/utils/runtime-display'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'

export const useWorklineRuntimeStore = defineStore('workline-runtime', () => {
  const worklines = ref<RuntimeWorklineSummary[]>([])
  const detail = ref<RuntimeWorklineDetailResponse | null>(null)
  const loading = ref(false)

  const orderedWorklines = computed(() =>
    sortByScoreDesc(worklines.value, getWorklineRiskScore, item => item.id)
  )

  const hotspotDevice = computed(() => {
    const devices = detail.value?.devices ?? []
    return (
      devices.find(item => ['ERROR', 'OFFLINE'].includes(item.device_status)) ??
      devices.find(item => Boolean(item.error_code)) ??
      devices.find(item => Boolean(item.current_command_id)) ??
      null
    )
  })

  const mostFailedBusinessStage = computed(() =>
    pickDominantValue(detail.value?.recent_failed_traces.map(item => item.plugin_state || '—') ?? [])
  )

  const dominantActiveBusinessStage = computed(() =>
    pickDominantValue(detail.value?.active_sessions.map(item => item.plugin_state || '—') ?? [])
  )

  const sessionCountsByDevice = computed(() =>
    aggregateSessionsByDevice(detail.value?.active_sessions ?? [])
  )

  function findSummary(worklineId: number): RuntimeWorklineSummary | null {
    return worklines.value.find(item => item.id === worklineId) ?? null
  }

  function findDevice(deviceId: number) {
    return detail.value?.devices.find(item => item.id === deviceId) ?? null
  }

  async function loadWorklines() {
    worklines.value = await runtimeApiMethods.worklines().send()
  }

  async function loadDetail(worklineId: number) {
    detail.value = await runtimeApiMethods.worklineDetail(worklineId).send()
  }

  const refreshWorklines = createCoalescedAsyncTask(async () => {
    loading.value = true
    try {
      await loadWorklines()
    } finally {
      loading.value = false
    }
  })

  const refreshDetail = createCoalescedAsyncTask(async (worklineId?: number) => {
    const id = worklineId ?? detail.value?.summary.id
    if (!id) return
    loading.value = true
    try {
      await loadDetail(id)
    } finally {
      loading.value = false
    }
  })

  function clearDetail() {
    detail.value = null
  }

  return {
    worklines,
    detail,
    loading,
    orderedWorklines,
    hotspotDevice,
    mostFailedBusinessStage,
    dominantActiveBusinessStage,
    sessionCountsByDevice,
    findSummary,
    findDevice,
    loadWorklines,
    loadDetail,
    refreshWorklines,
    refreshDetail,
    clearDetail,
  }
})
