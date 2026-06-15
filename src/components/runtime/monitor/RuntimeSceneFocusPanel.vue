<template>
  <aside
    class="runtime-scene-focus-panel"
    data-test="runtime-scene-focus-panel"
  >
    <div
      v-if="!group"
      class="runtime-scene-focus-panel__empty"
      data-test="runtime-scene-focus-empty"
    >
      请选择现场位置
    </div>

    <template v-else>
      <header class="runtime-scene-focus-panel__header">
        <div class="runtime-scene-focus-panel__role">{{ group.stationRole }}</div>
        <div class="runtime-scene-focus-panel__position">
          {{ group.stationCode }} / {{ group.positionCode }}
        </div>
        <div class="runtime-scene-focus-panel__attention">
          {{ group.attentionState }}
        </div>
      </header>

      <section
        v-if="stack"
        class="runtime-scene-focus-panel__stack"
      >
        <div class="runtime-scene-focus-panel__stack-title">
          <span>{{ stack.anchor.kind }}</span>
          <strong>{{ stack.anchor.code }}</strong>
        </div>
        <div class="runtime-scene-focus-panel__stack-label">
          {{ stack.anchor.displayLabel }}
        </div>
        <div
          v-if="stack.children.length"
          class="runtime-scene-focus-panel__children"
        >
          <span
            v-for="child in stack.children"
            :key="child.key"
            class="runtime-scene-focus-panel__child"
          >
            {{ child.kind }}:{{ child.code }}
          </span>
        </div>
      </section>

      <RuntimeSceneEvidencePanel
        :items="evidenceItems"
        :resource-evidence-truncated="resourceEvidenceTruncated"
        :resource-evidence-visible-count="resourceEvidenceVisibleCount"
        :resource-evidence-total-count="resourceEvidenceTotalCount"
      />
    </template>
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeSceneEvidencePanel from './RuntimeSceneEvidencePanel.vue'
import type { RuntimeScenePositionGroup, RuntimeSceneResourceStack } from '@/utils/runtime-scene'

const props = defineProps<{
  group: RuntimeScenePositionGroup | null
  stack: RuntimeSceneResourceStack | null
  resourceEvidenceTruncated: boolean
  resourceEvidenceVisibleCount: number
  resourceEvidenceTotalCount: number
}>()

const evidenceItems = computed(() => props.stack?.auditItems ?? props.group?.auditItems ?? [])
</script>

<style scoped>
.runtime-scene-focus-panel {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 8px;
  background: var(--runtime-surface);
  color: var(--runtime-text);
}

.runtime-scene-focus-panel__empty {
  padding: 24px 12px;
  color: var(--runtime-text-muted);
  font-size: 13px;
  text-align: center;
}

.runtime-scene-focus-panel__header {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.runtime-scene-focus-panel__role {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.runtime-scene-focus-panel__position,
.runtime-scene-focus-panel__stack-title strong,
.runtime-scene-focus-panel__child {
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.runtime-scene-focus-panel__position {
  color: var(--runtime-text);
  font-size: 14px;
  font-weight: 800;
}

.runtime-scene-focus-panel__attention,
.runtime-scene-focus-panel__stack-label {
  color: var(--runtime-text-muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.runtime-scene-focus-panel__stack {
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 6px;
}

.runtime-scene-focus-panel__stack-title {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}

.runtime-scene-focus-panel__stack-title span {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 700;
}

.runtime-scene-focus-panel__stack-title strong {
  color: var(--runtime-text);
  font-size: 13px;
}

.runtime-scene-focus-panel__children {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  min-width: 0;
}

.runtime-scene-focus-panel__child {
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--runtime-badge-info-bg, rgb(59, 130, 246, 0.1));
  color: var(--runtime-badge-info-text, #1d4ed8);
  font-size: 11px;
}
</style>
