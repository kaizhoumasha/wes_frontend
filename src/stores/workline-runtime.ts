import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { runtimeApiMethods } from '@/api/modules/runtime'
import type {
  RuntimeWorklineSummary,
  RuntimeWorklineMonitorProjectionResponse,
} from '@/types/runtime'
import {
  aggregateSessionsByDevice,
  getWorklineRiskScore,
  pickDominantValue,
  resolveRuntimeProgressLabel,
  sortByScoreDesc,
} from '@/utils/runtime-display'
import { createCoalescedAsyncTask } from '@/utils/createCoalescedAsyncTask'

export const useWorklineRuntimeStore = defineStore('workline-runtime', () => {
  const worklines = ref<RuntimeWorklineSummary[]>([])
  const projection = ref<RuntimeWorklineMonitorProjectionResponse | null>(null)
  const loading = ref(false)
  let projectionRequestSeq = 0

  const orderedWorklines = computed(() =>
    sortByScoreDesc(worklines.value, getWorklineRiskScore, item => item.id)
  )

  const hotspotDevice = computed(() => {
    const devices = projection.value?.device_nodes ?? []
    return (
      devices.find(item => ['ERROR', 'OFFLINE'].includes(item.device_status)) ??
      devices.find(item => Boolean(item.error_code)) ??
      devices.find(item => Boolean(item.current_command_id)) ??
      null
    )
  })

  const mostFailedBusinessStage = computed(() =>
    pickDominantValue(projection.value?.recent_failed_traces.items?.map(resolveRuntimeProgressLabel) ?? [])
  )

  const dominantActiveBusinessStage = computed(() =>
    pickDominantValue(projection.value?.active_sessions.items?.map(resolveRuntimeProgressLabel) ?? [])
  )

  const sessionCountsByDevice = computed(() =>
    aggregateSessionsByDevice(projection.value?.active_sessions.items ?? [])
  )

  function findSummary(worklineId: number): RuntimeWorklineSummary | null {
    return worklines.value.find(item => item.id === worklineId) ?? null
  }

  function findDevice(deviceId: number) {
    return projection.value?.device_nodes?.find(item => item.id === deviceId) ?? null
  }

  async function loadWorklines() {
    worklines.value = await runtimeApiMethods.worklines().send()
  }

  async function loadProjection(worklineId: number) {
    const requestSeq = ++projectionRequestSeq
    const nextProjection = await runtimeApiMethods.worklineProjection(worklineId).send()
    if (requestSeq === projectionRequestSeq) {
      projection.value = nextProjection
    }
  }

  const refreshWorklines = createCoalescedAsyncTask(async () => {
    loading.value = true
    try {
      await loadWorklines()
    } finally {
      loading.value = false
    }
  })

  const refreshProjection = createCoalescedAsyncTask(async (worklineId?: number) => {
    const id = worklineId ?? projection.value?.summary.id
    if (!id) return
    loading.value = true
    try {
      await loadProjection(id)
    } finally {
      loading.value = false
    }
  })

  function clearProjection() {
    projectionRequestSeq += 1
    projection.value = null
  }

  return {
    worklines,
    projection,
    loading,
    orderedWorklines,
    hotspotDevice,
    mostFailedBusinessStage,
    dominantActiveBusinessStage,
    sessionCountsByDevice,
    findSummary,
    findDevice,
    loadWorklines,
    loadProjection,
    refreshWorklines,
    refreshProjection,
    clearProjection,
  }
})
