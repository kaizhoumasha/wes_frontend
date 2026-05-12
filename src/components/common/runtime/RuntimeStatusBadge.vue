<template>
  <span
    class="runtime-status-badge"
    :class="[`runtime-status-badge--${resolvedTone}`, `runtime-status-badge--${size}`]"
  >
    <span
      class="runtime-status-badge__dot"
      :class="{ 'is-pulse': pulse }"
    />
    <span class="runtime-status-badge__label">{{ resolvedLabel }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { compactEnumLabel, resolveRuntimeTone, type RuntimeTone } from '@/utils/runtime-display'

const props = withDefaults(
  defineProps<{
    status?: string | null
    label?: string | null
    tone?: RuntimeTone
    size?: 'small' | 'default'
    pulse?: boolean
  }>(),
  {
    status: null,
    label: null,
    tone: undefined,
    size: 'default',
    pulse: false
  }
)

const resolvedTone = computed(() => props.tone ?? resolveRuntimeTone(props.status))
const resolvedLabel = computed(() => compactEnumLabel(props.label ?? props.status))
</script>

<style scoped>
.runtime-status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 30px;
  padding: 0 12px;
  border: 1px solid rgb(148, 163, 184, 0.24);
  border-radius: 999px;
  background: var(--runtime-surface);
  color: var(--runtime-text-emphasis);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.runtime-status-badge--small {
  min-height: 24px;
  padding: 0 10px;
  gap: 6px;
  font-size: 11px;
}

.runtime-status-badge__dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: currentcolor;
  box-shadow: 0 0 10px currentcolor;
}

.runtime-status-badge__dot.is-pulse {
  animation: runtime-status-pulse 1.8s infinite;
}

.runtime-status-badge--primary {
  border-color: var(--runtime-badge-info-border);
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
}

.runtime-status-badge--success {
  border-color: var(--runtime-badge-success-border);
  background: var(--runtime-badge-success-bg);
  color: var(--runtime-badge-success-text);
}

.runtime-status-badge--warning {
  border-color: var(--runtime-badge-warning-border);
  background: var(--runtime-badge-warning-bg);
  color: var(--runtime-badge-warning-text);
}

.runtime-status-badge--danger {
  border-color: var(--runtime-badge-danger-border);
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
}

.runtime-status-badge--info {
  border-color: var(--runtime-border-neutral);
  background: var(--runtime-surface-muted);
  color: var(--runtime-text-emphasis);
}

@keyframes runtime-status-pulse {
  0% {
    transform: scale(0.95);
    opacity: 0.7;
  }

  50% {
    transform: scale(1.1);
    opacity: 1;
  }

  100% {
    transform: scale(0.95);
    opacity: 0.7;
  }
}
</style>
