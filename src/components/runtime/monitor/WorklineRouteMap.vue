<template>
  <div
    class="workline-route-map"
    :class="{ 'is-compact': compact }"
  >
    <template
      v-for="(device, index) in devices"
      :key="device.id"
    >
      <button
        type="button"
        class="workline-route-map__node"
        :class="[
          statusClass(device.device_status),
          {
            'is-selected': selectedDeviceId === device.id,
            'is-traced': tracePathNodes.length > 0 && isTraced(device.id),
            'is-blocking': isBlocking(device.id),
            'has-runtime-hold': hasRuntimeHold(device),
            'has-parked-outbox': getBlockedOutboxCount(device) > 0,
            'is-dimmed': tracePathNodes.length > 0 && !isTraced(device.id)
          }
        ]"
        @click="handleClick(device.id)"
        @dblclick="emit('sendEvent', device.id)"
        @contextmenu.prevent="handleContextMenu($event, device.id)"
      >
        <div class="workline-route-map__node-top">
          <RuntimeStatusBadge
            :status="device.device_status"
            size="small"
          />
          <span class="workline-route-map__role">
            {{ device.device_role }} · #{{ device.role_index }}
          </span>
          <span
            v-if="device.maintenance_mode"
            class="workline-route-map__maintenance"
          >
            维护
          </span>
        </div>
        <div class="workline-route-map__name">{{ device.device_name }}</div>
        <div class="workline-route-map__code">{{ device.device_code }}</div>
        <div
          class="workline-route-map__signal"
          :class="signalClass(device)"
        >
          {{ signalText(device) }}
        </div>
        <div
          v-if="getDeviceOpenCommandCount(device) > 0"
          class="workline-route-map__open-command-badge"
        >
          {{ getDeviceOpenCommandCount(device) }} 未完成命令
        </div>
        <div
          v-if="hasRuntimeHold(device)"
          class="workline-route-map__hold-badge"
        >
          Runtime Hold {{ getRuntimeHoldCount(device) }}
        </div>
        <div
          v-if="getBlockedOutboxCount(device) > 0"
          class="workline-route-map__parked-badge"
        >
          {{ getBlockedOutboxCount(device) }} 已停靠
        </div>
        <div
          v-if="isTraced(device.id) && traceActionsFor(device.id).length"
          class="workline-route-map__trace-actions"
        >
          <span
            v-for="(action, idx) in traceActionsFor(device.id).slice(0, 3)"
            :key="idx"
            class="workline-route-map__trace-action"
          >
            {{ action.label }}
          </span>
          <span
            v-if="traceActionsFor(device.id).length > 3"
            class="workline-route-map__trace-more"
          >
            +{{ traceActionsFor(device.id).length - 3 }}
          </span>
        </div>
        <div
          v-if="isBlocking(device.id)"
          class="workline-route-map__blocking-badge"
        >
          BLOCKED
        </div>
      </button>
      <div
        v-if="index < devices.length - 1"
        class="workline-route-map__edge"
      >
        <span class="workline-route-map__edge-line" />
        <span class="workline-route-map__edge-arrow">→</span>
      </div>
    </template>

    <div
      v-if="!devices.length"
      class="workline-route-map__empty"
    >
      暂无设备拓扑数据
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type {
  RuntimeTraceDeviceAction,
  RuntimeTraceDevicePathNode,
  RuntimeWorklineDeviceItem
} from '@/types/runtime'
import { resolveRuntimeTone } from '@/utils/runtime-display'

const props = withDefaults(
  defineProps<{
    devices?: RuntimeWorklineDeviceItem[]
    selectedDeviceId?: number | null
    sessionCountsByDevice?: Map<number, number> | Record<number, number>
    tracePathNodes?: RuntimeTraceDevicePathNode[]
    blockingDeviceId?: number | null
    compact?: boolean
    openCommandCountsByDevice?: Map<number, number> | Record<number, number>
    showQuickActions?: boolean
  }>(),
  {
    devices: () => [],
    selectedDeviceId: null,
    sessionCountsByDevice: undefined,
    tracePathNodes: () => [],
    blockingDeviceId: null,
    compact: false,
    openCommandCountsByDevice: undefined,
    showQuickActions: false
  }
)

const emit = defineEmits<{
  select: [deviceId: number]
  sendEvent: [deviceId: number]
  viewOutbox: [deviceId: number]
  showContextMenu: [payload: { deviceId: number; x: number; y: number }]
}>()

const tracedDeviceIds = computed(() => new Set(props.tracePathNodes.map(n => n.device_id)))

function isTraced(deviceId: number) {
  return tracedDeviceIds.value.has(deviceId)
}

function getDeviceOpenCommandCount(device: RuntimeWorklineDeviceItem): number {
  const map = props.openCommandCountsByDevice
  if (map instanceof Map) return map.get(device.id) ?? 0
  if (map) return map[device.id] ?? 0
  return device.open_command_count ?? device.pending_command_count ?? 0
}

function getBlockedOutboxCount(device: RuntimeWorklineDeviceItem): number {
  return device.blocked_outbox_count ?? 0
}

function getRuntimeHoldCount(device: RuntimeWorklineDeviceItem): number {
  return device.active_runtime_hold_ids?.length || device.open_issue_count || 0
}

function hasRuntimeHold(device: RuntimeWorklineDeviceItem): boolean {
  return getRuntimeHoldCount(device) > 0
}

function handleClick(deviceId: number) {
  emit('select', deviceId)
}

function handleContextMenu(event: MouseEvent, deviceId: number) {
  // 选中设备并显示右键菜单
  emit('select', deviceId)
  emit('showContextMenu', { deviceId, x: event.clientX, y: event.clientY })
}

function isBlocking(deviceId: number) {
  return props.blockingDeviceId === deviceId
}

function traceNodeFor(deviceId: number): RuntimeTraceDevicePathNode | undefined {
  return props.tracePathNodes.find(n => n.device_id === deviceId)
}

function traceActionsFor(deviceId: number): RuntimeTraceDeviceAction[] {
  return traceNodeFor(deviceId)?.actions ?? []
}

function statusClass(status: string) {
  return `is-${resolveRuntimeTone(status)}`
}

function getSessionCount(deviceId: number): number {
  const map = props.sessionCountsByDevice
  if (!map) return 0
  if (map instanceof Map) return map.get(deviceId) ?? 0
  return map[deviceId] ?? 0
}

function signalText(device: RuntimeWorklineDeviceItem): string {
  if (device.error_code) return `ERROR: ${device.error_code}`
  if (hasRuntimeHold(device)) return '异常待处置'
  if (getBlockedOutboxCount(device) > 0) return '等待设备空闲'
  const sessionCount = getSessionCount(device.id)
  if (sessionCount > 0) return `${sessionCount}条等待`
  if (device.current_command_id) return '执行中'
  return '空闲'
}

function signalClass(device: RuntimeWorklineDeviceItem): string {
  if (device.error_code) return 'is-danger'
  if (hasRuntimeHold(device)) return 'is-danger'
  if (getBlockedOutboxCount(device) > 0) return 'is-warning'
  const sessionCount = getSessionCount(device.id)
  if (sessionCount > 0) return 'is-warning'
  if (device.current_command_id) return 'is-primary'
  return 'is-idle'
}
</script>

<style scoped>
.workline-route-map {
  display: flex;
  align-items: stretch;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.workline-route-map__node {
  min-width: 240px;
  min-height: 120px;
  padding: 18px;
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 16px;
  background: var(--runtime-surface);
  text-align: left;
  cursor: pointer;
  transition:
    transform 150ms ease-out,
    border-color 150ms ease-out,
    background 150ms ease-out,
    min-height 150ms ease-out;
}

.workline-route-map__node:hover {
  transform: translateY(-2px);
  border-color: rgb(245, 158, 11, 0.3);
}

.workline-route-map__node.is-selected {
  box-shadow: inset 0 0 0 1px rgb(245, 158, 11, 0.34);
}

.workline-route-map__node.is-dimmed {
  opacity: 0.35;
}

.workline-route-map__node.is-traced {
  border-color: rgb(59, 130, 246, 0.4);
}

.workline-route-map__node.is-blocking {
  border-color: rgb(220, 38, 38, 0.6);
  box-shadow: 0 0 12px rgb(220, 38, 38, 0.2);
}

.workline-route-map__node.has-runtime-hold {
  border-color: rgb(239, 68, 68, 0.52);
}

.workline-route-map__node.has-parked-outbox {
  box-shadow: inset 0 0 0 1px rgb(245, 158, 11, 0.18);
}

.workline-route-map__node.is-danger {
  border-color: rgb(220, 38, 38, 0.4);
}

.workline-route-map__node.is-warning {
  border-color: rgb(234, 179, 8, 0.36);
}

.workline-route-map__node.is-success {
  border-color: rgb(22, 163, 74, 0.28);
}

.workline-route-map__node.is-primary {
  border-color: rgb(59, 130, 246, 0.32);
}

.workline-route-map__node-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.workline-route-map__role {
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.workline-route-map__maintenance {
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

.workline-route-map__name {
  margin-top: 14px;
  color: var(--runtime-text-primary);
  font-size: 18px;
  font-weight: 700;
}

.workline-route-map__code {
  margin-top: 4px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-family: var(--font-mono);
}

.workline-route-map__signal {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.workline-route-map__signal.is-danger {
  color: #dc2626;
}

.workline-route-map__signal.is-warning {
  color: #d97706;
}

.workline-route-map__signal.is-idle {
  color: var(--runtime-text-muted);
}

.workline-route-map__edge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 36px;
}

.workline-route-map__edge-line {
  width: 36px;
  height: 2px;
  background: linear-gradient(90deg, rgb(245, 158, 11, 0.18), rgb(245, 158, 11, 0.88));
}

.workline-route-map__edge-arrow {
  color: #f59e0b;
  font-family: var(--font-mono);
  font-size: 12px;
}

.workline-route-map__trace-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 8px;
}

.workline-route-map__trace-action {
  padding: 1px 5px;
  border-radius: 3px;
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
  font-size: 9px;
  font-family: var(--font-mono);
  font-weight: 600;
  letter-spacing: 0.03em;
}

.workline-route-map__trace-more {
  color: var(--runtime-text-muted);
  font-size: 9px;
  font-family: var(--font-mono);
}

.workline-route-map__blocking-badge {
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

.workline-route-map__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 32px;
  color: var(--runtime-text-muted);
  font-size: 13px;
}

/* 紧凑模式 */
.workline-route-map.is-compact {
  gap: 8px;
}

.workline-route-map.is-compact .workline-route-map__node {
  min-width: 100px;
  min-height: 80px;
  padding: 10px;
  border-radius: 8px;
}

.workline-route-map.is-compact .workline-route-map__node-top {
  flex-wrap: wrap;
  gap: 6px;
}

.workline-route-map.is-compact .workline-route-map__role {
  font-size: 10px;
  order: 1;
  width: 100%;
}

.workline-route-map.is-compact .workline-route-map__maintenance {
  order: 0;
}

.workline-route-map.is-compact .workline-route-map__name {
  margin-top: 6px;
  font-size: 13px;
}

.workline-route-map.is-compact .workline-route-map__code {
  font-size: 10px;
}

.workline-route-map.is-compact .workline-route-map__signal {
  font-size: 10px;
  padding: 3px 0;
}

.workline-route-map.is-compact .workline-route-map__edge {
  gap: 8px;
}

.workline-route-map.is-compact .workline-route-map__edge-line {
  width: 20px;
}

.workline-route-map__open-command-badge,
.workline-route-map__hold-badge,
.workline-route-map__parked-badge {
  margin-top: 8px;
  padding: 3px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 700;
  text-align: center;
}

.workline-route-map__open-command-badge {
  background: rgb(245, 158, 11, 0.15);
  color: #fbbf24;
}

.workline-route-map__hold-badge {
  border: 1px solid rgb(239, 68, 68, 0.3);
  background: rgb(239, 68, 68, 0.14);
  color: #fca5a5;
}

.workline-route-map__parked-badge {
  border: 1px solid rgb(245, 158, 11, 0.28);
  background: rgb(245, 158, 11, 0.1);
  color: #fde68a;
}

/* Quick Actions */
.workline-route-map__quick-actions {
  display: flex;
  gap: 6px;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--runtime-badge-info-border);
}

.workline-route-map__quick-action {
  flex: 1;
  padding: 6px 8px;
  border: 1px solid var(--runtime-badge-info-border);
  border-radius: 6px;
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
  font-size: 11px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.workline-route-map__quick-action:hover {
  background: rgb(6, 182, 212, 0.2);
  border-color: rgb(6, 182, 212, 0.5);
}
</style>
