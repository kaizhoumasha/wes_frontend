<script setup lang="ts">
defineProps<{
  confirmText: string
  confirmDisabled: boolean
  confirmLoading?: boolean
  closable: boolean
  hideCancel: boolean
  dirty?: boolean
  showContinue?: boolean
}>()
defineEmits<{ confirm: []; continue: []; close: [] }>()
</script>
<template>
  <footer class="configuration-actions">
    <span role="status">
      {{ dirty ? '当前步骤有未保存的修改' : '配置保存与工作线启动分别操作' }}
    </span>
    <div>
      <ElButton
        v-if="!hideCancel"
        :disabled="!closable"
        @click="$emit('close')"
      >
        返回工作线
      </ElButton>
      <ElButton
        :type="showContinue ? 'default' : 'primary'"
        :disabled="confirmDisabled"
        :loading="confirmLoading"
        @click="$emit('confirm')"
      >
        {{ confirmText }}
      </ElButton>
      <ElButton
        v-if="showContinue"
        type="primary"
        :disabled="confirmDisabled"
        :loading="confirmLoading"
        @click="$emit('continue')"
      >
        保存并继续
      </ElButton>
    </div>
  </footer>
</template>
<style scoped>
.configuration-actions {
  position: sticky;
  bottom: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-sm);
  padding: var(--space-sm);
  margin-top: var(--space-md);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--radius-md);
  background: var(--el-bg-color);
}
.configuration-actions > div {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2xs);
}
.configuration-actions :deep(.el-button + .el-button) {
  margin-left: 0;
}
.configuration-actions span {
  color: var(--color-text-secondary);
}

@media (width <= 600px) {
  .configuration-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
