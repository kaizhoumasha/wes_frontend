<template>
  <div
    class="runtime-scene-map"
    data-test="runtime-scene-map"
  >
    <div class="runtime-scene-map__header">
      <div>
        <div
          class="runtime-scene-map__meta"
          data-test="runtime-scene-readiness"
        >
          {{ model.worklineCode }} · {{ model.readinessLabel }} · {{ model.runtimeStatusLabel }}
        </div>
      </div>
      <div
        v-if="model.resourceEvidenceTruncated"
        class="runtime-scene-map__count"
        data-test="runtime-scene-truncated"
      >
        仅展示前 {{ resourceEvidenceVisibleCount }} 条证据 / 共
        {{ model.resourceEvidenceTotalCount }} 条
      </div>
    </div>

    <div
      v-if="model.semanticFallback"
      class="runtime-scene-map__fallback"
      data-test="runtime-scene-fallback"
    >
      {{ model.semanticFallbackMessage }}
    </div>

    <RuntimeSceneDeviceFlow
      :devices="model.deviceNodes"
      :explicit-nodes="layoutExplicitNodes"
      :explicit-edges="layoutExplicitEdges"
      :selected-device-id="selectedDeviceId"
      :show-role-details="false"
      @select="emit('selectDevice', $event)"
      @select-rack-position="handleSelectRackPosition"
    />

    <div
      v-if="model.positionGroups.length"
      class="runtime-scene-map__layout"
      :class="{ 'is-summary-only': !showRackDetails }"
    >
      <div class="runtime-scene-map__rack-stage">
        <div class="runtime-scene-map__position-rail">
          <button
            v-for="group in model.positionGroups"
            :key="group.key"
            type="button"
            class="runtime-scene-map__position-tab"
            :class="[
              `is-${group.attentionState}`,
              { 'is-selected': selectedGroup?.key === group.key }
            ]"
            data-test="runtime-scene-position-group"
            @click="selectGroup(group)"
          >
            <span class="runtime-scene-map__position-role">{{ group.stationRole }}</span>
            <strong>{{ group.stationCode }} / {{ group.positionCode }}</strong>
            <span>{{ group.auditItems.length }} 条投影证据</span>
          </button>
        </div>

        <template v-if="showRackDetails && selectedGroup?.rackLayouts.length">
          <div
            v-if="selectedGroup.rackLayouts.length > 1"
            class="runtime-scene-map__rack-tabs"
          >
            <button
              v-for="layout in selectedGroup.rackLayouts"
              :key="layout.key"
              type="button"
              class="runtime-scene-map__rack-tab"
              :class="{ 'is-selected': selectedRackLayout?.key === layout.key }"
              @click="selectRackLayout(layout.key)"
            >
              {{ layout.rackCode }}
            </button>
          </div>

          <RuntimeRackLayoutPanel
            v-if="selectedRackLayout"
            :layout="selectedRackLayout"
            :selected-slot-key="selectedRackSlotKey"
            @select-slot="selectRackSlot"
          />
        </template>

        <div
          v-else-if="showRackDetails"
          class="runtime-scene-map__positions"
        >
          <RuntimeScenePositionGroup
            v-for="group in model.positionGroups"
            :key="group.key"
            :group="group"
            :selected="selectedGroup?.key === group.key"
            :selected-stack-key="selectedGroup?.key === group.key ? selectedStackKey : null"
            @select-position="selectGroup(group)"
            @select-stack="selectStack(group, $event)"
          />
        </div>
      </div>

      <RuntimeRackInspector
        v-if="showRackDetails && selectedGroup?.rackLayouts.length"
        :group="selectedGroup"
        :layout="selectedRackLayout"
        :selected-slot="selectedRackSlot"
        :resource-evidence-truncated="model.resourceEvidenceTruncated"
        :resource-evidence-visible-count="resourceEvidenceVisibleCount"
        :resource-evidence-total-count="model.resourceEvidenceTotalCount"
      />

      <RuntimeSceneFocusPanel
        v-else-if="showRackDetails"
        :group="selectedGroup"
        :stack="selectedStack"
        :resource-evidence-truncated="model.resourceEvidenceTruncated"
        :resource-evidence-visible-count="resourceEvidenceVisibleCount"
        :resource-evidence-total-count="model.resourceEvidenceTotalCount"
      />
    </div>

    <div
      v-else
      class="runtime-scene-map__empty"
      data-test="runtime-scene-empty-evidence"
    >
      {{
        model.semanticFallback
          ? '暂无结构化资源证据，当前仅展示通用 evidence 兜底。'
          : '暂无结构化资源证据'
      }}
    </div>

    <details
      v-if="model.unlocatedAuditItems.length"
      class="runtime-scene-map__unlocated"
      data-test="runtime-scene-unlocated-audit"
    >
      <summary class="runtime-scene-map__unlocated-summary">
        未定位证据 {{ model.unlocatedAuditItems.length }}
      </summary>
      <div class="runtime-scene-map__unlocated-body">
        <RuntimeSceneEvidencePanel
          :items="model.unlocatedAuditItems"
          :resource-evidence-truncated="model.resourceEvidenceTruncated"
          :resource-evidence-visible-count="resourceEvidenceVisibleCount"
          :resource-evidence-total-count="model.resourceEvidenceTotalCount"
        />
      </div>
    </details>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import RuntimeSceneDeviceFlow from '@/components/runtime/shared/RuntimeSceneDeviceFlow.vue'
import RuntimeRackInspector from './RuntimeRackInspector.vue'
import RuntimeRackLayoutPanel from './RuntimeRackLayoutPanel.vue'
import RuntimeSceneEvidencePanel from './RuntimeSceneEvidencePanel.vue'
import RuntimeSceneFocusPanel from './RuntimeSceneFocusPanel.vue'
import RuntimeScenePositionGroup from './RuntimeScenePositionGroup.vue'
import {
  expandManifestEdgesForLayout,
  type ExplicitLayoutEdge,
  type LayoutNodeInput,
  type ManifestTopologyEdgeInput
} from '@/utils/runtime-topology'
import type {
  RuntimeSceneModel,
  RuntimeScenePositionGroup as PositionGroup,
  RuntimeSceneRackLayout as RackLayout,
  RuntimeSceneRackSlot as RackSlot
} from '@/utils/runtime-scene'

const props = withDefaults(
  defineProps<{
    model: RuntimeSceneModel
    selectedDeviceId?: number | null
    showRackDetails?: boolean
  }>(),
  {
    selectedDeviceId: null,
    showRackDetails: false
  }
)

const emit = defineEmits<{
  selectDevice: [deviceId: number]
}>()

const selectedPositionKey = ref<string | null>(null)
const selectedStackKey = ref<string | null>(null)
const selectedRackLayoutKey = ref<string | null>(null)
const selectedRackSlotKey = ref<string | null>(null)

const resourceEvidenceVisibleCount = computed(() => props.model.resourceEvidence.length)

// Topology layout inputs derived from the scene model. When the manifest has
// neither nodes nor edges we leave both `undefined` so RuntimeSceneDeviceFlow
// falls back to the device-only layout (preserves prior behavior).
const layoutExplicitNodes = computed<LayoutNodeInput[] | undefined>(() => {
  const topologyNodes = props.model.topologyNodes ?? []
  const topologyEdges = props.model.topologyEdges ?? []
  if (topologyNodes.length === 0 && topologyEdges.length === 0) {
    return undefined
  }

  const inputs: LayoutNodeInput[] = []
  for (const device of props.model.deviceNodes) {
    inputs.push({ kind: 'device', device })
  }
  for (const node of topologyNodes) {
    if (node.kind === 'RACK_POSITION' && node.resolved) {
      inputs.push({ kind: 'rack_position', code: node.ref })
    }
  }
  return inputs
})

const layoutExplicitEdges = computed<ExplicitLayoutEdge[] | undefined>(() => {
  const topologyEdges = props.model.topologyEdges ?? []
  if (topologyEdges.length === 0) return undefined

  const knownRackPositions = new Set(
    (props.model.topologyNodes ?? [])
      .filter(node => node.kind === 'RACK_POSITION' && node.resolved)
      .map(node => node.ref)
  )

  const manifestInputs: ManifestTopologyEdgeInput[] = topologyEdges.map(edge => ({
    fromNode: { kind: edge.fromNode.kind, ref: edge.fromNode.ref },
    toNode: { kind: edge.toNode.kind, ref: edge.toNode.ref },
    type: edge.type
  }))
  return expandManifestEdgesForLayout(
    manifestInputs,
    props.model.deviceNodes,
    knownRackPositions
  )
})

// Rack-position node clicks are handled here without forwarding so they do
// not collide with device-only events. T8/T11 will replace the no-op with
// boundary group highlighting once selection state is plumbed through.
function handleSelectRackPosition(): void {
  // intentional no-op for now — see TODO above.
}

const selectedGroup = computed(
  () => props.model.positionGroups.find(group => group.key === selectedPositionKey.value) ?? null
)

const selectedStack = computed(
  () =>
    selectedGroup.value?.resourceStacks.find(stack => stack.key === selectedStackKey.value) ?? null
)

const selectedRackLayout = computed(
  () =>
    selectedGroup.value?.rackLayouts.find(layout => layout.key === selectedRackLayoutKey.value) ??
    null
)

const selectedRackSlot = computed(
  () => selectedRackLayout.value?.slots.find(slot => slot.key === selectedRackSlotKey.value) ?? null
)

function getDefaultGroup(groups: PositionGroup[]): PositionGroup | null {
  const hasRenderableEvidence = (group: PositionGroup) =>
    group.rackLayouts.length > 0 || group.resourceStacks.length > 0
  const isHighAttention = (group: PositionGroup) =>
    group.attentionState === 'blocked' || group.attentionState === 'waiting'

  return (
    groups.find(group => isHighAttention(group) && hasRenderableEvidence(group)) ??
    groups.find(isHighAttention) ??
    groups.find(hasRenderableEvidence) ??
    groups[0] ??
    null
  )
}

function syncSelection(): void {
  const groups = props.model.positionGroups
  const currentGroup = groups.find(group => group.key === selectedPositionKey.value)
  const nextGroup = currentGroup ?? getDefaultGroup(groups)

  selectedPositionKey.value = nextGroup?.key ?? null

  if (!nextGroup) {
    selectedStackKey.value = null
    return
  }

  const currentStack = nextGroup.resourceStacks.find(stack => stack.key === selectedStackKey.value)
  selectedStackKey.value = currentStack?.key ?? nextGroup.resourceStacks[0]?.key ?? null

  const currentRackLayout = nextGroup.rackLayouts.find(
    layout => layout.key === selectedRackLayoutKey.value
  )
  const nextRackLayout = currentRackLayout ?? getDefaultRackLayout(nextGroup)
  selectedRackLayoutKey.value = nextRackLayout?.key ?? null
  selectedRackSlotKey.value = nextRackLayout
    ? (getNextRackSlot(nextRackLayout, selectedRackSlotKey.value)?.key ?? null)
    : null
}

function selectGroup(group: PositionGroup): void {
  selectedPositionKey.value = group.key
  selectedStackKey.value = group.resourceStacks[0]?.key ?? null
  const layout = getDefaultRackLayout(group)
  selectedRackLayoutKey.value = layout?.key ?? null
  selectedRackSlotKey.value = layout ? (getNextRackSlot(layout, null)?.key ?? null) : null
}

function selectStack(group: PositionGroup, stackKey: string): void {
  selectedPositionKey.value = group.key
  selectedStackKey.value = stackKey
}

function getDefaultRackLayout(group: PositionGroup): RackLayout | null {
  return group.rackLayouts[0] ?? null
}

function getNextRackSlot(layout: RackLayout, currentSlotKey: string | null): RackSlot | null {
  const currentSlot = layout.slots.find(slot => slot.key === currentSlotKey)
  return (
    currentSlot ??
    layout.slots.find(slot => slot.state === 'material') ??
    layout.slots.find(slot => slot.state === 'occupied') ??
    layout.slots[0] ??
    null
  )
}

function selectRackLayout(layoutKey: string): void {
  selectedRackLayoutKey.value = layoutKey
  const layout = selectedGroup.value?.rackLayouts.find(item => item.key === layoutKey) ?? null
  selectedRackSlotKey.value = layout ? (getNextRackSlot(layout, null)?.key ?? null) : null
}

function selectRackSlot(slotKey: string): void {
  selectedRackSlotKey.value = slotKey
}

watch(() => props.model.positionGroups, syncSelection, { immediate: true, deep: true })
</script>

<style scoped>
.runtime-scene-map {
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-width: 0;
}

.runtime-scene-map__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.runtime-scene-map__meta {
  margin-top: 4px;
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.runtime-scene-map__count {
  flex: 0 0 auto;
  padding: 4px 8px;
  border-radius: 8px;
  background: var(--runtime-surface-accent, rgb(245, 158, 11, 0.12));
  color: var(--runtime-text-emphasis, rgb(245, 158, 11));
  font-size: 12px;
  font-weight: 600;
}

.runtime-scene-map__fallback {
  padding: 10px 12px;
  border: 1px solid rgb(245, 158, 11, 0.32);
  border-radius: 8px;
  background: var(--runtime-surface-accent, rgb(245, 158, 11, 0.12));
  color: var(--runtime-text-emphasis, rgb(245, 158, 11));
  font-size: 12px;
  font-weight: 600;
}

.runtime-scene-map__layout {
  display: grid;
  grid-template-columns: minmax(360px, 1fr) minmax(320px, 0.82fr);
  gap: 12px;
  align-items: start;
  min-width: 0;
}

.runtime-scene-map__layout.is-summary-only {
  grid-template-columns: 1fr;
}

.runtime-scene-map__rack-stage {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.runtime-scene-map__position-rail,
.runtime-scene-map__rack-tabs {
  display: flex;
  gap: 8px;
  min-width: 0;
  overflow-x: auto;
  padding-bottom: 2px;
}

.runtime-scene-map__position-tab,
.runtime-scene-map__rack-tab {
  min-width: 0;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--runtime-surface);
  color: var(--runtime-text);
  cursor: pointer;
  text-align: left;
}

.runtime-scene-map__position-tab {
  display: grid;
  gap: 3px;
  flex: 1 0 min(260px, 90%);
  padding: 9px 10px;
}

.runtime-scene-map__position-tab strong {
  font-family: var(--font-mono);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.runtime-scene-map__position-tab span {
  color: var(--runtime-text-muted);
  font-size: 11px;
  overflow-wrap: anywhere;
}

.runtime-scene-map__position-role {
  font-weight: 800;
  letter-spacing: 0.06em;
}

.runtime-scene-map__position-tab.is-selected,
.runtime-scene-map__rack-tab.is-selected {
  border-color: rgb(245, 158, 11, 0.58);
  box-shadow: inset 0 0 0 1px rgb(245, 158, 11, 0.22);
}

.runtime-scene-map__position-tab.is-blocked {
  border-color: rgb(220, 38, 38, 0.45);
}

.runtime-scene-map__position-tab.is-waiting {
  border-color: rgb(245, 158, 11, 0.42);
}

.runtime-scene-map__rack-tab {
  flex: 0 0 auto;
  padding: 6px 10px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 800;
}

.runtime-scene-map__positions {
  display: grid;
  gap: 10px;
  min-width: 0;
}

.runtime-scene-map__empty {
  padding: 18px;
  border: 1px dashed var(--runtime-border-subtle, rgb(148, 163, 184, 0.5));
  border-radius: 8px;
  color: var(--runtime-text-muted);
  text-align: center;
}

.runtime-scene-map__unlocated {
  min-width: 0;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 8px;
  background: var(--runtime-surface);
}

.runtime-scene-map__unlocated-summary {
  padding: 10px 12px;
  color: var(--runtime-text);
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.runtime-scene-map__unlocated-body {
  padding: 0 12px 12px;
}

@media (width <= 768px) {
  .runtime-scene-map__header {
    flex-direction: column;
  }

  .runtime-scene-map__layout {
    grid-template-columns: 1fr;
  }

  .runtime-scene-map__position-rail {
    display: grid;
    grid-template-columns: 1fr;
    overflow-x: visible;
  }

  .runtime-scene-map__position-tab {
    width: 100%;
  }
}
</style>
