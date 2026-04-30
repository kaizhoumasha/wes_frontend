<template>
  <div class="workline-live-overview">
    <WorklineHealthHero
      :summary="worklineSummary"
      class="workline-live-overview__hero"
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

    <WorklineTaskQueue
      :active-sessions="activeSessions"
      :recent-failed-traces="recentFailedTraces"
      @select-session="emit('selectSession', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import WorklineHealthHero from '@/components/common/runtime/WorklineHealthHero.vue'
import WorklineRouteMap from '@/components/common/runtime/WorklineRouteMap.vue'
import WorklineTaskQueue from '@/components/common/runtime/WorklineTaskQueue.vue'
import type {
  RuntimeTraceDevicePathNode,
  RuntimeTraceListItem,
  RuntimeWorklineDeviceItem,
  RuntimeWorklineSummary
} from '@/types/runtime'

defineProps<{
  worklineSummary: RuntimeWorklineSummary
  devices: RuntimeWorklineDeviceItem[]
  activeSessions: RuntimeTraceListItem[]
  recentFailedTraces: RuntimeTraceListItem[]
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

.workline-live-overview__hero {
  flex-shrink: 0;
}
</style>
