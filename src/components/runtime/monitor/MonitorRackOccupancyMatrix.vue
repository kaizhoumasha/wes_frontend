<template>
  <div
    v-if="view"
    class="monitor-rack-occupancy-matrix"
    data-test="monitor-rack-occupancy-matrix"
  >
    <header class="monitor-rack-occupancy-matrix__header">
      <span class="monitor-rack-occupancy-matrix__title">货架占用矩阵</span>
      <span class="monitor-rack-occupancy-matrix__count">
        {{ view.rackCode }} · {{ view.totalCellCount }} 槽位
      </span>
    </header>

    <div class="monitor-rack-occupancy-matrix__groups">
      <section
        v-for="group in view.slotGroups"
        :key="group.key"
        class="monitor-rack-occupancy-matrix__slot-group"
        :data-slot-code="group.code"
        data-test="monitor-rack-occupancy-matrix-slot-group"
      >
        <div class="monitor-rack-occupancy-matrix__slot-group-head">
          <span class="monitor-rack-occupancy-matrix__slot-code">SLOT {{ group.code }}</span>
          <span class="monitor-rack-occupancy-matrix__bin-label">{{ group.binDisplayLabel }}</span>
        </div>
        <div
          class="monitor-rack-occupancy-matrix__cell-grid"
          :style="{
            gridTemplateColumns: `repeat(${group.cells.length}, minmax(0, 1fr))`
          }"
        >
          <button
            v-for="cell in group.cells"
            :key="cell.key"
            type="button"
            :class="[
              'monitor-rack-occupancy-matrix__cell',
              `monitor-rack-occupancy-matrix__cell--${cell.state}`,
              cell.key === selectedSlotKey ? 'monitor-rack-occupancy-matrix__cell--selected' : null
            ]"
            :data-state="cell.state"
            :data-slot-key="cell.key"
            :data-selected="cell.key === selectedSlotKey ? 'true' : undefined"
            data-test="monitor-rack-occupancy-matrix-slot"
            @click="emit('select', cell.key)"
          >
            <span class="monitor-rack-occupancy-matrix__cell-code">{{ cell.code }}</span>
            <span
              v-if="cell.tote"
              class="monitor-rack-occupancy-matrix__cell-tote"
            >
              {{ cell.tote }}
            </span>
            <span
              v-if="cell.alarm"
              class="monitor-rack-occupancy-matrix__cell-alarm"
            >
              {{ cell.alarm }}
            </span>
          </button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RuntimeSceneRackHierarchyView } from '@/utils/runtime-scene'

withDefaults(
  defineProps<{
    view: RuntimeSceneRackHierarchyView | null
    selectedSlotKey?: string | null
  }>(),
  { selectedSlotKey: null }
)

const emit = defineEmits<{
  (event: 'select', slotKey: string): void
}>()
</script>

<style scoped>
.monitor-rack-occupancy-matrix {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 8px;
  background: var(--runtime-surface);
  color: var(--runtime-text);
}

.monitor-rack-occupancy-matrix__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
}

.monitor-rack-occupancy-matrix__title {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.monitor-rack-occupancy-matrix__count {
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.monitor-rack-occupancy-matrix__groups {
  display: grid;
  gap: 12px;
}

.monitor-rack-occupancy-matrix__slot-group {
  display: grid;
  gap: 6px;
  padding-bottom: 8px;
  border-bottom: 1px dashed var(--runtime-border-subtle, rgb(148, 163, 184, 0.25));
}

.monitor-rack-occupancy-matrix__slot-group:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.monitor-rack-occupancy-matrix__slot-group-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  font-size: 11px;
}

.monitor-rack-occupancy-matrix__slot-code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-weight: 800;
  letter-spacing: 0.04em;
  color: var(--runtime-text);
}

.monitor-rack-occupancy-matrix__bin-label {
  color: var(--runtime-text-muted);
  font-weight: 600;
}

.monitor-rack-occupancy-matrix__cell-grid {
  display: grid;
  gap: 6px;
}

.monitor-rack-occupancy-matrix__cell {
  display: grid;
  gap: 2px;
  padding: 8px 6px;
  border: 1px solid transparent;
  border-radius: 6px;
  font: inherit;
  text-align: center;
  cursor: pointer;
  transition: transform 0.1s ease;
}

.monitor-rack-occupancy-matrix__cell:hover {
  transform: translateY(-1px);
}

.monitor-rack-occupancy-matrix__cell--empty {
  border-color: var(--runtime-border-subtle, rgb(148, 163, 184, 0.25));
  border-style: dashed;
  background: transparent;
  color: var(--runtime-text-muted);
}

.monitor-rack-occupancy-matrix__cell--occupied {
  border-color: rgb(var(--color-info-rgb) / 0.4);
  background: rgb(var(--color-info-rgb) / 0.12);
  color: var(--color-info);
}

.monitor-rack-occupancy-matrix__cell--reconciling {
  border-color: rgb(var(--color-warning-rgb) / 0.5);
  background: rgb(var(--color-warning-rgb) / 0.14);
  color: #b45309;
  animation: monitor-rack-occupancy-blink 1.2s infinite alternate;
}

.monitor-rack-occupancy-matrix__cell--selected {
  border-color: rgb(var(--color-info-rgb) / 0.95);
  background: rgb(var(--color-info-rgb) / 0.22);
  box-shadow: 0 0 0 2px rgb(var(--color-info-rgb) / 0.4);
}

.monitor-rack-occupancy-matrix__cell-code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.monitor-rack-occupancy-matrix__cell-tote {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  overflow-wrap: anywhere;
}

.monitor-rack-occupancy-matrix__cell-alarm {
  font-size: 10px;
  font-weight: 600;
}

@keyframes monitor-rack-occupancy-blink {
  from {
    opacity: 0.6;
  }
  to {
    opacity: 1;
  }
}
</style>
