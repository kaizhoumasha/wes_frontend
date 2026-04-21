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
  border: 1px solid rgb(234, 179, 8, 0.28);
  border-radius: 14px;
  background: linear-gradient(90deg, rgb(234, 179, 8, 0.12), rgb(15, 23, 42, 0.72));
}

.runtime-frozen-notice__title {
  color: #fde68a;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.runtime-frozen-notice__description {
  margin-top: 6px;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
}
</style>
