<template>
  <div class="workline-topology-strip">
    <template v-for="(device, index) in devices" :key="device.id">
      <button
        type="button"
        class="workline-topology-strip__node"
        :class="[statusClass(device.device_status), { 'is-selected': selectedDeviceId === device.id, 'is-interactive': interactive }]"
        @click="emitSelect(device.id)"
      >
        <div class="workline-topology-strip__node-top">
          <RuntimeStatusBadge :status="device.device_status" size="small" />
          <span class="workline-topology-strip__role">{{ device.device_role }} · #{{ device.role_index }}</span>
        </div>
        <div class="workline-topology-strip__name">{{ device.device_name }}</div>
        <div class="workline-topology-strip__code">{{ device.device_code }}</div>
        <div class="workline-topology-strip__meta-grid">
          <div>
            <span>心跳</span>
            <strong>{{ formatRuntimeDateTime(device.last_heartbeat_at) }}</strong>
          </div>
          <div>
            <span>维护</span>
            <strong>{{ device.maintenance_mode ? 'ON' : 'OFF' }}</strong>
          </div>
          <div>
            <span>当前命令</span>
            <strong>{{ device.current_command_id || '—' }}</strong>
          </div>
          <div>
            <span>错误码</span>
            <strong>{{ device.error_code || '—' }}</strong>
          </div>
        </div>
      </button>
      <div v-if="index < devices.length - 1" class="workline-topology-strip__edge">
        <span class="workline-topology-strip__edge-line" />
        <span class="workline-topology-strip__edge-arrow">→</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeWorklineDeviceItem } from '@/types/runtime'
import { formatRuntimeDateTime, resolveRuntimeTone } from '@/utils/runtime-display'

const props = withDefaults(
  defineProps<{
    devices?: RuntimeWorklineDeviceItem[]
    selectedDeviceId?: number | null
    interactive?: boolean
  }>(),
  {
    devices: () => [],
    selectedDeviceId: null,
    interactive: true
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
  min-width: 280px;
  padding: 18px;
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 16px;
  background: rgb(30, 41, 59, 0.94);
  text-align: left;
}

.workline-topology-strip__node.is-interactive {
  cursor: pointer;
  transition:
    transform var(--duration-fast) var(--ease-out),
    border-color var(--duration-fast) var(--ease-out),
    background var(--duration-fast) var(--ease-out);
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
  justify-content: space-between;
  gap: 12px;
}

.workline-topology-strip__role,
.workline-topology-strip__meta-grid span,
.workline-topology-strip__code {
  color: #94a3b8;
  font-size: 12px;
}

.workline-topology-strip__name {
  margin-top: 14px;
  color: #f8fafc;
  font-size: 18px;
  font-weight: 700;
}

.workline-topology-strip__code {
  margin-top: 6px;
  font-family: var(--font-mono);
}

.workline-topology-strip__meta-grid {
  display: grid;
  gap: 12px;
  margin-top: 16px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.workline-topology-strip__meta-grid strong {
  display: block;
  margin-top: 6px;
  color: #e2e8f0;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
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
