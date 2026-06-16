<template>
  <div
    v-if="view"
    class="monitor-rack-occupancy-matrix"
    data-test="monitor-rack-occupancy-matrix"
  >
    <header class="monitor-rack-occupancy-matrix__header">
      <span class="monitor-rack-occupancy-matrix__title">货架占用矩阵</span>
      <span class="monitor-rack-occupancy-matrix__count">{{ view.slots.length }} 槽位</span>
    </header>
    <div
      class="monitor-rack-occupancy-matrix__grid"
      :style="{ gridTemplateColumns: `repeat(${view.columns}, minmax(0, 1fr))` }"
    >
      <button
        v-for="slot in view.slots"
        :key="slot.key"
        type="button"
        :class="['monitor-rack-occupancy-matrix__slot', `monitor-rack-occupancy-matrix__slot--${slot.state}`]"
        :data-state="slot.state"
        :data-slot-key="slot.key"
        data-test="monitor-rack-occupancy-matrix-slot"
        @click="emit('select', slot.key)"
      >
        <span class="monitor-rack-occupancy-matrix__slot-code">{{ slot.code }}</span>
        <span
          v-if="slot.tote"
          class="monitor-rack-occupancy-matrix__slot-tote"
        >
          {{ slot.tote }}
        </span>
        <span
          v-if="slot.alarm"
          class="monitor-rack-occupancy-matrix__slot-alarm"
        >
          {{ slot.alarm }}
        </span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { RuntimeSceneRackOccupancyView } from '@/utils/runtime-scene'

defineProps<{
  view: RuntimeSceneRackOccupancyView | null
}>()

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

.monitor-rack-occupancy-matrix__grid {
  display: grid;
  gap: 6px;
}

.monitor-rack-occupancy-matrix__slot {
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

.monitor-rack-occupancy-matrix__slot:hover {
  transform: translateY(-1px);
}

.monitor-rack-occupancy-matrix__slot--empty {
  border-color: var(--runtime-border-subtle, rgb(148, 163, 184, 0.25));
  border-style: dashed;
  background: transparent;
  color: var(--runtime-text-muted);
}

.monitor-rack-occupancy-matrix__slot--occupied {
  border-color: rgb(59, 130, 246, 0.4);
  background: rgb(59, 130, 246, 0.12);
  color: #3b82f6;
}

.monitor-rack-occupancy-matrix__slot--reconciling {
  border-color: rgb(234, 179, 8, 0.5);
  background: rgb(234, 179, 8, 0.14);
  color: #b45309;
  animation: monitor-rack-occupancy-blink 1.2s infinite alternate;
}

.monitor-rack-occupancy-matrix__slot-code {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 12px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.monitor-rack-occupancy-matrix__slot-tote {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
  font-size: 11px;
  overflow-wrap: anywhere;
}

.monitor-rack-occupancy-matrix__slot-alarm {
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
