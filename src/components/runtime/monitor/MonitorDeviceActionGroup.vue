<template>
  <div
    class="monitor-device-action-group"
    :data-mode="mode"
    data-test="monitor-device-action-group"
  >
    <template v-if="hasAvailableAction">
      <button
        v-if="mode === 'estop' && clearEstopEnabled"
        type="button"
        class="monitor-device-action-group__btn monitor-device-action-group__btn--primary"
        :disabled="busy"
        data-test="monitor-device-action-clear-estop"
        @click="emit('clear-estop')"
      >
        下发清除急停
      </button>

      <button
        v-if="mode === 'reconciliation' && resolveEnabled"
        type="button"
        class="monitor-device-action-group__btn monitor-device-action-group__btn--primary"
        :disabled="busy"
        data-test="monitor-device-action-resolve-reconciliation"
        @click="emit('resolve-reconciliation')"
      >
        人工确认对账
      </button>

      <button
        v-if="canManageMaintenance && !maintenanceActive"
        type="button"
        class="monitor-device-action-group__btn monitor-device-action-group__btn--ghost"
        :disabled="busy"
        data-test="monitor-device-action-enter-maintenance"
        @click="emit('enter-maintenance')"
      >
        进入维护
      </button>

      <button
        v-if="canManageMaintenance && maintenanceActive"
        type="button"
        class="monitor-device-action-group__btn monitor-device-action-group__btn--ghost"
        :disabled="busy"
        data-test="monitor-device-action-exit-maintenance"
        @click="emit('exit-maintenance')"
      >
        退出维护
      </button>
    </template>

    <p
      v-else
      class="monitor-device-action-group__empty"
      data-test="monitor-device-action-empty"
    >
      暂无可用直控动作
    </p>

    <p
      v-if="blockedReason"
      class="monitor-device-action-group__reason"
      data-test="monitor-device-action-blocked-reason"
    >
      {{ blockedReason }}
    </p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export type MonitorDeviceActionMode = 'idle' | 'estop' | 'reconciliation'

const props = withDefaults(
  defineProps<{
    mode: MonitorDeviceActionMode
    canClearEstop?: boolean
    canAttemptClear?: boolean
    canResolve?: boolean
    canManageMaintenance?: boolean
    maintenanceActive?: boolean
    busy?: boolean
    blockedReason?: string | null
  }>(),
  {
    canClearEstop: false,
    canAttemptClear: false,
    canResolve: false,
    canManageMaintenance: false,
    maintenanceActive: false,
    busy: false,
    blockedReason: null
  }
)

const emit = defineEmits<{
  (event: 'clear-estop'): void
  (event: 'resolve-reconciliation'): void
  (event: 'enter-maintenance'): void
  (event: 'exit-maintenance'): void
}>()

const clearEstopEnabled = computed(() => props.canClearEstop && props.canAttemptClear)
const resolveEnabled = computed(() => props.canResolve)

const hasPrimaryAction = computed(() => {
  if (props.mode === 'estop') return clearEstopEnabled.value
  if (props.mode === 'reconciliation') return resolveEnabled.value
  return false
})

const hasAvailableAction = computed(() => hasPrimaryAction.value || props.canManageMaintenance)
</script>

<style scoped>
.monitor-device-action-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  padding: 12px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 8px;
  background: var(--runtime-surface);
}

.monitor-device-action-group__btn {
  padding: 8px 14px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.1s ease;
}

.monitor-device-action-group__btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.monitor-device-action-group__btn:focus-visible {
  outline: 2px solid #f59e0b;
  outline-offset: 2px;
}

.monitor-device-action-group__btn--primary {
  background: #f59e0b;
  color: #0f172a;
}

.monitor-device-action-group__btn--primary:hover:not(:disabled) {
  background: #d97706;
}

.monitor-device-action-group__btn--ghost {
  border-color: rgb(245, 158, 11, 0.4);
  background: transparent;
  color: #f59e0b;
}

.monitor-device-action-group__btn--ghost:hover:not(:disabled) {
  background: rgb(245, 158, 11, 0.1);
}

.monitor-device-action-group__empty {
  margin: 0;
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.monitor-device-action-group__reason {
  flex-basis: 100%;
  margin: 0;
  color: var(--runtime-text-muted);
  font-size: 11px;
}
</style>
