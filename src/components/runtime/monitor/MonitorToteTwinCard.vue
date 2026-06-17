<template>
  <div
    v-if="view"
    :class="['monitor-tote-twin-card', `monitor-tote-twin-card--${view.tone}`]"
    data-test="monitor-tote-twin-card"
  >
    <header class="monitor-tote-twin-card__header">
      <span class="monitor-tote-twin-card__label">LPN</span>
      <strong
        class="monitor-tote-twin-card__lpn"
        data-test="monitor-tote-twin-card-lpn"
      >
        {{ view.lpn }}
      </strong>
      <span
        v-if="view.typeLabel"
        class="monitor-tote-twin-card__type"
        data-test="monitor-tote-twin-card-type"
      >
        {{ view.typeLabel }}
      </span>
    </header>

    <dl
      v-if="view.rows.length"
      class="monitor-tote-twin-card__rows"
      data-test="monitor-tote-twin-card-rows"
    >
      <div
        v-for="(row, index) in view.rows"
        :key="`${row.label}-${index}`"
        :class="[
          'monitor-tote-twin-card__row',
          row.emphasis ? `monitor-tote-twin-card__row--${row.emphasis}` : null
        ]"
      >
        <dt>{{ row.label }}</dt>
        <dd>{{ row.value }}</dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import type { RuntimeSceneToteTwinView } from '@/utils/runtime-scene'

defineProps<{
  view: RuntimeSceneToteTwinView | null
}>()
</script>

<style scoped>
.monitor-tote-twin-card {
  position: relative;
  display: grid;
  gap: 10px;
  overflow: hidden;
  padding: 12px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 8px;
  background: var(--runtime-surface);
  color: var(--runtime-text);
}

.monitor-tote-twin-card::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 3px;
}

.monitor-tote-twin-card--info::before {
  background: var(--color-info);
}

.monitor-tote-twin-card--warning::before {
  background: var(--color-warning);
}

.monitor-tote-twin-card__header {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}

.monitor-tote-twin-card__label {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.monitor-tote-twin-card__lpn {
  color: var(--runtime-text);
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 14px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.monitor-tote-twin-card__type {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgb(var(--color-info-rgb) / 0.12);
  color: var(--color-info);
  font-size: 11px;
  font-weight: 600;
}

.monitor-tote-twin-card__rows {
  display: grid;
  gap: 6px;
  margin: 0;
}

.monitor-tote-twin-card__row {
  display: grid;
  grid-template-columns: minmax(72px, auto) 1fr;
  gap: 8px;
  align-items: baseline;
  padding: 4px 0;
  border-bottom: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.16));
}

.monitor-tote-twin-card__row:last-child {
  border-bottom: 0;
}

.monitor-tote-twin-card__row dt {
  margin: 0;
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.monitor-tote-twin-card__row dd {
  margin: 0;
  color: var(--runtime-text);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.monitor-tote-twin-card__row--info dd {
  color: var(--color-info);
}

.monitor-tote-twin-card__row--warning dd {
  color: #b45309;
}

.monitor-tote-twin-card__row--danger dd {
  color: var(--color-danger);
}
</style>
