<template>
  <div
    :class="['monitor-alert-card', `monitor-alert-card--${tone}`]"
    :data-tone="tone"
    data-test="monitor-alert-card"
    role="alert"
  >
    <div class="monitor-alert-card__indicator">
      <span class="monitor-alert-card__dot" />
    </div>
    <div class="monitor-alert-card__body">
      <div
        class="monitor-alert-card__title"
        data-test="monitor-alert-card-title"
      >
        {{ title }}
      </div>
      <div
        class="monitor-alert-card__message"
        data-test="monitor-alert-card-message"
      >
        {{ message }}
      </div>
      <div
        v-if="source"
        class="monitor-alert-card__source"
        data-test="monitor-alert-card-source"
      >
        {{ source }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
export type MonitorAlertTone = 'danger' | 'warning'

defineProps<{
  tone: MonitorAlertTone
  title: string
  message: string
  source?: string
}>()
</script>

<style scoped>
.monitor-alert-card {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  padding: 12px;
  border: 1px dashed;
  border-radius: 8px;
  background: var(--runtime-surface);
  color: var(--runtime-text);
}

.monitor-alert-card--danger {
  border-color: #dc2626;
  background: rgb(220, 38, 38, 0.08);
}

.monitor-alert-card--warning {
  border-color: #eab308;
  background: rgb(234, 179, 8, 0.08);
}

.monitor-alert-card__indicator {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  margin-top: 4px;
}

.monitor-alert-card__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  animation: monitor-alert-card-blink 1s infinite alternate;
}

.monitor-alert-card--danger .monitor-alert-card__dot {
  background: #dc2626;
}

.monitor-alert-card--warning .monitor-alert-card__dot {
  background: #eab308;
}

.monitor-alert-card__body {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.monitor-alert-card__title {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
  overflow-wrap: anywhere;
}

.monitor-alert-card--danger .monitor-alert-card__title {
  color: #dc2626;
}

.monitor-alert-card--warning .monitor-alert-card__title {
  color: #b45309;
}

.monitor-alert-card__message {
  color: var(--runtime-text);
  font-size: 13px;
  line-height: 1.55;
  overflow-wrap: anywhere;
}

.monitor-alert-card__source {
  color: var(--runtime-text-muted);
  font-size: 11px;
  letter-spacing: 0.02em;
  overflow-wrap: anywhere;
}

@keyframes monitor-alert-card-blink {
  from {
    opacity: 0.4;
  }
  to {
    opacity: 1;
  }
}
</style>
