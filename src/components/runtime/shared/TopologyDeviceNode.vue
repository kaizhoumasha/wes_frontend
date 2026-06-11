<template>
  <button
    type="button"
    class="topology-device-node"
    :class="[
      statusClass(device.status),
      {
        'is-selected': selected,
        'is-traced': traced,
        'is-blocking': blocking,
        'is-dimmed': dimmed,
        'has-runtime-hold': device.runtimeHoldCount > 0,
        'has-parked-outbox': device.blockedOutboxCount > 0,
        'is-compact': compact,
      },
    ]"
    data-test="topology-device-node"
    @click="$emit('click', device.id)"
    @dblclick="$emit('dblclick', device.id)"
    @contextmenu.prevent="$emit('contextmenu', $event, device.id)"
  >
    <div class="topology-device-node__top">
      <RuntimeStatusBadge :status="device.status" size="small" />
      <span v-if="showRoleDetails" class="topology-device-node__role">
        {{ device.deviceRole }} · #{{ device.roleIndex }}
      </span>
      <span v-if="device.maintenanceMode" class="topology-device-node__maintenance">
        维护
      </span>
    </div>
    <div class="topology-device-node__name">{{ device.deviceName }}</div>
    <div class="topology-device-node__code">{{ device.deviceCode }}</div>
    <div class="topology-device-node__signal" :class="computedSignalClass">
      {{ computedSignalText }}
    </div>

    <!-- Rack Occupancy Mini Matrix -->
    <div v-if="occupancy" class="topology-device-node__occupancy">
      <div class="topology-device-node__occupancy-grid">
        <div
          v-for="slot in occupancy.slots"
          :key="slot.code"
          class="topology-device-node__occupancy-cell"
          :class="[`is-${slot.state}`]"
          :title="slot.code"
        />
      </div>
      <div class="topology-device-node__occupancy-summary">
        <span class="topology-device-node__occupancy-stat">
          {{ occupancy.occupiedSlots }}/{{ occupancy.totalSlots }}
        </span>
        <span v-if="occupancy.auditSlots > 0" class="topology-device-node__occupancy-audit">
          {{ occupancy.auditSlots }} 对账异常
        </span>
      </div>
    </div>

    <div
      v-if="device.openCommandCount > 0"
      class="topology-device-node__badge topology-device-node__badge--command"
      data-test="topology-device-open-command"
    >
      {{ device.openCommandCount }} 未完成命令
    </div>
    <div
      v-if="device.runtimeHoldCount > 0"
      class="topology-device-node__badge topology-device-node__badge--hold"
      data-test="topology-device-runtime-hold"
    >
      Runtime Hold {{ device.runtimeHoldCount }}
    </div>
    <div
      v-if="device.blockedOutboxCount > 0"
      class="topology-device-node__badge topology-device-node__badge--parked"
      data-test="topology-device-parked-outbox"
    >
      {{ device.blockedOutboxCount }} 已停靠
    </div>

    <div
      v-if="traced && traceActions.length"
      class="topology-device-node__trace-actions"
    >
      <span
        v-for="(action, idx) in traceActions.slice(0, 3)"
        :key="idx"
        class="topology-device-node__trace-action"
      >
        {{ action.label }}
      </span>
      <span v-if="traceActions.length > 3" class="topology-device-node__trace-more">
        +{{ traceActions.length - 3 }}
      </span>
    </div>

    <div v-if="blocking" class="topology-device-node__blocking-badge">
      BLOCKED
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeTraceDeviceAction } from '@/types/runtime'
import { resolveRuntimeTone } from '@/utils/runtime-display'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'
import type { RackOccupancySummary } from '@/utils/runtime-topology'

const props = withDefaults(
  defineProps<{
    device: RuntimeSceneDeviceNode
    selected?: boolean
    traced?: boolean
    blocking?: boolean
    dimmed?: boolean
    signalText?: string
    signalClass?: string
    traceActions?: RuntimeTraceDeviceAction[]
    showRoleDetails?: boolean
    compact?: boolean
    occupancy?: RackOccupancySummary
  }>(),
  {
    selected: false,
    traced: false,
    blocking: false,
    dimmed: false,
    signalText: '',
    signalClass: 'is-idle',
    traceActions: () => [],
    showRoleDetails: true,
    compact: false,
    occupancy: undefined,
  }
)

defineEmits<{
  click: [deviceId: number]
  dblclick: [deviceId: number]
  contextmenu: [event: MouseEvent, deviceId: number]
}>()

const computedSignalText = computed(() => props.signalText || '空闲')
const computedSignalClass = computed(() => props.signalClass || 'is-idle')

function statusClass(status: string): string {
  return `is-${resolveRuntimeTone(status)}`
}
</script>

<style scoped>
.topology-device-node {
  position: absolute;
  width: 190px;
  min-height: 120px;
  padding: 18px;
  border: 1px solid rgb(245 158 11 / 0.16);
  border-radius: 8px;
  background: var(--runtime-surface);
  text-align: left;
  cursor: pointer;
  transition:
    transform 200ms ease-out,
    border-color 200ms ease-out,
    box-shadow 200ms ease-out;
  z-index: 2;
}

.topology-device-node:hover {
  transform: translateY(-4px);
  border-color: rgb(245 158 11 / 0.3);
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.2);
}

.topology-device-node.is-selected {
  box-shadow: inset 0 0 0 1px rgb(245 158 11 / 0.34);
}

.topology-device-node.is-dimmed {
  opacity: 0.35;
}

.topology-device-node.is-traced {
  border-color: rgb(59 130 246 / 0.4);
}

.topology-device-node.is-blocking {
  border-color: rgb(220 38 38 / 0.6);
  box-shadow: 0 0 12px rgb(220 38 38 / 0.2);
}

.topology-device-node.has-runtime-hold {
  border-color: rgb(239 68 68 / 0.52);
}

.topology-device-node.has-parked-outbox {
  box-shadow: inset 0 0 0 1px rgb(245 158 11 / 0.18);
}

/* Status tones */
.topology-device-node.is-danger {
  border-color: rgb(220 38 38 / 0.4);
  animation: topology-node-danger-blink 1.5s infinite alternate;
}

.topology-device-node.is-warning {
  border-color: rgb(234 179 8 / 0.36);
}

.topology-device-node.is-success {
  border-color: rgb(22 163 74 / 0.28);
}

.topology-device-node.is-primary {
  border-color: rgb(59 130 246 / 0.32);
}

@keyframes topology-node-danger-blink {
  from {
    border-color: rgb(220 38 38 / 0.4);
    box-shadow: none;
  }
  to {
    border-color: rgb(252 165 165 / 0.8);
    box-shadow: 0 0 16px rgb(239 68 68 / 0.6);
  }
}

/* Inner elements */
.topology-device-node__top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.topology-device-node__role {
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.topology-device-node__maintenance {
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgb(234 179 8 / 0.12);
  color: #eab308;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.topology-device-node__name {
  min-width: 0;
  margin-top: 14px;
  color: var(--runtime-text-primary);
  font-size: 18px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.topology-device-node__code {
  min-width: 0;
  margin-top: 4px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.topology-device-node__signal {
  min-width: 0;
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.topology-device-node__signal.is-danger {
  color: #dc2626;
}

.topology-device-node__signal.is-warning {
  color: #d97706;
}

.topology-device-node__signal.is-primary {
  color: #2563eb;
}

.topology-device-node__signal.is-idle {
  color: var(--runtime-text-muted);
}

/* Rack Occupancy Mini Matrix */
.topology-device-node__occupancy {
  margin-top: 12px;
}

.topology-device-node__occupancy-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 4px;
  padding: 6px;
  background: rgb(15 23 42 / 0.5);
  border-radius: 6px;
  border: 1px solid rgb(51 65 85 / 0.3);
}

.topology-device-node__occupancy-cell {
  aspect-ratio: 1.4;
  border-radius: 3px;
  border: 1px solid rgb(51 65 85 / 0.4);
  background: rgb(30 41 59 / 0.3);
}

.topology-device-node__occupancy-cell.is-occupied {
  background: rgb(245 158 11 / 0.25);
  border-color: rgb(245 158 11 / 0.5);
}

.topology-device-node__occupancy-cell.is-audit {
  background: rgb(234 179 8 / 0.2);
  border-color: rgb(234 179 8 / 0.6);
  animation: topology-audit-blink 2s infinite;
}

@keyframes topology-audit-blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

.topology-device-node__occupancy-summary {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 4px;
  font-size: 10px;
  font-family: var(--font-mono);
}

.topology-device-node__occupancy-stat {
  color: var(--runtime-text-secondary);
}

.topology-device-node__occupancy-audit {
  color: #eab308;
  font-weight: 600;
}

/* Badges */
.topology-device-node__badge {
  margin-top: 8px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.topology-device-node__badge--command {
  background: rgb(245 158 11 / 0.15);
  color: #fbbf24;
}

.topology-device-node__badge--hold {
  border: 1px solid rgb(239 68 68 / 0.3);
  background: rgb(239 68 68 / 0.14);
  color: #fca5a5;
}

.topology-device-node__badge--parked {
  border: 1px solid rgb(245 158 11 / 0.28);
  background: rgb(245 158 11 / 0.1);
  color: #fde68a;
}

.topology-device-node__trace-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.topology-device-node__trace-action {
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
  font-size: 9px;
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.topology-device-node__trace-more {
  color: var(--runtime-text-muted);
  font-size: 9px;
  font-family: var(--font-mono);
}

.topology-device-node__blocking-badge {
  margin-top: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
  font-size: 9px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-align: center;
}

/* Compact mode */
.topology-device-node.is-compact {
  width: 120px;
  min-height: 80px;
  padding: 10px;
}

.topology-device-node.is-compact .topology-device-node__top {
  flex-wrap: wrap;
  gap: 6px;
}

.topology-device-node.is-compact .topology-device-node__role {
  order: 1;
  width: 100%;
  font-size: 10px;
}

.topology-device-node.is-compact .topology-device-node__maintenance {
  order: 0;
}

.topology-device-node.is-compact .topology-device-node__name {
  margin-top: 6px;
  font-size: 13px;
}

.topology-device-node.is-compact .topology-device-node__code {
  font-size: 10px;
}

.topology-device-node.is-compact .topology-device-node__signal {
  padding: 3px 0;
  font-size: 10px;
}
</style>
