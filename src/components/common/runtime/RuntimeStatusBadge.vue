<template>
  <span class="runtime-status-badge" :class="[`runtime-status-badge--${resolvedTone}`, `runtime-status-badge--${size}`]">
    <span class="runtime-status-badge__dot" :class="{ 'is-pulse': pulse }" />
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
  background: rgb(15, 23, 42, 0.78);
  color: #e2e8f0;
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
  border-color: rgb(59, 130, 246, 0.32);
  background: rgb(59, 130, 246, 0.12);
  color: #60a5fa;
}

.runtime-status-badge--success {
  border-color: rgb(22, 163, 74, 0.32);
  background: rgb(22, 163, 74, 0.12);
  color: #4ade80;
}

.runtime-status-badge--warning {
  border-color: rgb(234, 179, 8, 0.32);
  background: rgb(234, 179, 8, 0.12);
  color: #facc15;
}

.runtime-status-badge--danger {
  border-color: rgb(220, 38, 38, 0.32);
  background: rgb(220, 38, 38, 0.12);
  color: #f87171;
}

.runtime-status-badge--info {
  border-color: rgb(148, 163, 184, 0.24);
  background: rgb(148, 163, 184, 0.12);
  color: #cbd5e1;
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
