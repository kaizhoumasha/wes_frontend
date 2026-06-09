<template>
  <button
    type="button"
    class="runtime-scene-resource-stack"
    :class="{ 'is-selected': selected }"
    data-test="runtime-scene-resource-stack"
    @click.stop="emit('select')"
  >
    <div class="runtime-scene-resource-stack__top">
      <span class="runtime-scene-resource-stack__anchor-kind">
        {{ stack.anchor.kind }}
      </span>
      <span class="runtime-scene-resource-stack__anchor-code">
        {{ stack.anchor.code }}
      </span>
    </div>
    <div class="runtime-scene-resource-stack__label">
      {{ stack.anchor.displayLabel }}
    </div>
    <div
      v-if="stack.children.length"
      class="runtime-scene-resource-stack__children"
    >
      <span
        v-for="child in stack.children"
        :key="child.key"
        class="runtime-scene-resource-stack__child"
      >
        {{ child.kind }}:{{ child.code }}
      </span>
    </div>
    <div
      v-else
      class="runtime-scene-resource-stack__empty"
    >
      无下级资源
    </div>
    <div class="runtime-scene-resource-stack__count">{{ stack.evidenceCount }} 条 evidence</div>
  </button>
</template>

<script setup lang="ts">
import type { RuntimeSceneResourceStack } from '@/utils/runtime-scene'

defineProps<{
  stack: RuntimeSceneResourceStack
  selected: boolean
}>()

const emit = defineEmits<{
  select: []
}>()
</script>

<style scoped>
.runtime-scene-resource-stack {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  min-width: 0;
  padding: 10px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 6px;
  background: var(--runtime-surface);
  color: var(--runtime-text);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.runtime-scene-resource-stack:hover {
  border-color: rgb(245, 158, 11, 0.32);
}

.runtime-scene-resource-stack.is-selected {
  border-color: rgb(245, 158, 11, 0.58);
  box-shadow: inset 0 0 0 1px rgb(245, 158, 11, 0.24);
}

.runtime-scene-resource-stack__top,
.runtime-scene-resource-stack__children {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.runtime-scene-resource-stack__anchor-kind {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 700;
}

.runtime-scene-resource-stack__anchor-code,
.runtime-scene-resource-stack__child {
  font-family: var(--font-mono);
  overflow-wrap: anywhere;
}

.runtime-scene-resource-stack__anchor-code {
  font-size: 13px;
  font-weight: 800;
}

.runtime-scene-resource-stack__label,
.runtime-scene-resource-stack__count,
.runtime-scene-resource-stack__empty {
  color: var(--runtime-text-muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.runtime-scene-resource-stack__child {
  padding: 2px 5px;
  border-radius: 4px;
  background: var(--runtime-badge-info-bg, rgb(59, 130, 246, 0.1));
  color: var(--runtime-badge-info-text, #1d4ed8);
  font-size: 11px;
}
</style>
