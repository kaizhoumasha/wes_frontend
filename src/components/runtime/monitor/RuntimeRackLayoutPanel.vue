<template>
  <section
    class="runtime-rack-layout-panel"
    data-test="runtime-rack-layout-panel"
  >
    <header class="runtime-rack-layout-panel__header">
      <div>
        <div class="runtime-rack-layout-panel__eyebrow">单层货架</div>
        <div class="runtime-rack-layout-panel__title">{{ layout.rackCode }}</div>
        <div class="runtime-rack-layout-panel__meta">
          {{ layout.stationCode }} / {{ layout.positionCode }}
        </div>
      </div>
      <div class="runtime-rack-layout-panel__summary">
        {{ layout.slots.length }} 格 · {{ occupiedSlotCount }} 箱 · {{ reelCount }} 盘
      </div>
    </header>

    <div
      class="runtime-rack-layout-panel__grid"
      :style="gridStyle"
    >
      <button
        v-for="slot in layout.slots"
        :key="slot.key"
        type="button"
        class="runtime-rack-slot"
        :class="[
          `is-${slot.state}`,
          {
            'is-selected': selectedSlotKey === slot.key,
            'is-waiting': layout.attentionState === 'waiting',
            'is-blocked': layout.attentionState === 'blocked'
          }
        ]"
        data-test="runtime-rack-slot"
        @click="emit('selectSlot', slot.key)"
      >
        <span class="runtime-rack-slot__code">{{ slot.code }}</span>
        <span
          v-if="slot.bin"
          class="runtime-rack-slot__bin"
        >
          {{ slot.bin.code }}
        </span>
        <span
          v-else
          class="runtime-rack-slot__empty"
        >
          空位
        </span>
        <span class="runtime-rack-slot__state">{{ slotStateLabel(slot.state) }}</span>
        <span
          v-if="slot.bin?.cells.length"
          class="runtime-rack-slot__cells"
        >
          {{ slot.bin.cells.length }} 格 · {{ slotReelCount(slot) }} 盘
        </span>
        <span
          v-if="unlocatedMaterialCount(slot)"
          class="runtime-rack-slot__unlocated"
        >
          {{ unlocatedMaterialCount(slot) }} 条未定位
        </span>
      </button>
    </div>

    <div
      v-if="layout.unlocatedBins.length"
      class="runtime-rack-layout-panel__unlocated"
    >
      <span>未定位料箱</span>
      <strong
        v-for="bin in layout.unlocatedBins"
        :key="bin.key"
      >
        {{ bin.code }}
      </strong>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import type { RuntimeSceneRackLayout, RuntimeSceneRackSlot } from '@/utils/runtime-scene'

const props = defineProps<{
  layout: RuntimeSceneRackLayout
  selectedSlotKey?: string | null
}>()

const emit = defineEmits<{
  selectSlot: [slotKey: string]
}>()

const occupiedSlotCount = computed(
  () => props.layout.slots.filter(slot => slot.bin || slot.looseMaterials.length).length
)

const reelCount = computed(() =>
  props.layout.slots.reduce((total, slot) => total + slotReelCount(slot), 0)
)

const gridStyle = computed<CSSProperties>(() => {
  const count = props.layout.slots.length
  const columns = count <= 4 ? 2 : count <= 6 ? 3 : 4
  return {
    gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`
  }
})

function slotReelCount(slot: RuntimeSceneRackSlot): number {
  if (slot.bin?.cells.length) {
    return slot.bin.cells.reduce((total, cell) => total + cellReelCount(cell), 0)
  }

  return (
    slot.looseMaterials.reduce((total, material) => total + materialReelCount(material), 0) +
    (slot.bin?.looseMaterials ?? []).reduce(
      (total, material) => total + materialReelCount(material),
      0
    ) +
    (slot.bin?.cells ?? []).reduce((total, cell) => total + cellReelCount(cell), 0)
  )
}

function unlocatedMaterialCount(slot: RuntimeSceneRackSlot): number {
  return slot.looseMaterials.length + (slot.bin?.looseMaterials.length ?? 0)
}

function cellReelCount(cell: NonNullable<RuntimeSceneRackSlot['bin']>['cells'][number]): number {
  if (cell.materialSummary) return cell.materialSummary.reelCount
  if (cell.materialReels.length) return cell.materialReels.length
  return cell.materials.reduce((total, material) => total + materialReelCount(material), 0)
}

function materialReelCount(material: RuntimeSceneRackSlot['looseMaterials'][number]): number {
  return typeof material.reelCount === 'number' && material.reelCount > 0 ? material.reelCount : 1
}

function slotStateLabel(state: RuntimeSceneRackSlot['state']): string {
  if (state === 'material') return '有料'
  if (state === 'occupied') return '占用'
  return '空'
}
</script>

<style scoped>
.runtime-rack-layout-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.22));
  border-radius: 8px;
  background:
    linear-gradient(180deg, rgb(15, 23, 42, 0.3), rgb(15, 23, 42, 0)), var(--runtime-surface);
  color: var(--runtime-text);
}

.runtime-rack-layout-panel__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  min-width: 0;
}

.runtime-rack-layout-panel__eyebrow {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.runtime-rack-layout-panel__title {
  margin-top: 4px;
  color: var(--runtime-text);
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.runtime-rack-layout-panel__meta,
.runtime-rack-layout-panel__summary {
  color: var(--runtime-text-muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.runtime-rack-layout-panel__summary {
  flex: 0 0 auto;
  font-weight: 700;
}

.runtime-rack-layout-panel__grid {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.runtime-rack-slot {
  position: relative;
  display: grid;
  grid-template-rows: auto minmax(24px, 1fr) auto;
  gap: 6px;
  min-width: 0;
  min-height: 118px;
  padding: 10px;
  border: 1px solid rgb(71, 85, 105, 0.55);
  border-radius: 6px;
  background: rgb(15, 23, 42, 0.32);
  color: var(--runtime-text);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease,
    transform 150ms ease;
}

.runtime-rack-slot:hover {
  transform: translateY(-1px);
  border-color: rgb(14, 165, 233, 0.55);
}

.runtime-rack-slot.is-selected {
  border-color: rgb(245, 158, 11, 0.8);
  box-shadow:
    inset 0 0 0 1px rgb(245, 158, 11, 0.32),
    0 12px 28px rgb(0, 0, 0, 0.18);
}

.runtime-rack-slot.is-blocked {
  border-color: rgb(220, 38, 38, 0.62);
}

.runtime-rack-slot.is-waiting:not(.is-selected) {
  border-color: rgb(245, 158, 11, 0.42);
}

.runtime-rack-slot.is-empty {
  border-style: dashed;
  background: rgb(15, 23, 42, 0.18);
}

.runtime-rack-slot.is-material {
  background:
    linear-gradient(135deg, rgb(20, 184, 166, 0.14), rgb(15, 23, 42, 0.22)), rgb(15, 23, 42, 0.32);
}

.runtime-rack-slot__code,
.runtime-rack-slot__bin {
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.runtime-rack-slot__code {
  color: var(--runtime-text-muted);
  font-size: 12px;
  font-weight: 800;
}

.runtime-rack-slot__bin {
  align-self: center;
  color: var(--runtime-text);
  font-size: 13px;
  font-weight: 900;
}

.runtime-rack-slot__empty,
.runtime-rack-slot__state,
.runtime-rack-slot__cells,
.runtime-rack-slot__unlocated {
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.runtime-rack-slot__state {
  width: fit-content;
  padding: 2px 6px;
  border-radius: 999px;
  background: rgb(148, 163, 184, 0.12);
  font-weight: 800;
}

.runtime-rack-slot.is-material .runtime-rack-slot__state {
  background: rgb(20, 184, 166, 0.18);
  color: rgb(45, 212, 191);
}

.runtime-rack-slot__unlocated {
  color: rgb(251, 191, 36);
  font-weight: 800;
}

.runtime-rack-layout-panel__unlocated {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  min-width: 0;
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.runtime-rack-layout-panel__unlocated strong {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgb(245, 158, 11, 0.12);
  color: rgb(245, 158, 11);
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

@media (width <= 640px) {
  .runtime-rack-layout-panel__grid {
    grid-template-columns: 1fr !important;
  }

  .runtime-rack-layout-panel__header {
    flex-direction: column;
  }
}
</style>
