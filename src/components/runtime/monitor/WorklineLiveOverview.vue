<template>
  <div class="workline-live-overview">
    <DecisionStrip
      :summary="worklineSummary"
      :projection="worklineProjection"
    />

    <el-card
      shadow="never"
      class="runtime-panel"
    >
      <template #header>
        <div class="runtime-panel__header">
          <div>
            <div class="runtime-panel__title">拓扑主视图</div>
            <div class="runtime-panel__subtitle">点击设备节点查看详情</div>
          </div>
        </div>
      </template>
      <RuntimeSceneMap
        v-if="sceneModel"
        :model="sceneModel"
        :selected-device-id="selectedDeviceId"
        @select-device="emit('selectDevice', $event)"
        @select-rack-position="emit('selectRackPosition', $event)"
      />
    </el-card>

    <div
      class="workline-live-overview__resize-handle"
      data-test="workline-live-overview-resize-handle"
      role="separator"
      aria-orientation="horizontal"
      aria-label="调整即时事件日志高度"
      @mousedown="onResizeStart"
    ></div>

    <section
      class="monitor-event-log"
      data-test="monitor-event-log-panel"
      aria-label="即时事件日志"
      :style="{ flexBasis: eventLogHeight + 'px' }"
    >
      <header class="monitor-event-log__header">
        <div class="monitor-event-log__title">即时事件日志</div>
        <span class="monitor-event-log__count">{{ eventLogEntries.length }}</span>
      </header>
      <div
        v-if="eventLogEntries.length"
        class="monitor-event-log__body"
      >
        <div
          v-for="entry in eventLogEntries"
          :key="entry.id"
          class="monitor-event-log__row"
          data-test="monitor-event-log-row"
        >
          <span class="monitor-event-log__time">[{{ entry.time }}]</span>
          <span
            class="monitor-event-log__tag"
            :class="`is-${entry.level}`"
          >
            {{ entry.tag }}
          </span>
          <span class="monitor-event-log__text">{{ entry.text }}</span>
        </div>
      </div>
      <div
        v-else
        class="monitor-event-log__empty"
      >
        暂无即时事件
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import DecisionStrip from '@/components/runtime/devices/DecisionStrip.vue'
import RuntimeSceneMap from '@/components/runtime/monitor/RuntimeSceneMap.vue'
import { useRuntimeSceneManifest } from '@/composables/useRuntimeSceneManifest'
import type {
  RuntimeWorklineMonitorProjectionResponse,
  RuntimeWorklineSummary
} from '@/types/runtime'
import { buildRuntimeSceneModel } from '@/utils/runtime-scene'

export interface MonitorEventLogEntry {
  id: string
  time: string
  level: 'info' | 'warn' | 'err'
  tag: string
  text: string
}

const props = withDefaults(
  defineProps<{
    worklineSummary: RuntimeWorklineSummary
    worklineProjection?: RuntimeWorklineMonitorProjectionResponse | null
    eventLogEntries?: MonitorEventLogEntry[]
    selectedDeviceId?: number | null
  }>(),
  {
    worklineProjection: null,
    eventLogEntries: () => [],
    selectedDeviceId: null
  }
)

const emit = defineEmits<{
  selectDevice: [deviceId: number]
  selectRackPosition: [rackCode: string]
}>()

const { manifest, error: manifestError, loadManifest } = useRuntimeSceneManifest()

const pluginKey = computed(
  () => props.worklineProjection?.summary.plugin_key ?? props.worklineSummary.plugin_key ?? null
)

const contractVersion = computed(
  () =>
    props.worklineProjection?.summary.contract_version ??
    props.worklineSummary.contract_version ??
    null
)

const matchedManifest = computed(() => {
  const currentPluginKey = pluginKey.value
  if (!currentPluginKey) return null
  if (manifest.value?.plugin_key !== currentPluginKey) return null

  const currentContractVersion = contractVersion.value?.trim()
  if (currentContractVersion && manifest.value?.contract_version !== currentContractVersion) {
    return null
  }

  return manifest.value
})

const sceneModel = computed(() =>
  props.worklineProjection
    ? buildRuntimeSceneModel({
        projection: props.worklineProjection,
        manifest: matchedManifest.value,
        manifestLoadFailed: Boolean(manifestError.value)
      })
    : null
)

watch(
  [pluginKey, contractVersion],
  ([key, version]) => {
    void loadManifest(key, version).catch(() => undefined)
  },
  { immediate: true }
)

// ---------------------------------------------------------------------------
// Resizable event log
// ---------------------------------------------------------------------------

const EVENT_LOG_MIN_HEIGHT = 80
const EVENT_LOG_MAX_HEIGHT = 480
const EVENT_LOG_DEFAULT_HEIGHT = 140

const eventLogHeight = ref(EVENT_LOG_DEFAULT_HEIGHT)
let dragOrigin: { clientY: number; height: number } | null = null

function onResizeStart(event: MouseEvent): void {
  if (event.button !== 0) return
  event.preventDefault()
  dragOrigin = { clientY: event.clientY, height: eventLogHeight.value }
  window.addEventListener('mousemove', onResizeMove)
  window.addEventListener('mouseup', onResizeEnd)
  // 拖动时禁止文字选中
  document.body.style.userSelect = 'none'
  document.body.style.cursor = 'row-resize'
}

function onResizeMove(event: MouseEvent): void {
  if (!dragOrigin) return
  const delta = event.clientY - dragOrigin.clientY
  // 拖动 handle 向上 → 减高度（事件日志缩小，canvas 占更大空间）
  // 拖动 handle 向下 → 增高度
  const next = dragOrigin.height - delta
  eventLogHeight.value = Math.min(
    EVENT_LOG_MAX_HEIGHT,
    Math.max(EVENT_LOG_MIN_HEIGHT, next)
  )
}

function onResizeEnd(): void {
  dragOrigin = null
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
}

onBeforeUnmount(() => {
  // 组件卸载时清理全局事件监听
  window.removeEventListener('mousemove', onResizeMove)
  window.removeEventListener('mouseup', onResizeEnd)
  document.body.style.userSelect = ''
  document.body.style.cursor = ''
})
</script>

<style scoped>
.workline-live-overview {
  display: flex;
  flex-direction: column;
  gap: 0;
  min-height: 0;

  /*
   * runtime-panel 占满剩余空间，event-log 高度由拖动控制。两者之间的
   * resize-handle 占用 4px 并提供拖动手柄。
   */
}

.workline-live-overview :deep(.runtime-panel) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 让 el-card body 内部允许 RuntimeSceneMap 占满高度 */
.workline-live-overview :deep(.runtime-panel .el-card__body) {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 12px;
}

.workline-live-overview :deep(.runtime-panel .el-card__body > *) {
  flex: 1 1 auto;
  min-height: 0;
}

/*
 * 拖动条：4px 高的水平条，hover 时变明显，鼠标移上去变 row-resize 光标。
 */
.workline-live-overview__resize-handle {
  flex: 0 0 4px;
  cursor: row-resize;
  background: transparent;
  position: relative;
}

.workline-live-overview__resize-handle::before {
  content: '';
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 36px;
  height: 2px;
  border-radius: 1px;
  background: var(--runtime-border-subtle, rgb(148, 163, 184, 0.25));
  transition: background 150ms ease-out;
}

.workline-live-overview__resize-handle:hover::before,
.workline-live-overview__resize-handle:focus-visible::before {
  background: rgb(245, 158, 11, 0.6);
}

.monitor-event-log {
  flex: 0 0 auto;
  min-height: 80px;
  padding: 10px 14px;
  border: 1px solid var(--runtime-border-subtle, rgb(148 163 184 / 0.2));
  border-radius: 8px;
  background: var(--runtime-surface-strong, rgb(4 6 13 / 0.9));
  color: var(--runtime-text-primary);
  font-family: var(--font-mono, 'JetBrains Mono');
  font-size: 11px;
}

.monitor-event-log__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 8px;
}

.monitor-event-log__title {
  color: var(--runtime-text-primary);
  font-weight: 800;
}

.monitor-event-log__count {
  color: var(--runtime-text-muted);
}

.monitor-event-log__body {
  display: grid;
  gap: 5px;
  max-height: 94px;
  overflow-y: auto;
}

.monitor-event-log__row {
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  gap: 9px;
  align-items: start;
  min-width: 0;
}

.monitor-event-log__time {
  color: var(--runtime-text-muted);
}

.monitor-event-log__tag {
  font-weight: 900;
}

.monitor-event-log__tag.is-info {
  color: var(--runtime-badge-info-text, #38bdf8);
}

.monitor-event-log__tag.is-warn {
  color: var(--runtime-badge-warning-text, #f59e0b);
}

.monitor-event-log__tag.is-err {
  color: var(--runtime-badge-danger-text, #ef4444);
}

.monitor-event-log__text,
.monitor-event-log__empty {
  min-width: 0;
  color: var(--runtime-text-secondary);
  overflow-wrap: anywhere;
}

.monitor-event-log__empty {
  padding: 24px 0;
  text-align: center;
}
</style>
