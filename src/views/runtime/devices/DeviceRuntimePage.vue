<template>
  <div class="runtime-page">
    <div class="runtime-page__header">
      <div>
        <h1 class="runtime-page__title">设备运行时</h1>
        <p class="runtime-page__subtitle">
          跨工作线查看所有设备运行状态，按状态分组筛选，支持维护模式管理。
        </p>
      </div>
    </div>
    <RuntimeEmptyState
      title="设备运行时视图"
      description="此模块将在下一阶段完善。当前可通过工作线监控页面查看设备状态。"
      hint="功能规划中：设备网格视图、按状态分组、维护模式操作。"
    />
  </div>
</template>

<script setup lang="ts">
import RuntimeEmptyState from '@/components/common/runtime/RuntimeEmptyState.vue'
</script>

<style scoped>
.runtime-page__subtitle {
  max-width: 560px;
  margin-top: 4px;
  color: #94a3b8;
  font-size: 13px;
  line-height: 1.6;
}
</style>
