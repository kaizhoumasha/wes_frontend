<template>
  <div
    class="workline-topology-strip"
  >
    <template v-if="convertedDevices.length">
      <!-- Canvas wrapper: sized to computed layout -->
      <div
        class="workline-topology-strip__canvas"
        :style="{ width: layout.canvasWidth + 'px', height: layout.canvasHeight + 'px' }"
      >
        <!-- SVG Connection Layer -->
        <svg
          class="workline-topology-strip__connections"
          :width="layout.canvasWidth"
          :height="layout.canvasHeight"
          :viewBox="`0 0 ${layout.canvasWidth} ${layout.canvasHeight}`"
          :style="{ width: layout.canvasWidth + 'px', height: layout.canvasHeight + 'px' }"
        >
          <path
            v-for="edge in layout.edges"
            :key="edge.id"
            :d="edge.path"
            :class="['flow-line', `flow-line--${edge.status}`]"
          />
        </svg>

        <!-- Node Layer -->
        <div class="workline-topology-strip__nodes">
          <TopologyDeviceNode
            v-for="node in layout.nodes"
            :key="node.id"
            :device="node.device"
            :selected="selectedDeviceId === node.id"
            :show-role-details="true"
            :signal-text="signalText(node.device)"
            :signal-class="signalClass(node.device)"
            :compact="true"
            :style="{ left: node.x + 'px', top: node.y + 'px', width: '240px', minHeight: '100px' }"
            :class="{ 'is-interactive': interactive }"
            @click="emitSelect"
          />
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TopologyDeviceNode from '@/components/runtime/shared/TopologyDeviceNode.vue'
import type { RuntimeMonitorDeviceNode } from '@/types/runtime'
import { useTopologyLayout } from '@/composables/useTopologyLayout'
import { toRuntimeSceneDeviceNode, type RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

const props = withDefaults(
  defineProps<{
    devices?: RuntimeMonitorDeviceNode[]
    selectedDeviceId?: number | null
    interactive?: boolean
    sessionCountsByDevice?: Map<number, number> | Record<number, number>
  }>(),
  {
    devices: () => [],
    selectedDeviceId: null,
    interactive: true,
    sessionCountsByDevice: undefined,
  }
)

const emit = defineEmits<{
  select: [deviceId: number]
}>()

// Convert API snake_case devices to camelCase scene nodes
const convertedDevices = computed<RuntimeSceneDeviceNode[]>(() =>
  props.devices.map(toRuntimeSceneDeviceNode)
)

// Linear layout (single row)
const { layout } = useTopologyLayout(convertedDevices, {
  linear: true,
})

function emitSelect(deviceId: number) {
  if (!props.interactive) return
  emit('select', deviceId)
}

function getSessionCount(deviceId: number): number {
  const map = props.sessionCountsByDevice
  if (!map) return 0
  if (map instanceof Map) return map.get(deviceId) ?? 0
  return map[deviceId] ?? 0
}

function signalText(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return `ERROR: ${device.errorCode}`
  const waiting = getSessionCount(device.id)
  if (waiting > 0) return `${waiting}条等待`
  return '空闲'
}

function signalClass(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return 'is-danger'
  if (getSessionCount(device.id) > 0) return 'is-warning'
  return 'is-idle'
}
</script>

<style scoped>
.workline-topology-strip {
  position: relative;
  overflow-x: auto;
  padding-bottom: 8px;
}

/* Canvas wrapper: sized to computed layout, scrolls if wider than container */
.workline-topology-strip__canvas {
  position: relative;
  flex-shrink: 0;
}

/* SVG Connection Layer */
.workline-topology-strip__connections {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

/* Node Layer */
.workline-topology-strip__nodes {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}

/* Flow line styles */
.flow-line {
  fill: none;
  stroke-width: 2;
}

.flow-line--idle {
  stroke: var(--runtime-border);
}

.flow-line--active {
  stroke: #f59e0b;
  stroke-dasharray: 6, 6;
  animation: topology-strip-dash 20s linear infinite;
}

.flow-line--fault {
  stroke: #dc2626;
  stroke-width: 2.5;
  stroke-dasharray: 4, 4;
  animation: topology-strip-dash 8s linear infinite;
}

.flow-line--warning {
  stroke: #eab308;
  stroke-dasharray: 5, 5;
  animation: topology-strip-dash 15s linear infinite;
}

@keyframes topology-strip-dash {
  to {
    stroke-dashoffset: -1000;
  }
}
</style>
