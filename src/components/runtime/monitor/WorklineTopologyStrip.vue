<template>
  <div class="workline-topology-strip">
    <template
      v-for="(device, index) in devices"
      :key="device.id"
    >
      <button
        type="button"
        class="workline-topology-strip__node"
        :class="[
          statusClass(device.device_status),
          { 'is-selected': selectedDeviceId === device.id, 'is-interactive': interactive }
        ]"
        @click="emitSelect(device.id)"
      >
        <div class="workline-topology-strip__node-top">
          <RuntimeStatusBadge
            :status="device.device_status"
            size="small"
          />
          <span class="workline-topology-strip__role">
            {{ device.device_role }} · #{{ device.role_index }}
          </span>
          <span
            v-if="device.maintenance_mode"
            class="workline-topology-strip__maintenance"
          >
            维护
          </span>
        </div>
        <div class="workline-topology-strip__name">{{ device.device_name }}</div>
        <div class="workline-topology-strip__code">{{ device.device_code }}</div>
        <div
          class="workline-topology-strip__signal"
          :class="signalClass(device)"
        >
          {{ signalText(device) }}
        </div>
      </button>
      <div
        v-if="index < devices.length - 1"
        class="workline-topology-strip__edge"
      >
        <span class="workline-topology-strip__edge-line" />
        <span class="workline-topology-strip__edge-arrow">→</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeMonitorDeviceNode } from '@/types/runtime'
import { resolveRuntimeTone } from '@/utils/runtime-display'

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
    sessionCountsByDevice: undefined
  }
)

const emit = defineEmits<{
  select: [deviceId: number]
}>()

function statusClass(status: string) {
  return `is-${resolveRuntimeTone(status)}`
}

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

function signalText(device: RuntimeMonitorDeviceNode): string {
  if (device.error_code) return `ERROR: ${device.error_code}`
  const waiting = getSessionCount(device.id)
  if (waiting > 0) return `${waiting}条等待`
  return '空闲'
}

function signalClass(device: RuntimeMonitorDeviceNode): string {
  if (device.error_code) return 'is-danger'
  if (getSessionCount(device.id) > 0) return 'is-warning'
  return 'is-idle'
}
</script>

<style scoped>
.workline-topology-strip {
  display: flex;
  align-items: stretch;
  gap: 14px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.workline-topology-strip__node {
  min-width: 240px;
  padding: 18px;
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 16px;
  background: rgb(30, 41, 59, 0.78);
  text-align: left;
}

.workline-topology-strip__node.is-interactive {
  cursor: pointer;
  transition:
    transform 150ms ease-out,
    border-color 150ms ease-out,
    background 150ms ease-out;
}

.workline-topology-strip__node.is-interactive:hover {
  transform: translateY(-2px);
  border-color: rgb(245, 158, 11, 0.3);
}

.workline-topology-strip__node.is-selected {
  box-shadow: inset 0 0 0 1px rgb(245, 158, 11, 0.34);
}

.workline-topology-strip__node.is-danger {
  border-color: rgb(220, 38, 38, 0.4);
}

.workline-topology-strip__node.is-warning {
  border-color: rgb(234, 179, 8, 0.36);
}

.workline-topology-strip__node.is-success {
  border-color: rgb(22, 163, 74, 0.28);
}

.workline-topology-strip__node.is-primary {
  border-color: rgb(59, 130, 246, 0.32);
}

.workline-topology-strip__node-top {
  display: flex;
  align-items: center;
  gap: 12px;
}

.workline-topology-strip__role {
  color: #94a3b8;
  font-size: 12px;
}

.workline-topology-strip__maintenance {
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

.workline-topology-strip__name {
  margin-top: 14px;
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
}

.workline-topology-strip__code {
  margin-top: 4px;
  color: #94a3b8;
  font-size: 12px;
  font-family: var(--font-mono);
}

.workline-topology-strip__signal {
  margin-top: 12px;
  font-size: 13px;
  font-weight: 600;
  font-family: var(--font-mono);
}

.workline-topology-strip__signal.is-danger {
  color: #dc2626;
}

.workline-topology-strip__signal.is-warning {
  color: #d97706;
}

.workline-topology-strip__signal.is-idle {
  color: #64748b;
}

.workline-topology-strip__edge {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-width: 36px;
}

.workline-topology-strip__edge-line {
  width: 36px;
  height: 2px;
  background: linear-gradient(90deg, rgb(245, 158, 11, 0.18), rgb(245, 158, 11, 0.88));
}

.workline-topology-strip__edge-arrow {
  color: #f59e0b;
  font-family: var(--font-mono);
  font-size: 12px;
}
</style>
