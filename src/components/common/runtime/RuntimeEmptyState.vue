<template>
  <div class="runtime-empty-state">
    <div class="runtime-empty-state__title">{{ title }}</div>
    <div class="runtime-empty-state__description">{{ description }}</div>
    <div
      v-if="hint"
      class="runtime-empty-state__hint"
    >
      {{ hint }}
    </div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title: string
    description: string
    hint?: string
  }>(),
  {
    hint: ''
  }
)
</script>

<style scoped>
.runtime-empty-state {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  gap: 8px;
  min-height: 140px;
  padding: 18px;
  border: 1px dashed rgb(var(--color-industrial-dark-text-secondary-rgb) / 0.28);
  border-radius: 14px;
  background: var(--runtime-surface-subtle);
}

.runtime-empty-state__title {
  color: var(--runtime-text-primary);
  font-size: 16px;
  font-weight: 700;
}

.runtime-empty-state__description {
  color: var(--runtime-text-emphasis);
  font-size: 13px;
  line-height: 1.7;
}

.runtime-empty-state__hint {
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}
</style>
