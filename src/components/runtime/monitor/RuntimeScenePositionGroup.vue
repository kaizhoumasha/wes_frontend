<template>
  <section
    class="runtime-scene-position-group"
    :class="[`is-${group.attentionState}`, { 'is-selected': selected }]"
    data-test="runtime-scene-position-group"
    @click="emit('selectPosition')"
  >
    <div class="runtime-scene-position-group__header">
      <div>
        <div class="runtime-scene-position-group__role">
          {{ group.stationRole }}
        </div>
        <div class="runtime-scene-position-group__position">
          {{ group.stationCode }} / {{ group.positionCode }}
        </div>
      </div>
      <div class="runtime-scene-position-group__attention">
        {{ group.attentionState }}
      </div>
    </div>

    <div class="runtime-scene-position-group__facts">
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

    <div
      v-if="group.resourceStacks.length"
      class="runtime-scene-position-group__stacks"
    >
      <RuntimeSceneResourceStack
        v-for="stack in group.resourceStacks"
        :key="stack.key"
        :stack="stack"
        :selected="selectedStackKey === stack.key"
        @select="emit('selectStack', stack.key)"
      />
    </div>
    <div
      v-else
      class="runtime-scene-position-group__empty"
    >
      暂无挂载资源
    </div>
  </section>
</template>

<script setup lang="ts">
import RuntimeSceneResourceStack from './RuntimeSceneResourceStack.vue'
import type { RuntimeScenePositionGroup } from '@/utils/runtime-scene'

withDefaults(
  defineProps<{
    group: RuntimeScenePositionGroup
    selected: boolean
    selectedStackKey?: string | null
  }>(),
  {
    selectedStackKey: null
  }
)

const emit = defineEmits<{
  selectPosition: []
  selectStack: [stackKey: string]
}>()
</script>

<style scoped>
.runtime-scene-position-group {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 0;
  padding: 12px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 8px;
  background: var(--runtime-surface);
  color: var(--runtime-text);
  cursor: pointer;
  transition:
    border-color 150ms ease,
    box-shadow 150ms ease;
}

.runtime-scene-position-group.is-selected {
  border-color: rgb(245, 158, 11, 0.58);
  box-shadow: inset 0 0 0 1px rgb(245, 158, 11, 0.22);
}

.runtime-scene-position-group.is-blocked {
  border-color: rgb(220, 38, 38, 0.45);
}

.runtime-scene-position-group.is-waiting {
  border-color: rgb(245, 158, 11, 0.42);
}

.runtime-scene-position-group.is-unknown {
  border-color: rgb(148, 163, 184, 0.35);
}

.runtime-scene-position-group__header {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  min-width: 0;
}

.runtime-scene-position-group__role {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.runtime-scene-position-group__position {
  margin-top: 4px;
  color: var(--runtime-text);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
  overflow-wrap: anywhere;
}

.runtime-scene-position-group__attention {
  flex: 0 0 auto;
  color: var(--runtime-text-muted);
  font-size: 12px;
  font-weight: 700;
}

.runtime-scene-position-group__facts {
  display: grid;
  gap: 4px;
  color: var(--runtime-text-muted);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.runtime-scene-position-group__stacks {
  display: grid;
  gap: 8px;
  min-width: 0;
}

.runtime-scene-position-group__empty {
  padding: 14px;
  border: 1px dashed var(--runtime-border-subtle, rgb(148, 163, 184, 0.28));
  border-radius: 6px;
  color: var(--runtime-text-muted);
  font-size: 13px;
  text-align: center;
}
</style>
