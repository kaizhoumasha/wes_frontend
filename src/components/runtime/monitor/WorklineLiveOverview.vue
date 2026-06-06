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
            <div class="runtime-panel__title">现场态势图</div>
            <div class="runtime-panel__subtitle">按插件 manifest 与运行证据投影设备现场状态</div>
          </div>
        </div>
      </template>
      <RuntimeSceneMap
        :model="sceneModel"
        @select="emit('selectDevice', $event)"
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
import { buildRuntimeSceneModel } from '@/components/runtime/monitor/runtime-scene-model'
import { useRuntimeSceneManifest } from '@/composables/useRuntimeSceneManifest'
import type {
  RuntimeTraceDevicePathNode,
  RuntimeTraceListItem,
  RuntimeWorklineDetailResponse,
  RuntimeWorklineDeviceItem,
  RuntimeWorklineSummary
} from '@/types/runtime'

const props = defineProps<{
  worklineSummary: RuntimeWorklineSummary
  worklineDetail?: RuntimeWorklineDetailResponse | null
  devices: RuntimeWorklineDeviceItem[]
  activeSessions: RuntimeTraceListItem[]
  recentFailedTraces: RuntimeTraceListItem[]
  recentCompletedTraces?: RuntimeTraceListItem[]
  selectedDeviceId?: number | null
  tracePathNodes?: RuntimeTraceDevicePathNode[]
  blockingDeviceId?: number | null
}>()

const emit = defineEmits<{
  selectDevice: [deviceId: number]
  selectSession: [session: RuntimeTraceListItem]
}>()

const manifestState = useRuntimeSceneManifest()

const sceneModel = computed(() =>
  buildRuntimeSceneModel(
    props.worklineDetail ?? {
      summary: props.worklineSummary,
      devices: props.devices,
      active_sessions: props.activeSessions,
      recent_failed_traces: props.recentFailedTraces,
      recent_completed_traces: props.recentCompletedTraces ?? []
    },
    {
      manifest: manifestState.manifest.value,
      manifestError: manifestState.error.value,
      selectedDeviceId: props.selectedDeviceId,
      tracePathNodes: props.tracePathNodes,
      blockingDeviceId: props.blockingDeviceId
    }
  )
)

watch(
  () => props.worklineSummary.plugin_key,
  pluginKey => {
    void manifestState.load(pluginKey)
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
