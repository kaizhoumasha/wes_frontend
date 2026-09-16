/**
 * 作业线资源活动监控：Scene v2 单次加载 + Snapshot/ActiveObjects v2 轮询（含失败退避）。
 *
 * 数据流约定（design.md §10）：
 * - Scene 仅在 workline id 变化时拉取一次（v1 暂不监听插件版本变化，切换 workline 时会重新拉取）
 * - Snapshot + ActiveObjects 页面可见时每 15s 并行轮询；失败退避 15/30/60/120s，成功后重置
 * - 手动刷新：取消计时器，立即并行拉取一次，不产生副作用
 */
import { computed, onBeforeUnmount, onMounted, shallowRef, ref, watch } from 'vue'
import { workLinesApiMethods } from '@/api/modules/workLines'
import type {
  PlaneActiveObjectsV2,
  PlaneResourceRef,
  PlaneSceneV2,
  PlaneSnapshotV2
} from '@/api/types/plane-v2'
import { getSafeErrorMessage } from '@/utils/string'
import {
  nextPollDelayMs,
  SOURCE_STATUS_BANNER
} from '../components/activity-monitor/planeV2Helpers'

export function useActivityMonitor(workLineId: () => number | null) {
  const scene = shallowRef<PlaneSceneV2 | null>(null)
  const sceneLoading = ref(false)
  const sceneError = ref('')

  const snapshot = shallowRef<PlaneSnapshotV2 | null>(null)
  const activeObjects = shallowRef<PlaneActiveObjectsV2 | null>(null)
  // 仅首次加载（尚无任何历史数据）时为 true；轮询/刷新期间保留旧数据，不触发骨架屏闪烁。
  const dynamicLoading = ref(false)
  const dynamicError = ref('')
  const consecutiveFailures = ref(0)

  const selectedResourceRef = ref<PlaneResourceRef | null>(null)

  let pollTimer: ReturnType<typeof setTimeout> | undefined
  let sceneSequence = 0
  let dynamicSequence = 0
  let currentId: number | null = null

  const staleBannerText = computed<string | null>(() => {
    if (dynamicError.value && (snapshot.value !== null || activeObjects.value !== null)) {
      return SOURCE_STATUS_BANNER.FAILED
    }
    if (snapshot.value) {
      return SOURCE_STATUS_BANNER[snapshot.value.source_status] ?? null
    }
    return null
  })

  const generatedAtLabel = computed<string | null>(() => {
    const generatedAt = snapshot.value?.generated_at
    if (!generatedAt) return null
    const parsed = new Date(generatedAt)
    if (Number.isNaN(parsed.getTime())) return null
    return parsed.toLocaleTimeString('zh-CN', { hour12: false })
  })

  function clearTimer(): void {
    if (pollTimer !== undefined) {
      clearTimeout(pollTimer)
      pollTimer = undefined
    }
  }

  async function loadScene(id: number): Promise<void> {
    const turn = ++sceneSequence
    sceneLoading.value = true
    sceneError.value = ''
    try {
      const result = await workLinesApiMethods.planeSceneV2({ id }).send()
      if (turn === sceneSequence) scene.value = result
    } catch (reason) {
      if (turn === sceneSequence) sceneError.value = getSafeErrorMessage(reason)
    } finally {
      if (turn === sceneSequence) sceneLoading.value = false
    }
  }

  function schedulePoll(id: number): void {
    clearTimer()
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return
    pollTimer = setTimeout(() => void loadDynamic(id), nextPollDelayMs(consecutiveFailures.value))
  }

  async function loadDynamic(id: number): Promise<void> {
    const turn = ++dynamicSequence
    if (snapshot.value === null && activeObjects.value === null) dynamicLoading.value = true
    try {
      const [snapshotResult, activeObjectsResult] = await Promise.all([
        workLinesApiMethods.planeSnapshotV2({ id }).send(),
        workLinesApiMethods.activeObjectsV2({ id }).send()
      ])
      if (turn !== dynamicSequence) return
      snapshot.value = snapshotResult
      activeObjects.value = activeObjectsResult
      dynamicError.value = ''
      consecutiveFailures.value = 0
    } catch (reason) {
      if (turn !== dynamicSequence) return
      dynamicError.value = getSafeErrorMessage(reason)
      consecutiveFailures.value += 1
    } finally {
      if (turn === dynamicSequence) {
        dynamicLoading.value = false
        schedulePoll(id)
      }
    }
  }

  async function refresh(): Promise<void> {
    if (currentId === null) return
    clearTimer()
    await loadDynamic(currentId)
  }

  function selectResource(resourceRef: PlaneResourceRef | null): void {
    selectedResourceRef.value = resourceRef
  }

  function handleVisibilityChange(): void {
    if (currentId === null) return
    clearTimer()
    if (document.visibilityState === 'visible') void loadDynamic(currentId)
  }

  function start(id: number): void {
    currentId = id
    selectedResourceRef.value = null
    scene.value = null
    snapshot.value = null
    activeObjects.value = null
    dynamicError.value = ''
    consecutiveFailures.value = 0
    clearTimer()
    void loadScene(id)
    void loadDynamic(id)
  }

  onMounted(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    clearTimer()
    ++sceneSequence
    ++dynamicSequence
  })

  watch(
    workLineId,
    id => {
      if (id !== null && id !== currentId) start(id)
    },
    { immediate: true }
  )

  return {
    scene,
    sceneLoading,
    sceneError,
    snapshot,
    activeObjects,
    dynamicLoading,
    dynamicError,
    staleBannerText,
    generatedAtLabel,
    selectedResourceRef,
    selectResource,
    refresh,
    reloadScene: () => currentId !== null && loadScene(currentId)
  }
}
