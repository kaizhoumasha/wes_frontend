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
      <WorklineRouteMap
        :devices="devices"
        :selected-device-id="selectedDeviceId"
        :session-counts-by-device="sessionCountsByDevice"
        :trace-path-nodes="tracePathNodes"
        :blocking-device-id="blockingDeviceId"
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
import DecisionStrip from '@/components/runtime/devices/DecisionStrip.vue'
import WorklineRouteMap from '@/components/runtime/monitor/WorklineRouteMap.vue'
import SessionBoard from '@/components/runtime/monitor/SessionBoard.vue'
import type {
  RuntimeTraceDevicePathNode,
  RuntimeTraceListItem,
  RuntimeWorklineDetailResponse,
  RuntimeWorklineDeviceItem,
  RuntimeWorklineSummary
} from '@/types/runtime'

defineProps<{
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
</script>

<style scoped>
.workline-live-overview {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
