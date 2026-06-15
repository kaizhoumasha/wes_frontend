<template>
  <div
    class="runtime-bin-cell-grid"
    data-test="runtime-bin-cell-grid"
  >
    <span class="runtime-bin-cell-grid__side runtime-bin-cell-grid__side--top">C</span>
    <span class="runtime-bin-cell-grid__side runtime-bin-cell-grid__side--left">B</span>
    <div
      class="runtime-bin-cell-grid__frame"
      :class="{ 'is-three-cell': isThreeCellLayout }"
    >
      <button
        v-for="slot in gridSlots"
        :key="slot.key"
        type="button"
        class="runtime-bin-cell"
        :class="[
          slot.placementClass,
          {
            'is-empty': !slot.cell,
            'is-selected': selectedCellKey === slot.cell?.key,
            'has-material': Boolean(slot.cell?.materialSummary)
          }
        ]"
        :style="slot.style"
        :disabled="!slot.cell"
        data-test="runtime-bin-cell"
        @click="selectCell(slot.cell)"
      >
        <span class="runtime-bin-cell__index">{{ slot.label }}</span>
        <template v-if="slot.cell">
          <strong>{{ slot.cell.code }}</strong>
          <span
            v-if="slot.cell.materialSummary"
            class="runtime-bin-cell__summary"
          >
            <span class="runtime-bin-cell__hhpn">
              {{ materialCodeLabel(slot.cell) }}
            </span>
            <span class="runtime-bin-cell__batch-row">
              <span>DC {{ slot.cell.materialSummary.dateCode || '未提供' }}</span>
              <span>LC {{ slot.cell.materialSummary.lotCode || '未提供' }}</span>
            </span>
            <span class="runtime-bin-cell__reel-count">
              {{ slot.cell.materialSummary.reelCount }} 盘
              <template v-if="slot.cell.materialSummary.batchStatus === 'mixed'">· 混批</template>
            </span>
          </span>
          <span
            v-else
            class="runtime-bin-cell__empty"
          >
            无料
          </span>
        </template>
        <span
          v-else
          class="runtime-bin-cell__empty"
        >
          空
        </span>
      </button>
    </div>
    <span class="runtime-bin-cell-grid__side runtime-bin-cell-grid__side--right">D</span>
    <span class="runtime-bin-cell-grid__side runtime-bin-cell-grid__side--bottom">A</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { CSSProperties } from 'vue'
import type { RuntimeSceneRackBin, RuntimeSceneRackCell } from '@/utils/runtime-scene'

interface CellGridSlot {
  key: string
  label: string
  cell: RuntimeSceneRackCell | null
  placementClass: string[]
  style?: CSSProperties
}

const props = defineProps<{
  bin: RuntimeSceneRackBin
  selectedCellKey?: string | null
}>()

const emit = defineEmits<{
  selectCell: [cell: RuntimeSceneRackCell]
}>()

const cellsWithIndex = computed(() =>
  props.bin.cells.map((cell, index) => ({
    cell,
    index: extractCellIndex(cell.code) ?? index + 1
  }))
)

const isThreeCellLayout = computed(() => cellsWithIndex.value.some(item => item.index > 6))

const gridSlots = computed<CellGridSlot[]>(() => {
  const indexedCells = new Map<number, RuntimeSceneRackCell>()
  const unplacedCells: RuntimeSceneRackCell[] = []

  for (const item of cellsWithIndex.value) {
    if (indexedCells.has(item.index)) {
      unplacedCells.push(item.cell)
    } else {
      indexedCells.set(item.index, item.cell)
    }
  }

  const positions = isThreeCellLayout.value ? [7, 2, 1] : [6, 5, 4, 3, 2, 1]
  return positions.map(position => {
    const cell = indexedCells.get(position) ?? unplacedCells.shift() ?? null
    return {
      key: `cell-position:${position}:${cell?.key ?? 'empty'}`,
      label: String(position),
      cell,
      placementClass: getPlacementClass(position),
      style: getPositionStyle(position)
    }
  })
})

function extractCellIndex(code: string): number | null {
  const match = code.match(/(\d+)(?!.*\d)/)
  if (!match?.[1]) return null
  const value = Number(match[1])
  return Number.isFinite(value) && value > 0 ? value : null
}

function getPositionStyle(position: number): CSSProperties | undefined {
  if (!isThreeCellLayout.value) return undefined
  if (position === 7) {
    return { gridColumn: '1 / span 2' }
  }
  return undefined
}

function getPlacementClass(position: number): string[] {
  if (isThreeCellLayout.value) {
    if (position === 7) return ['is-span-cell']
    if (position === 2) return ['is-left-cell', 'is-bottom-cell']
    return ['is-right-cell', 'is-bottom-cell']
  }

  const isLeftCell = position % 2 === 0
  const isBottomCell = position === 1 || position === 2
  return [
    isLeftCell ? 'is-left-cell' : 'is-right-cell',
    isBottomCell ? 'is-bottom-cell' : ''
  ].filter(Boolean)
}

function selectCell(cell: RuntimeSceneRackCell | null): void {
  if (!cell) return
  emit('selectCell', cell)
}

function materialCodeLabel(cell: RuntimeSceneRackCell): string {
  return cell.materialSummary?.materialCode || 'HHPN 未提供'
}
</script>

<style scoped>
.runtime-bin-cell-grid {
  display: grid;
  grid-template-columns: 18px minmax(0, 1fr) 18px;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 5px;
  align-items: center;
  min-width: 0;
}

.runtime-bin-cell-grid__side {
  color: var(--runtime-text);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 900;
  text-align: center;
}

.runtime-bin-cell-grid__side--top,
.runtime-bin-cell-grid__side--bottom {
  grid-column: 2;
}

.runtime-bin-cell-grid__side--left {
  grid-column: 1;
  grid-row: 2;
}

.runtime-bin-cell-grid__side--right {
  grid-column: 3;
  grid-row: 2;
}

.runtime-bin-cell-grid__frame {
  display: grid;
  grid-column: 2;
  grid-row: 2;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  grid-template-rows: repeat(3, minmax(74px, 1fr));
  gap: 0;
  min-width: 0;
  overflow: hidden;
  border: 2px solid rgb(14, 165, 233, 0.78);
  border-radius: 3px;
  background: var(--runtime-surface-muted, rgb(15, 23, 42, 0.32));
}

.runtime-bin-cell-grid__frame.is-three-cell {
  grid-template-rows: minmax(92px, 1.2fr) minmax(74px, 1fr);
}

.runtime-bin-cell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr) auto;
  gap: 4px;
  min-width: 0;
  min-height: 0;
  padding: 7px;
  border-right: 0;
  border-bottom: 1px solid rgb(14, 165, 233, 0.45);
  background: var(--runtime-surface-subtle, rgb(20, 184, 166, 0.12));
  color: var(--runtime-text);
  text-align: left;
  cursor: pointer;
}

.runtime-bin-cell.is-left-cell {
  border-right: 1px solid rgb(14, 165, 233, 0.45);
}

.runtime-bin-cell.is-bottom-cell {
  border-bottom: 0;
}

.runtime-bin-cell.is-empty {
  background: var(--runtime-surface-subtle, rgb(15, 23, 42, 0.18));
  color: var(--runtime-text-muted);
  cursor: default;
}

.runtime-bin-cell.is-selected {
  box-shadow:
    inset 0 0 0 1px rgb(245, 158, 11, 0.48),
    inset 0 -18px 36px rgb(245, 158, 11, 0.08);
}

.runtime-bin-cell.has-material {
  background:
    linear-gradient(180deg, rgb(20, 184, 166, 0.18), rgb(20, 184, 166, 0.08)),
    var(--runtime-surface-muted, rgb(15, 23, 42, 0.24));
}

.runtime-bin-cell__index,
.runtime-bin-cell strong,
.runtime-bin-cell__hhpn,
.runtime-bin-cell__batch-row,
.runtime-bin-cell__reel-count {
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.runtime-bin-cell__index {
  color: rgb(248, 113, 113);
  font-size: 12px;
  font-weight: 900;
}

.runtime-bin-cell strong {
  color: var(--runtime-text);
  font-size: 11px;
  font-weight: 800;
}

.runtime-bin-cell__summary {
  display: grid;
  gap: 3px;
  align-self: end;
  min-width: 0;
}

.runtime-bin-cell__hhpn {
  color: var(--runtime-text-primary, rgb(226, 232, 240));
  font-size: 10px;
  font-weight: 900;
}

.runtime-bin-cell__batch-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  color: rgb(125, 211, 252);
  font-size: 10px;
  font-weight: 800;
}

.runtime-bin-cell__reel-count {
  width: fit-content;
  max-width: 100%;
  padding: 2px 5px;
  border-radius: 4px;
  background: rgb(245, 158, 11, 0.16);
  color: rgb(251, 191, 36);
  font-size: 10px;
  font-weight: 900;
}

.runtime-bin-cell__empty {
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.runtime-bin-cell:disabled {
  pointer-events: none;
}

@media (width <= 640px) {
  .runtime-bin-cell-grid__frame {
    grid-template-rows: repeat(3, minmax(64px, 1fr));
  }
}
</style>
