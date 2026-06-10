<template>
  <aside
    class="runtime-rack-inspector"
    data-test="runtime-rack-inspector"
  >
    <template v-if="layout">
      <header class="runtime-rack-inspector__header">
        <div class="runtime-rack-inspector__eyebrow">当前焦点</div>
        <div class="runtime-rack-inspector__title">
          {{ layout.rackCode }}
          <template v-if="selectedSlot">/ {{ selectedSlot.code }}</template>
        </div>
        <div class="runtime-rack-inspector__meta">
          {{ group.stationCode }} / {{ group.positionCode }} · {{ group.attentionState }}
        </div>
      </header>

      <div class="runtime-rack-inspector__facts">
        <span data-test="runtime-scene-station-lease">
          {{ group.boundary.stationLeaseLabel }}
        </span>
        <span data-test="runtime-scene-rack-snapshot">
          {{ group.boundary.rackSnapshotLabel }}
        </span>
        <span data-test="runtime-scene-rack-operation">
          {{ group.boundary.rackOperationWaitLabel }}
        </span>
      </div>

      <section
        v-if="selectedSlot"
        class="runtime-rack-inspector__section"
      >
        <div class="runtime-rack-inspector__section-title">
          <span>Slot</span>
          <strong>{{ selectedSlot.code }}</strong>
        </div>

        <div
          v-if="selectedSlot.bin"
          class="runtime-rack-inspector__bin"
        >
          <div class="runtime-rack-inspector__bin-title">
            <span>Bin</span>
            <strong>{{ selectedSlot.bin.code }}</strong>
          </div>

          <RuntimeBinCellGrid
            v-if="selectedSlot.bin.cells.length"
            :bin="selectedSlot.bin"
            :selected-cell-key="selectedCellKey"
            @select-cell="selectCell"
          />

          <section
            v-if="selectedCell"
            class="runtime-rack-inspector__cell-detail"
            data-test="runtime-rack-cell-detail"
          >
            <div class="runtime-rack-inspector__cell-head">
              <span>Cell</span>
              <strong>{{ selectedCell.code }}</strong>
            </div>

            <div
              v-if="selectedCell.materialSummary"
              class="runtime-rack-inspector__batch-summary"
              data-test="runtime-rack-cell-summary"
            >
              <div>
                <span>HHPN</span>
                <strong>{{ selectedCell.materialSummary.materialCode || '未提供' }}</strong>
              </div>
              <div>
                <span>DateCode</span>
                <strong>{{ selectedCell.materialSummary.dateCode || '未提供' }}</strong>
              </div>
              <div>
                <span>LotCode</span>
                <strong>{{ selectedCell.materialSummary.lotCode || '未提供' }}</strong>
              </div>
              <div>
                <span>盘数</span>
                <strong>{{ selectedCell.materialSummary.reelCount }} 盘</strong>
              </div>
            </div>

            <div
              v-if="selectedCell.materialReels.length"
              class="runtime-rack-material-stack"
              data-test="runtime-rack-material-stack"
            >
              <div class="runtime-rack-material-stack__rail">
                <span>顶部</span>
                <span>底部</span>
              </div>
              <div class="runtime-rack-material-stack__items">
                <article
                  v-for="(reel, index) in selectedCell.materialReels"
                  :key="reel.key"
                  class="runtime-rack-material-stack__reel"
                  data-test="runtime-rack-material-reel"
                >
                  <span class="runtime-rack-material-stack__depth">
                    {{ reelDepthLabel(index, selectedCell.materialReels.length) }}
                  </span>
                  <strong>{{ reel.reelCode }}</strong>
                  <span>{{ reel.materialCode || 'HHPN 未提供' }}</span>
                  <span>
                    DC {{ reel.dateCode || '未提供' }} / LC {{ reel.lotCode || '未提供' }}
                  </span>
                </article>
              </div>
            </div>

            <div
              v-else
              class="runtime-rack-inspector__empty-block"
            >
              {{
                selectedCell.materialSummary?.reelCount
                  ? '当前接口只提供汇总盘数，未提供逐盘明细'
                  : '该料格暂无料盘明细'
              }}
            </div>
          </section>

          <section
            v-if="selectedSlot.bin.looseMaterials.length"
            class="runtime-rack-inspector__materials"
            data-test="runtime-rack-unlocated-materials"
          >
            <div class="runtime-rack-inspector__materials-head">
              <strong>未定位证据</strong>
              <span>未绑定料格，不计入物理盘数</span>
            </div>
            <span
              v-for="material in selectedSlot.bin.looseMaterials"
              :key="material.key"
              class="runtime-rack-inspector__material"
            >
              {{ material.kind }} {{ material.code }}
            </span>
          </section>
        </div>

        <div
          v-else
          class="runtime-rack-inspector__empty-block"
        >
          该格暂无料箱证据
        </div>
      </section>

      <details class="runtime-rack-inspector__audit">
        <summary>审计证据 {{ evidenceItems.length }}</summary>
        <RuntimeSceneEvidencePanel
          :items="evidenceItems"
          :resource-evidence-truncated="resourceEvidenceTruncated"
          :resource-evidence-visible-count="resourceEvidenceVisibleCount"
          :resource-evidence-total-count="resourceEvidenceTotalCount"
        />
      </details>
    </template>

    <div
      v-else
      class="runtime-rack-inspector__empty-panel"
    >
      暂无货架投影
    </div>
  </aside>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import RuntimeBinCellGrid from './RuntimeBinCellGrid.vue'
import RuntimeSceneEvidencePanel from './RuntimeSceneEvidencePanel.vue'
import type {
  RuntimeScenePositionGroup,
  RuntimeSceneRackCell,
  RuntimeSceneRackLayout,
  RuntimeSceneRackSlot
} from '@/utils/runtime-scene'

const props = defineProps<{
  group: RuntimeScenePositionGroup
  layout: RuntimeSceneRackLayout | null
  selectedSlot: RuntimeSceneRackSlot | null
  resourceEvidenceTruncated: boolean
  resourceEvidenceVisibleCount: number
  resourceEvidenceTotalCount: number
}>()

const evidenceItems = computed(
  () =>
    selectedCell.value?.auditItems ??
    props.selectedSlot?.auditItems ??
    props.layout?.auditItems ??
    props.group.auditItems
)

const selectedCellKey = ref<string | null>(null)

const selectedCell = computed(
  () => props.selectedSlot?.bin?.cells.find(cell => cell.key === selectedCellKey.value) ?? null
)

function selectCell(cell: RuntimeSceneRackCell): void {
  selectedCellKey.value = cell.key
}

function getDefaultCell(slot: RuntimeSceneRackSlot | null): RuntimeSceneRackCell | null {
  const cells = slot?.bin?.cells ?? []
  return (
    cells.find(cell => cell.materialSummary || cell.materialReels.length > 0) ?? cells[0] ?? null
  )
}

function reelDepthLabel(index: number, total: number): string {
  if (total <= 1) return '单盘'
  if (index === 0) return '底层'
  if (index === total - 1) return '顶层'
  return `第 ${index + 1} 层`
}

watch(
  () => props.selectedSlot?.key,
  () => {
    selectedCellKey.value = getDefaultCell(props.selectedSlot)?.key ?? null
  },
  { immediate: true }
)
</script>

<style scoped>
.runtime-rack-inspector {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.22));
  border-radius: 8px;
  background: var(--runtime-surface);
  color: var(--runtime-text);
}

.runtime-rack-inspector__header {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.runtime-rack-inspector__eyebrow {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.runtime-rack-inspector__title {
  color: var(--runtime-text);
  font-family: var(--font-mono);
  font-size: 16px;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.runtime-rack-inspector__meta,
.runtime-rack-inspector__facts,
.runtime-rack-inspector__empty,
.runtime-rack-inspector__empty-block,
.runtime-rack-inspector__empty-panel {
  color: var(--runtime-text-muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.runtime-rack-inspector__facts {
  display: grid;
  gap: 4px;
}

.runtime-rack-inspector__section,
.runtime-rack-inspector__bin,
.runtime-rack-inspector__cell-detail {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.runtime-rack-inspector__section {
  padding: 10px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 6px;
}

.runtime-rack-inspector__section-title,
.runtime-rack-inspector__bin-title,
.runtime-rack-inspector__cell-head {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
  min-width: 0;
}

.runtime-rack-inspector__section-title span,
.runtime-rack-inspector__bin-title span,
.runtime-rack-inspector__cell-head span {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 800;
}

.runtime-rack-inspector__section-title strong,
.runtime-rack-inspector__bin-title strong,
.runtime-rack-inspector__cell-head strong,
.runtime-rack-inspector__material {
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.runtime-rack-inspector__section-title strong,
.runtime-rack-inspector__bin-title strong,
.runtime-rack-inspector__cell-head strong {
  color: var(--runtime-text);
  font-size: 13px;
  font-weight: 900;
}

.runtime-rack-inspector__cell-detail {
  padding-top: 10px;
  border-top: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.18));
}

.runtime-rack-inspector__batch-summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  min-width: 0;
}

.runtime-rack-inspector__batch-summary div {
  display: grid;
  gap: 3px;
  min-width: 0;
  padding: 8px;
  border: 1px solid rgb(14, 165, 233, 0.18);
  border-radius: 6px;
  background: rgb(15, 23, 42, 0.24);
}

.runtime-rack-inspector__batch-summary span {
  color: var(--runtime-text-muted);
  font-size: 10px;
  font-weight: 800;
}

.runtime-rack-inspector__batch-summary strong {
  color: var(--runtime-text);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 900;
  overflow-wrap: anywhere;
}

.runtime-rack-material-stack {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 8px;
  min-width: 0;
}

.runtime-rack-material-stack__rail {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: var(--runtime-text-muted);
  font-size: 10px;
  font-weight: 800;
  text-align: center;
}

.runtime-rack-material-stack__items {
  display: flex;
  flex-direction: column-reverse;
  gap: 6px;
  min-width: 0;
  padding-left: 8px;
  border-left: 2px solid rgb(14, 165, 233, 0.36);
}

.runtime-rack-material-stack__reel {
  display: grid;
  gap: 3px;
  min-width: 0;
  padding: 8px 9px;
  border: 1px solid rgb(20, 184, 166, 0.28);
  border-radius: 6px;
  background:
    linear-gradient(90deg, rgb(20, 184, 166, 0.18), rgb(15, 23, 42, 0.18)), rgb(15, 23, 42, 0.24);
}

.runtime-rack-material-stack__reel strong,
.runtime-rack-material-stack__reel span {
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.runtime-rack-material-stack__reel strong {
  color: var(--runtime-text);
  font-size: 12px;
  font-weight: 900;
}

.runtime-rack-material-stack__reel span {
  color: var(--runtime-text-muted);
  font-size: 10px;
  font-weight: 800;
}

.runtime-rack-material-stack__depth {
  width: fit-content;
  padding: 2px 5px;
  border-radius: 4px;
  background: rgb(245, 158, 11, 0.16);
  color: rgb(251, 191, 36) !important;
}

.runtime-rack-inspector__materials {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
  padding: 9px;
  border: 1px dashed rgb(245, 158, 11, 0.28);
  border-radius: 6px;
  background: rgb(245, 158, 11, 0.06);
}

.runtime-rack-inspector__materials-head {
  display: grid;
  flex: 1 0 100%;
  gap: 2px;
  min-width: 0;
}

.runtime-rack-inspector__materials-head strong {
  color: rgb(251, 191, 36);
  font-size: 11px;
  font-weight: 900;
}

.runtime-rack-inspector__materials-head span {
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.runtime-rack-inspector__material {
  padding: 3px 6px;
  border-radius: 4px;
  background: rgb(245, 158, 11, 0.14);
  color: rgb(251, 191, 36);
  font-size: 11px;
  font-weight: 800;
}

.runtime-rack-inspector__empty-block,
.runtime-rack-inspector__empty-panel {
  padding: 18px 10px;
  border: 1px dashed var(--runtime-border-subtle, rgb(148, 163, 184, 0.28));
  border-radius: 6px;
  text-align: center;
}

.runtime-rack-inspector__audit {
  min-width: 0;
  border-top: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.18));
  padding-top: 8px;
}

.runtime-rack-inspector__audit summary {
  color: var(--runtime-text);
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.runtime-rack-inspector__audit .runtime-scene-evidence-panel {
  margin-top: 10px;
}
</style>
