<template>
  <div class="dashboard-page">
    <!-- 欢迎卡片 -->
    <div class="welcome-card">
      <div class="welcome-content">
        <h1 class="welcome-title">
          <span class="title-highlight">欢迎使用</span> P9 WES
        </h1>
        <p class="welcome-subtitle">
          休斯顿智能仓储执行系统
        </p>
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

    <!-- 统计卡片 -->
    <el-row :gutter="20">
      <el-col
        v-for="stat in statistics"
        :key="stat.key"
        :xs="24"
        :sm="12"
        :md="6"
      >
        <div class="stat-card">
          <div class="stat-icon">
            <component :is="stat.icon" />
          </div>
          <div class="stat-content">
            <p class="stat-label">
              {{ stat.label }}
            </p>
            <p class="stat-value">
              {{ stat.value }}
            </p>
          </div>
          <div
            class="stat-indicator"
            :class="stat.trend"
          >
            <el-icon>
              <component :is="stat.trendIcon" />
            </el-icon>
            <span>{{ stat.change }}</span>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 系统状态 -->
    <el-row :gutter="20">
      <el-col :span="24">
        <div class="status-card">
          <div class="card-header">
            <h3 class="card-title">
              系统状态
            </h3>
            <div class="status-badge">
              <span class="status-dot" />
              <span>正常运行</span>
            </div>
          </div>
          <div class="card-content">
            <p>
              当前环境: <strong>{{ appTitle }}</strong>
            </p>
            <p>系统版本: <strong>v0.1.0</strong></p>
            <p>后端 API: <strong>已连接</strong></p>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useEnv } from '@/composables/useEnv'
import {
  Monitor,
  DataAnalysis,
  Notification,
  Tools,
  ArrowUp,
  ArrowDown,
  Minus
} from '@element-plus/icons-vue'

const { appTitle } = useEnv()

// 统计数据
const statistics = ref([
  {
    key: 'devices',
    label: '在线设备',
    value: 48,
    change: '+12%',
    trend: 'up',
    trendIcon: ArrowUp,
    icon: Monitor
  },
  {
    key: 'tasks',
    label: '今日任务',
    value: 156,
    change: '+8%',
    trend: 'up',
    trendIcon: ArrowUp,
    icon: Tools
  },
  {
    key: 'alerts',
    label: '告警信息',
    value: 3,
    change: '-25%',
    trend: 'down',
    trendIcon: ArrowDown,
    icon: Notification
  },
  {
    key: 'efficiency',
    label: '运行效率',
    value: '94.5%',
    change: '0%',
    trend: 'stable',
    trendIcon: Minus,
    icon: DataAnalysis
  }
])
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
  background: rgb(10 14 39 / 80%);
  border: 1px solid rgb(0 243 255 / 10%);
  border-radius: 16px;
  backdrop-filter: blur(20px);
  overflow: hidden;
}

.welcome-content {
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 36px;
  font-weight: 700;
  margin: 0 0 8px;
  background: linear-gradient(135deg, #00f3ff 0%, #0f8 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-highlight {
  font-size: 42px;
}

.welcome-subtitle {
  font-size: 16px;
  color: rgb(255 255 255 / 60%);
  margin: 0;
  letter-spacing: 2px;
  text-transform: uppercase;
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
  background: linear-gradient(90deg, transparent 0%, rgb(0 243 255 / 30%) 100%);
}

.decoration-grid {
  position: absolute;
  inset: 0;
}

.grid-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  background: rgb(0 243 255 / 20%);
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

/* ==================== 统计卡片 ==================== */
.stat-card {
  position: relative;
  padding: 24px;
  margin-bottom: 20px;
  background: rgb(13 17 23 / 80%);
  border: 1px solid rgb(0 243 255 / 10%);
  border-radius: 12px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  overflow: hidden;
}

.stat-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #00f3ff 50%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.stat-card:hover {
  border-color: rgb(0 243 255 / 30%);
  transform: translateY(-4px);
  box-shadow: 0 20px 40px rgb(0 0 0 / 40%);
}

.stat-card:hover::before {
  opacity: 1;
}

.stat-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  color: #00f3ff;
  background: rgb(0 243 255 / 8%);
  border: 1px solid rgb(0 243 255 / 20%);
  border-radius: 10px;
  font-size: 24px;
}

.stat-content {
  margin-bottom: 16px;
}

.stat-label {
  font-size: 14px;
  color: rgb(255 255 255 / 60%);
  margin: 0 0 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.stat-indicator {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.stat-indicator.up {
  color: #0f8;
  background: rgb(0 255 136 / 10%);
}

.stat-indicator.down {
  color: #f56c6c;
  background: rgb(245 108 108 / 10%);
}

.stat-indicator.stable {
  color: rgb(255 255 255 / 60%);
  background: rgb(255 255 255 / 5%);
}

/* ==================== 状态卡片 ==================== */
.status-card {
  padding: 24px;
  background: rgb(13 17 23 / 80%);
  border: 1px solid rgb(0 243 255 / 10%);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.card-title {
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: rgb(0 255 136 / 8%);
  border: 1px solid rgb(0 255 136 / 20%);
  border-radius: 6px;
  font-size: 13px;
  color: #0f8;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #0f8;
  border-radius: 50%;
  animation: statusPulse 2s ease-in-out infinite;
  box-shadow: 0 0 10px rgb(0 255 136 / 50%);
}

@keyframes statusPulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.card-content p {
  font-size: 14px;
  color: rgb(255 255 255 / 70%);
  margin: 0 0 8px;
}

.card-content strong {
  color: #00f3ff;
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
