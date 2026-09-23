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
  PlaneCurrentTaskView,
  PlaneResourceRef,
  PlaneSceneV2,
  PlaneSnapshotV2
} from '@/api/types/plane-v2'
import { getSafeErrorMessage } from '@/utils/string'
import { parseApiTime } from '@/utils/timezone'
import { useTimezoneStore } from '@/stores/timezone'
import {
  nextPollDelayMs,
  SOURCE_STATUS_BANNER
} from '../components/activity-monitor/planeV2Helpers'

export function useActivityMonitor(workLineId: () => number | null) {
  const timezoneStore = useTimezoneStore()
  const scene = shallowRef<PlaneSceneV2 | null>(null)
  const sceneLoading = ref(false)
  const sceneError = ref('')

  const snapshot = shallowRef<PlaneSnapshotV2 | null>(null)
  const activeObjects = shallowRef<PlaneActiveObjectsV2 | null>(null)
  const currentTask = shallowRef<PlaneCurrentTaskView | null>(null)
  const currentTaskLoaded = ref(false)
  const currentTaskLoading = ref(false)
  const currentTaskError = ref('')
  const currentTaskGeneratedAt = ref<string | null>(null)
  // 仅首次加载（尚无任何历史数据）时为 true；轮询/刷新期间保留旧数据，不触发骨架屏闪烁。
  const dynamicLoading = ref(false)
  const dynamicError = ref('')
  const consecutiveFailures = ref(0)

  const selectedResourceRef = ref<PlaneResourceRef | null>(null)

  let pollTimer: ReturnType<typeof setTimeout> | undefined
  let sceneSequence = 0
  let dynamicSequence = 0
  let currentTaskSequence = 0
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
    try {
      const parsed = parseApiTime(generatedAt)
      return timezoneStore.formatInCurrentTimezone(parsed, 'HH:mm:ss')
    } catch {
      return null
    }
  })

  const currentTaskGeneratedAtLabel = computed<string | null>(() => {
    const generatedAt = currentTaskGeneratedAt.value
    if (!generatedAt) return null
    try {
      const parsed = parseApiTime(generatedAt)
      return timezoneStore.formatInCurrentTimezone(parsed, 'HH:mm:ss')
    } catch {
      return null
    }
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

  // current-task: IDLE -> LOADING -> LOADED_EMPTY | LOADED_TASK; failures -> ERROR -> retry.
  // WorkLine changes/unmount increment the sequence so late success/error responses are ignored.
  async function loadCurrentTask(): Promise<void> {
    if (currentId === null || currentTaskLoading.value) return
    const id = currentId
    const turn = ++currentTaskSequence
    currentTaskLoading.value = true
    currentTaskError.value = ''
    try {
      const result = await workLinesApiMethods.planeCurrentTaskV2({ id }).send()
      if (turn !== currentTaskSequence || currentId !== id) return
      currentTask.value = result.current_task ?? null
      currentTaskGeneratedAt.value = result.generated_at ?? null
      currentTaskLoaded.value = true
    } catch (reason) {
      if (turn !== currentTaskSequence || currentId !== id) return
      currentTask.value = null
      currentTaskGeneratedAt.value = null
      currentTaskLoaded.value = true
      currentTaskError.value = getSafeErrorMessage(reason)
    } finally {
      if (turn === currentTaskSequence && currentId === id) currentTaskLoading.value = false
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
    ++currentTaskSequence
    selectedResourceRef.value = null
    scene.value = null
    snapshot.value = null
    activeObjects.value = null
    currentTask.value = null
    currentTaskLoaded.value = false
    currentTaskLoading.value = false
    currentTaskError.value = ''
    currentTaskGeneratedAt.value = null
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
    ++currentTaskSequence
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
    currentTask,
    currentTaskLoaded,
    currentTaskLoading,
    currentTaskError,
    currentTaskGeneratedAtLabel,
    dynamicLoading,
    dynamicError,
    staleBannerText,
    generatedAtLabel,
    selectedResourceRef,
    selectResource,
    refresh,
    loadCurrentTask,
    reloadScene: () => currentId !== null && loadScene(currentId)
  }
}
