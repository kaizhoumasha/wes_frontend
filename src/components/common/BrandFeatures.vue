<script setup lang="ts">
interface FeatureItem {
  icon: string
  label: string
}

const features: FeatureItem[] = [
  {
    icon: 'M13 2L3 14h9l-1 8 10-12h-9l1-8z',
    label: '实时监控'
  },
  {
    icon: 'M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z M3.27 6.96 12 12.01 20.73 6.96 M12 22.08V12',
    label: '智能调度'
  },
  {
    icon: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
    label: '安全可靠'
  }
]
</script>

<template>
  <div class="brand-features">
    <div
      v-for="feature in features"
      :key="feature.label"
      class="feature-item"
    >
      <div class="feature-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path :d="feature.icon" />
        </svg>
      </div>
      <span>{{ feature.label }}</span>
    </div>
  </div>
</template>

<style scoped>
/* 功能特性 */
.brand-features {
  display: flex;
  gap: 24px;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border-radius: 12px;
  transition: all 0.3s ease;
}

/* 暗黑模式特性项 */
html.dark .feature-item {
  background: rgb(0 243 255 / 3%);
  border: 1px solid rgb(0 243 255 / 10%);
}

html.dark .feature-item:hover {
  background: rgb(0 243 255 / 8%);
  border-color: rgb(0 243 255 / 30%);
}

html.dark .feature-item span {
  color: rgb(255 255 255 / 70%);
}

/* 亮模式特性项 */
html:not(.dark) .feature-item {
  background: #f5f7fa;
  border: 1px solid #e4e7ed;
}

html:not(.dark) .feature-item:hover {
  background: #ecf5ff;
  border-color: #409eff;
}

html:not(.dark) .feature-item span {
  color: #606266;
}

.feature-item span {
  font-size: 14px;
}

.feature-item:hover {
  transform: translateY(-4px);
}

.feature-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.3s ease;
}

/* 暗黑模式图标颜色 */
html.dark .feature-icon {
  color: #00f3ff;
}

/* 亮模式图标颜色 */
html:not(.dark) .feature-icon {
  color: #409eff;
}
</style>
