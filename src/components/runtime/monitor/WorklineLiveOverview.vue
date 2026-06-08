<template>
  <div class="workline-live-overview">
    <DecisionStrip
      :summary="worklineSummary"
      :detail="worklineDetail"
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
        :session-counts-by-device="sessionCountsByDevice"
        :trace-path-nodes="tracePathNodes"
        :blocking-device-id="blockingDeviceId"
        @select-device="emit('selectDevice', $event)"
      />
    </el-card>

    <SessionBoard
      :active-sessions="activeSessions"
      :recent-failed-traces="recentFailedTraces"
      :recent-completed-traces="recentCompletedTraces"
      @select-session="emit('selectSession', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import DecisionStrip from '@/components/runtime/devices/DecisionStrip.vue'
import RuntimeSceneMap from '@/components/runtime/monitor/RuntimeSceneMap.vue'
import SessionBoard from '@/components/runtime/monitor/SessionBoard.vue'
import { useRuntimeSceneManifest } from '@/composables/useRuntimeSceneManifest'
import type {
  RuntimeTraceDevicePathNode,
  RuntimeTraceListItem,
  RuntimeWorklineDetailResponse,
  RuntimeWorklineDeviceItem,
  RuntimeWorklineSummary
} from '@/types/runtime'
import { buildRuntimeSceneModel } from '@/utils/runtime-scene'

const props = defineProps<{
  worklineSummary: RuntimeWorklineSummary
  worklineDetail?: RuntimeWorklineDetailResponse | null
  devices: RuntimeWorklineDeviceItem[]
  activeSessions: RuntimeTraceListItem[]
  recentFailedTraces: RuntimeTraceListItem[]
  recentCompletedTraces?: RuntimeTraceListItem[]
  selectedDeviceId?: number | null
  sessionCountsByDevice?: Map<number, number> | Record<number, number>
  tracePathNodes?: RuntimeTraceDevicePathNode[]
  blockingDeviceId?: number | null
}>()

const emit = defineEmits<{
  selectDevice: [deviceId: number]
  selectSession: [session: RuntimeTraceListItem]
}>()

const { manifest, error: manifestError, loadManifest } = useRuntimeSceneManifest()

const pluginKey = computed(
  () => props.worklineDetail?.summary.plugin_key ?? props.worklineSummary.plugin_key ?? null
)

const contractVersion = computed(
  () =>
    props.worklineDetail?.summary.contract_version ?? props.worklineSummary.contract_version ?? null
)

const matchedManifest = computed(() => {
  const currentPluginKey = pluginKey.value
  if (!currentPluginKey) return null
  if (manifest.value?.plugin_key !== currentPluginKey) return null

  const currentContractVersion = contractVersion.value?.trim()
  if (currentContractVersion && manifest.value.contract_version !== currentContractVersion) {
    return null
  }

  return manifest.value
})

const sceneModel = computed(() =>
  props.worklineDetail
    ? buildRuntimeSceneModel({
        detail: props.worklineDetail,
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
  gap: 16px;
}
</style>
