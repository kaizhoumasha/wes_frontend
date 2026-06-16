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

    <section
      class="monitor-event-log"
      data-test="monitor-event-log-panel"
      aria-label="即时事件日志"
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
import { computed, watch } from 'vue'
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
</script>

<style scoped>
.workline-live-overview {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-height: 0;
}

.workline-live-overview :deep(.runtime-panel) {
  flex: 1 1 auto;
  min-height: 0;
}

.monitor-event-log {
  flex: 0 0 140px;
  min-height: 120px;
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
