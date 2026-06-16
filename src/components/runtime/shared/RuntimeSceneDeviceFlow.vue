<template>
  <div
    class="runtime-scene-device-flow"
    :class="{ 'is-compact': compact }"
    data-test="runtime-scene-device-flow"
  >
    <template v-if="devices.length">
      <!-- Canvas wrapper: sized to computed layout, centered in container -->
      <div
        class="runtime-scene-device-flow__canvas"
        :style="{ width: layout.canvasWidth + 'px', height: layout.canvasHeight + 'px' }"
      >
        <!-- SVG Connection Layer -->
        <svg
          class="runtime-scene-device-flow__connections"
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
        <div class="runtime-scene-device-flow__nodes">
          <TopologyDeviceNode
            v-for="node in deviceLayoutNodes"
            :key="node.id"
            :device="node.device!"
            :selected="selectedDeviceId === node.device!.id"
            :traced="tracePathNodes.length > 0 && isTraced(node.device!.id)"
            :blocking="isBlocking(node.device!.id)"
            :dimmed="tracePathNodes.length > 0 && !isTraced(node.device!.id)"
            :signal-text="signalText(node.device!)"
            :signal-class="signalClass(node.device!)"
            :trace-actions="traceActionsFor(node.device!.id)"
            :show-role-details="showRoleDetails"
            :compact="compact"
            :style="{ left: node.x + 'px', top: node.y + 'px' }"
            data-test="runtime-scene-device"
            @click="handleClick"
            @dblclick="handleDblClick"
            @contextmenu="handleNodeContextMenu"
          />
        </div>
      </div>
    </template>

    <div
      v-if="!devices.length"
      class="runtime-scene-device-flow__empty"
    >
      暂无设备拓扑数据
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import TopologyDeviceNode from './TopologyDeviceNode.vue'
import type { RuntimeTraceDeviceAction, RuntimeTraceDevicePathNode } from '@/types/runtime'
import { useTopologyLayout } from '@/composables/useTopologyLayout'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'
import type {
  ExplicitLayoutEdge,
  LayoutNodeInput
} from '@/utils/runtime-topology'

const props = withDefaults(
  defineProps<{
    devices?: RuntimeSceneDeviceNode[]
    selectedDeviceId?: number | null
    tracePathNodes?: RuntimeTraceDevicePathNode[]
    blockingDeviceId?: number | null
    compact?: boolean
    showRoleDetails?: boolean
    /**
     * Optional explicit topology nodes (devices + rack-positions). When
     * provided together with `explicitEdges`, layout uses manifest-driven
     * mode rather than the device-only fallback. Wired via getters so a
     * late-arriving manifest still triggers layout recomputation.
     */
    explicitNodes?: LayoutNodeInput[]
    explicitEdges?: ExplicitLayoutEdge[]
  }>(),
  {
    devices: () => [],
    selectedDeviceId: null,
    tracePathNodes: () => [],
    blockingDeviceId: null,
    compact: false,
    showRoleDetails: true,
    explicitNodes: undefined,
    explicitEdges: undefined
  }
)

const emit = defineEmits<{
  select: [deviceId: number]
  sendEvent: [deviceId: number]
  showContextMenu: [payload: { deviceId: number; x: number; y: number }]
}>()

// Layout computation. All inputs as getters so late-arriving manifest
// edges / config changes correctly trigger layout recomputation.
const { layout } = useTopologyLayout(() => props.devices, {
  compact: () => props.compact,
  explicitNodes: () => props.explicitNodes,
  explicitEdges: () => props.explicitEdges
})

// Filter to device nodes only — fallback layout never produces rack-position
// nodes; this guard satisfies the discriminated-union narrowing for templates.
const deviceLayoutNodes = computed(() =>
  layout.value.nodes.filter(node => node.kind === 'device')
)

// Trace & selection helpers
const tracedDeviceIds = computed(() => new Set(props.tracePathNodes.map(n => n.device_id)))

function isTraced(deviceId: number): boolean {
  return tracedDeviceIds.value.has(deviceId)
}

function isBlocking(deviceId: number): boolean {
  return props.blockingDeviceId === deviceId
}

function traceNodeFor(deviceId: number): RuntimeTraceDevicePathNode | undefined {
  return props.tracePathNodes.find(n => n.device_id === deviceId)
}

function traceActionsFor(deviceId: number): RuntimeTraceDeviceAction[] {
  return traceNodeFor(deviceId)?.actions ?? []
}

// Event handlers
function handleClick(deviceId: number): void {
  emit('select', deviceId)
}

function handleDblClick(deviceId: number): void {
  emit('sendEvent', deviceId)
}

function handleNodeContextMenu(event: MouseEvent, deviceId: number): void {
  emit('select', deviceId)
  emit('showContextMenu', { deviceId, x: event.clientX, y: event.clientY })
}

// Signal computation
function signalText(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return `ERROR: ${device.errorCode}`
  if (device.runtimeHoldCount > 0) return '异常待处置'
  if (device.blockedOutboxCount > 0) return '等待设备空闲'
  if (device.currentCommandId) return '执行中'
  return '空闲'
}

function signalClass(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return 'is-danger'
  if (device.runtimeHoldCount > 0) return 'is-danger'
  if (device.blockedOutboxCount > 0) return 'is-warning'
  if (device.currentCommandId) return 'is-primary'
  return 'is-idle'
}
</script>

<style scoped>
.runtime-scene-device-flow {
  position: relative;
  display: flex;
  justify-content: center;
  overflow: auto;
  background:
    radial-gradient(circle, rgb(245 158 11 / 0.04) 1px, transparent 1px),
    linear-gradient(180deg, rgb(15 23 42), rgb(10 15 30));
  background-size:
    20px 20px,
    100% 100%;
  border-radius: 12px;
  border: 1px solid var(--runtime-border);
  min-height: 240px;
  padding: 24px;
}

/* Canvas wrapper: sized to computed layout, centered by flex */
.runtime-scene-device-flow__canvas {
  position: relative;
  flex-shrink: 0;
}

/* SVG Connection Layer */
.runtime-scene-device-flow__connections {
  position: absolute;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 1;
}

/* Node Layer */
.runtime-scene-device-flow__nodes {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 2;
}

/* Flow line base styles */
.flow-line {
  fill: none;
  stroke-width: 2;
  transition: stroke 200ms ease-out;
}

.flow-line--idle {
  stroke: rgb(245 158 11 / 0.25);
}

.flow-line--active {
  stroke: #f59e0b;
  stroke-dasharray: 8, 6;
  animation: topology-dash 20s linear infinite;
}

.flow-line--fault {
  stroke: #dc2626;
  stroke-width: 2.5;
  stroke-dasharray: 6, 4;
  animation: topology-dash 8s linear infinite;
}

.flow-line--warning {
  stroke: #eab308;
  stroke-dasharray: 6, 5;
  animation: topology-dash 15s linear infinite;
}

@keyframes topology-dash {
  to {
    stroke-dashoffset: -1000;
  }
}

/* Empty state */
.runtime-scene-device-flow__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 200px;
  padding: 32px;
  color: var(--runtime-text-muted);
  font-size: 13px;
}
</style>
