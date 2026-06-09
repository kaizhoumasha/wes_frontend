<template>
  <div
    class="runtime-scene-map"
    data-test="runtime-scene-map"
  >
    <div class="runtime-scene-map__header">
      <div>
        <div class="runtime-scene-map__title">{{ model.worklineName }}</div>
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
      :selected-device-id="selectedDeviceId"
      :session-counts-by-device="sessionCountsByDevice"
      :trace-path-nodes="tracePathNodes"
      :blocking-device-id="blockingDeviceId"
      @select="emit('selectDevice', $event)"
    />

    <div
      v-if="model.positionGroups.length"
      class="runtime-scene-map__layout"
    >
      <div class="runtime-scene-map__positions">
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

      <RuntimeSceneFocusPanel
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
import RuntimeSceneEvidencePanel from './RuntimeSceneEvidencePanel.vue'
import RuntimeSceneFocusPanel from './RuntimeSceneFocusPanel.vue'
import RuntimeScenePositionGroup from './RuntimeScenePositionGroup.vue'
import type { RuntimeTraceDevicePathNode } from '@/types/runtime'
import type {
  RuntimeSceneModel,
  RuntimeScenePositionGroup as PositionGroup
} from '@/utils/runtime-scene'

const props = withDefaults(
  defineProps<{
    model: RuntimeSceneModel
    selectedDeviceId?: number | null
    sessionCountsByDevice?: Map<number, number> | Record<number, number>
    tracePathNodes?: RuntimeTraceDevicePathNode[]
    blockingDeviceId?: number | null
  }>(),
  {
    selectedDeviceId: null,
    sessionCountsByDevice: undefined,
    tracePathNodes: () => [],
    blockingDeviceId: null
  }
)

const emit = defineEmits<{
  selectDevice: [deviceId: number]
}>()

const selectedPositionKey = ref<string | null>(null)
const selectedStackKey = ref<string | null>(null)

const resourceEvidenceVisibleCount = computed(() => props.model.resourceEvidence.length)

const selectedGroup = computed(
  () => props.model.positionGroups.find(group => group.key === selectedPositionKey.value) ?? null
)

const selectedStack = computed(
  () =>
    selectedGroup.value?.resourceStacks.find(stack => stack.key === selectedStackKey.value) ?? null
)

function getDefaultGroup(groups: PositionGroup[]): PositionGroup | null {
  return (
    groups.find(
      group => group.attentionState === 'blocked' || group.attentionState === 'waiting'
    ) ??
    groups.find(group => group.resourceStacks.length > 0) ??
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
}

function selectGroup(group: PositionGroup): void {
  selectedPositionKey.value = group.key
  selectedStackKey.value = group.resourceStacks[0]?.key ?? null
}

function selectStack(group: PositionGroup, stackKey: string): void {
  selectedPositionKey.value = group.key
  selectedStackKey.value = stackKey
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

.runtime-scene-map__title {
  color: var(--runtime-text);
  font-size: 16px;
  font-weight: 700;
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
  background: rgb(245, 158, 11, 0.12);
  color: rgb(146, 64, 14);
  font-size: 12px;
  font-weight: 600;
}

.runtime-scene-map__fallback {
  padding: 10px 12px;
  border: 1px solid rgb(245, 158, 11, 0.32);
  border-radius: 8px;
  background: rgb(255, 251, 235);
  color: rgb(146, 64, 14);
  font-size: 12px;
  font-weight: 600;
}

.runtime-scene-map__layout {
  display: grid;
  grid-template-columns: minmax(280px, 1fr) minmax(300px, 0.9fr);
  gap: 12px;
  align-items: start;
  min-width: 0;
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
}
</style>
