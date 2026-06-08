<template>
  <div
    class="runtime-scene-device-flow"
    :class="{ 'is-compact': compact }"
    data-test="runtime-scene-device-flow"
  >
    <template
      v-for="(device, index) in devices"
      :key="device.id"
    >
      <button
        type="button"
        class="runtime-scene-device-flow__device"
        :class="[
          statusClass(device.status),
          {
            'is-selected': selectedDeviceId === device.id,
            'is-traced': tracePathNodes.length > 0 && isTraced(device.id),
            'is-blocking': isBlocking(device.id),
            'has-runtime-hold': hasRuntimeHold(device),
            'has-parked-outbox': getBlockedOutboxCount(device) > 0,
            'is-dimmed': tracePathNodes.length > 0 && !isTraced(device.id)
          }
        ]"
        data-test="runtime-scene-device"
        @click="handleClick(device.id)"
        @dblclick="emit('sendEvent', device.id)"
        @contextmenu.prevent="handleContextMenu($event, device.id)"
      >
        <div class="runtime-scene-device-flow__device-top">
          <RuntimeStatusBadge
            :status="device.status"
            size="small"
          />
          <span class="runtime-scene-device-flow__role">
            {{ device.deviceRole }} · #{{ device.roleIndex }}
          </span>
          <span
            v-if="device.maintenanceMode"
            class="runtime-scene-device-flow__maintenance"
          >
            维护
          </span>
        </div>
        <div class="runtime-scene-device-flow__name">{{ device.deviceName }}</div>
        <div class="runtime-scene-device-flow__code">{{ device.deviceCode }}</div>
        <div
          class="runtime-scene-device-flow__signal"
          :class="signalClass(device)"
        >
          {{ signalText(device) }}
        </div>
        <div
          v-if="device.openCommandCount > 0"
          class="runtime-scene-device-flow__open-command-badge"
          data-test="runtime-scene-device-open-command"
        >
          {{ device.openCommandCount }} 未完成命令
        </div>
        <div
          v-if="hasRuntimeHold(device)"
          class="runtime-scene-device-flow__hold-badge"
          data-test="runtime-scene-device-runtime-hold"
        >
          Runtime Hold {{ device.runtimeHoldCount }}
        </div>
        <div
          v-if="getBlockedOutboxCount(device) > 0"
          class="runtime-scene-device-flow__parked-badge"
          data-test="runtime-scene-device-parked-outbox"
        >
          {{ getBlockedOutboxCount(device) }} 已停靠
        </div>
        <div
          v-if="isTraced(device.id) && traceActionsFor(device.id).length"
          class="runtime-scene-device-flow__trace-actions"
        >
          <span
            v-for="(action, idx) in traceActionsFor(device.id).slice(0, 3)"
            :key="idx"
            class="runtime-scene-device-flow__trace-action"
          >
            {{ action.label }}
          </span>
          <span
            v-if="traceActionsFor(device.id).length > 3"
            class="runtime-scene-device-flow__trace-more"
          >
            +{{ traceActionsFor(device.id).length - 3 }}
          </span>
        </div>
        <div
          v-if="isBlocking(device.id)"
          class="runtime-scene-device-flow__blocking-badge"
        >
          BLOCKED
        </div>
      </button>
      <div
        v-if="index < devices.length - 1"
        class="runtime-scene-device-flow__edge"
      >
        <span class="runtime-scene-device-flow__edge-line" />
        <span class="runtime-scene-device-flow__edge-arrow">→</span>
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
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeTraceDeviceAction, RuntimeTraceDevicePathNode } from '@/types/runtime'
import { resolveRuntimeTone } from '@/utils/runtime-display'
import type { RuntimeSceneDeviceNode } from '@/utils/runtime-scene'

const props = withDefaults(
  defineProps<{
    devices?: RuntimeSceneDeviceNode[]
    selectedDeviceId?: number | null
    sessionCountsByDevice?: Map<number, number> | Record<number, number>
    tracePathNodes?: RuntimeTraceDevicePathNode[]
    blockingDeviceId?: number | null
    compact?: boolean
  }>(),
  {
    devices: () => [],
    selectedDeviceId: null,
    sessionCountsByDevice: undefined,
    tracePathNodes: () => [],
    blockingDeviceId: null,
    compact: false
  }
)

const emit = defineEmits<{
  select: [deviceId: number]
  sendEvent: [deviceId: number]
  showContextMenu: [payload: { deviceId: number; x: number; y: number }]
}>()

const tracedDeviceIds = computed(() => new Set(props.tracePathNodes.map(n => n.device_id)))

function isTraced(deviceId: number): boolean {
  return tracedDeviceIds.value.has(deviceId)
}

function getBlockedOutboxCount(device: RuntimeSceneDeviceNode): number {
  return device.blockedOutboxCount
}

function hasRuntimeHold(device: RuntimeSceneDeviceNode): boolean {
  return device.runtimeHoldCount > 0
}

function handleClick(deviceId: number): void {
  emit('select', deviceId)
}

function handleContextMenu(event: MouseEvent, deviceId: number): void {
  emit('select', deviceId)
  emit('showContextMenu', { deviceId, x: event.clientX, y: event.clientY })
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

function statusClass(status: string): string {
  return `is-${resolveRuntimeTone(status)}`
}

function getSessionCount(deviceId: number): number {
  const map = props.sessionCountsByDevice
  if (!map) return 0
  if (map instanceof Map) return map.get(deviceId) ?? 0
  return map[deviceId] ?? 0
}

function signalText(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return `ERROR: ${device.errorCode}`
  if (hasRuntimeHold(device)) return '异常待处置'
  const sessionCount = getSessionCount(device.id)
  if (sessionCount > 0) return `${sessionCount}条等待`
  if (getBlockedOutboxCount(device) > 0) return '等待设备空闲'
  if (device.currentCommandId) return '执行中'
  return '空闲'
}

function signalClass(device: RuntimeSceneDeviceNode): string {
  if (device.errorCode) return 'is-danger'
  if (hasRuntimeHold(device)) return 'is-danger'
  const sessionCount = getSessionCount(device.id)
  if (sessionCount > 0) return 'is-warning'
  if (getBlockedOutboxCount(device) > 0) return 'is-warning'
  if (device.currentCommandId) return 'is-primary'
  return 'is-idle'
}
</script>

<style scoped>
.runtime-scene-device-flow {
  display: flex;
  align-items: stretch;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.runtime-scene-device-flow__device {
  min-width: 240px;
  min-height: 120px;
  padding: 18px;
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 8px;
  background: var(--runtime-surface);
  text-align: left;
  cursor: pointer;
  transition:
    transform 150ms ease-out,
    border-color 150ms ease-out,
    background 150ms ease-out;
}

.runtime-scene-device-flow__device:hover {
  transform: translateY(-2px);
  border-color: rgb(245, 158, 11, 0.3);
}

.runtime-scene-device-flow__device.is-selected {
  box-shadow: inset 0 0 0 1px rgb(245, 158, 11, 0.34);
}

.runtime-scene-device-flow__device.is-dimmed {
  opacity: 0.35;
}

.runtime-scene-device-flow__device.is-traced {
  border-color: rgb(59, 130, 246, 0.4);
}

.runtime-scene-device-flow__device.is-blocking {
  border-color: rgb(220, 38, 38, 0.6);
  box-shadow: 0 0 12px rgb(220, 38, 38, 0.2);
}

.runtime-scene-device-flow__device.has-runtime-hold {
  border-color: rgb(239, 68, 68, 0.52);
}

.runtime-scene-device-flow__device.has-parked-outbox {
  box-shadow: inset 0 0 0 1px rgb(245, 158, 11, 0.18);
}

.runtime-scene-device-flow__device.is-danger {
  border-color: rgb(220, 38, 38, 0.4);
}

.runtime-scene-device-flow__device.is-warning {
  border-color: rgb(234, 179, 8, 0.36);
}

.runtime-scene-device-flow__device.is-success {
  border-color: rgb(22, 163, 74, 0.28);
}

.runtime-scene-device-flow__device.is-primary {
  border-color: rgb(59, 130, 246, 0.32);
}

.runtime-scene-device-flow__device-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.runtime-scene-device-flow__role {
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.runtime-scene-device-flow__maintenance {
  margin-left: auto;
  padding: 2px 6px;
  border-radius: 4px;
  background: rgb(234, 179, 8, 0.12);
  color: #eab308;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.runtime-scene-device-flow__name {
  margin-top: 14px;
  color: var(--runtime-text-primary);
  font-size: 18px;
  font-weight: 700;
}

.runtime-scene-device-flow__code {
  margin-top: 4px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-family: var(--font-mono);
}

.runtime-scene-device-flow__signal {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.runtime-scene-device-flow__signal.is-danger {
  color: #dc2626;
}

.runtime-scene-device-flow__signal.is-warning {
  color: #d97706;
}

.runtime-scene-device-flow__signal.is-primary {
  color: #2563eb;
}

.runtime-scene-device-flow__signal.is-idle {
  color: var(--runtime-text-muted);
}

.runtime-scene-device-flow__open-command-badge,
.runtime-scene-device-flow__hold-badge,
.runtime-scene-device-flow__parked-badge {
  margin-top: 8px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.runtime-scene-device-flow__open-command-badge {
  background: rgb(245, 158, 11, 0.15);
  color: #fbbf24;
}

.runtime-scene-device-flow__hold-badge {
  border: 1px solid rgb(239, 68, 68, 0.3);
  background: rgb(239, 68, 68, 0.14);
  color: #fca5a5;
}

.runtime-scene-device-flow__parked-badge {
  border: 1px solid rgb(245, 158, 11, 0.28);
  background: rgb(245, 158, 11, 0.1);
  color: #fde68a;
}

.runtime-scene-device-flow__trace-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.runtime-scene-device-flow__trace-action {
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
  font-size: 9px;
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.runtime-scene-device-flow__trace-more {
  color: var(--runtime-text-muted);
  font-size: 9px;
  font-family: var(--font-mono);
}

.runtime-scene-device-flow__blocking-badge {
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

.runtime-scene-device-flow__edge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 36px;
}

.runtime-scene-device-flow__edge-line {
  width: 36px;
  height: 2px;
  background: linear-gradient(90deg, rgb(245, 158, 11, 0.18), rgb(245, 158, 11, 0.88));
}

.runtime-scene-device-flow__edge-arrow {
  color: #f59e0b;
  font-family: var(--font-mono);
  font-size: 12px;
}

.runtime-scene-device-flow__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 32px;
  color: var(--runtime-text-muted);
  font-size: 13px;
}

.runtime-scene-device-flow.is-compact {
  gap: 8px;
}

.runtime-scene-device-flow.is-compact .runtime-scene-device-flow__device {
  min-width: 100px;
  min-height: 80px;
  padding: 10px;
}

.runtime-scene-device-flow.is-compact .runtime-scene-device-flow__device-top {
  flex-wrap: wrap;
  gap: 6px;
}

.runtime-scene-device-flow.is-compact .runtime-scene-device-flow__role {
  order: 1;
  width: 100%;
  font-size: 10px;
}

.runtime-scene-device-flow.is-compact .runtime-scene-device-flow__maintenance {
  order: 0;
}

.runtime-scene-device-flow.is-compact .runtime-scene-device-flow__name {
  margin-top: 6px;
  font-size: 13px;
}

.runtime-scene-device-flow.is-compact .runtime-scene-device-flow__code {
  font-size: 10px;
}

.runtime-scene-device-flow.is-compact .runtime-scene-device-flow__signal {
  padding: 3px 0;
  font-size: 10px;
}

.runtime-scene-device-flow.is-compact .runtime-scene-device-flow__edge {
  gap: 8px;
}

.runtime-scene-device-flow.is-compact .runtime-scene-device-flow__edge-line {
  width: 20px;
}
</style>
