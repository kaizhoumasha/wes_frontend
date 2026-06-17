<template>
  <div class="runtime-frozen-notice">
    <div class="runtime-frozen-notice__title">{{ title }}</div>
    <div class="runtime-frozen-notice__description">{{ description }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    title?: string
    description?: string
  }>(),
  {
    title: '实时刷新已冻结',
    description: '当前页面不会自动应用 SSE 推送；你仍可继续查看证据，并在需要时手动刷新。'
  }
)
</script>

<style scoped>
.runtime-frozen-notice {
  padding: 14px 16px;
  border: 1px solid rgb(var(--color-warning-rgb) / 0.28);
  border-radius: 14px;
  background: linear-gradient(
    90deg,
    rgb(var(--color-warning-rgb) / 0.12),
    rgb(var(--color-industrial-dark-bg-rgb) / 0.72)
  );
}

.runtime-frozen-notice__title {
  color: var(--runtime-badge-warning-text);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.runtime-frozen-notice__description {
  margin-top: 6px;
  color: var(--runtime-text-emphasis);
  font-size: 13px;
  line-height: 1.6;
}
</style>
