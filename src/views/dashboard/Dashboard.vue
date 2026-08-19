<template>
  <div class="dashboard-page">
    <!-- 欢迎卡片 -->
    <div class="welcome-card">
      <div class="welcome-content">
        <h1 class="welcome-title">
          <span class="title-highlight">欢迎使用</span>
          {{ appTitle }}
        </h1>
        <p class="welcome-subtitle">休斯顿智能物料控制系统</p>
      </div>
      <div class="welcome-decoration">
        <div class="decoration-line" />
        <div class="decoration-grid">
          <div
            v-for="i in 20"
            :key="i"
            class="grid-dot"
          />
        </div>
      </div>
    </div>

    <section
      class="dashboard-guide"
      aria-labelledby="dashboard-guide-title"
    >
      <h2 id="dashboard-guide-title">功能入口</h2>
      <p>请从左侧菜单进入对应功能。</p>
      <p>设备、工作线和运行结果以各业务页面及后端返回为准。</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useEnv } from '@/composables/useEnv'

const { appTitle } = useEnv()
</script>

<style scoped>
/* ==================== 页面容器 ==================== */
.dashboard-page {
  max-width: 1400px;
  margin: 0 auto;
}

/* ==================== 欢迎卡片 ==================== */
.welcome-card {
  position: relative;
  padding: 40px;
  margin-bottom: 24px;
  border-radius: 16px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 暗黑模式欢迎卡片 */
html.dark .welcome-card {
  background: rgb(10 14 39 / 80%);
  border: 1px solid rgb(var(--color-primary-rgb) / 10%);
}

/* 亮模式欢迎卡片 */
html:not(.dark) .welcome-card {
  background: #f5f6f7;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-highlight {
  font-size: 42px;
}

.welcome-subtitle {
  font-size: 16px;
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

/* 暗黑模式副标题 */
html.dark .welcome-subtitle {
  color: rgb(var(--color-industrial-light-surface-rgb) / 60%);
}

/* 亮模式副标题 */
html:not(.dark) .welcome-subtitle {
  color: #606266;
}

/* 装饰元素 */
.welcome-decoration {
  position: absolute;
  top: 0;
  right: 0;
  width: 300px;
  height: 100%;
  overflow: hidden;
  pointer-events: none;
}

.decoration-line {
  position: absolute;
  top: 50%;
  right: 0;
  width: 200px;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgb(var(--color-primary-rgb) / 30%) 100%);
}

.decoration-grid {
  position: absolute;
  inset: 0;
}

.grid-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgb(var(--color-primary-rgb) / 20%);
  border-radius: 50%;
}

/* 生成网格点 */
.grid-dot:nth-child(1) {
  top: 20%;
  right: 20%;
}
.grid-dot:nth-child(2) {
  top: 40%;
  right: 15%;
}
.grid-dot:nth-child(3) {
  top: 60%;
  right: 25%;
}
.grid-dot:nth-child(4) {
  top: 80%;
  right: 18%;
}

/* ==================== 功能引导 ==================== */
.dashboard-guide {
  padding: 24px;
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

html.dark .dashboard-guide {
  background: rgb(13 17 23 / 80%);
  border: 1px solid rgb(var(--color-primary-rgb) / 10%);
}

html:not(.dark) .dashboard-guide {
  background: #f5f6f7;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
}

.dashboard-guide h2 {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 16px;
}

html.dark .dashboard-guide h2 {
  color: var(--color-industrial-light-surface);
}

html:not(.dark) .dashboard-guide h2 {
  color: #303133;
}

.dashboard-guide p {
  font-size: 14px;
  margin: 0 0 8px;
}

html.dark .dashboard-guide p {
  color: rgb(var(--color-industrial-light-surface-rgb) / 70%);
}

html:not(.dark) .dashboard-guide p {
  color: #606266;
}

/* ==================== 响应式设计 ==================== */
@media (width < 768px) {
  .welcome-card {
    padding: 24px;
  }

  .welcome-title {
    font-size: 28px;
  }

  .title-highlight {
    font-size: 32px;
  }

  .welcome-decoration {
    display: none;
  }
}
</style>
