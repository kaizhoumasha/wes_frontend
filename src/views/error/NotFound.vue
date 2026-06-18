<template>
  <ErrorLayout status-code="404">
    <template #icon>
      <div class="icon-404">
        <!-- 迷宫/网格图标 - 表示"迷失" -->
        <svg
          viewBox="0 0 80 80"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          class="maze-icon"
        >
          <!-- 外框 -->
          <rect
            x="8"
            y="8"
            width="64"
            height="64"
            rx="4"
          />
          <!-- 迷宫路径 -->
          <path d="M8 28h20v-20" />
          <path d="M28 28v24h24v-24" />
          <path d="M52 8v20h20" />
          <path d="M8 52h20v20" />
          <path d="M52 52h20v20" />
          <!-- 问号 -->
          <circle
            cx="40"
            cy="40"
            r="12"
            stroke-dasharray="4 4"
          />
          <path
            d="M40 44v2"
            stroke-width="3"
          />
          <path d="M37 36c0-2 1-4 3-4s3 2 3 4" />
        </svg>
        <!-- 旋转指示器 -->
        <div class="compass-ring" />
      </div>
    </template>

    <template #title>页面不存在</template>

    <template #description>
      {{ description }}
    </template>

    <template #info>
      <div
        v-if="targetPath"
        class="route-info"
      >
        <span class="label">// 目标路径</span>
        <code class="path-code">{{ targetPath }}</code>
      </div>
    </template>

    <template #actions>
      <button
        class="btn btn-primary"
        @click="goBack"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        返回上一页
      </button>
      <button
        class="btn btn-secondary"
        @click="goDashboard"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect
            x="3"
            y="3"
            width="7"
            height="7"
          />
          <rect
            x="14"
            y="3"
            width="7"
            height="7"
          />
          <rect
            x="3"
            y="14"
            width="7"
            height="7"
          />
          <rect
            x="14"
            y="14"
            width="7"
            height="7"
          />
        </svg>
        回到仪表盘
      </button>
    </template>

    <template #hint>
      <span v-if="fromMenu">若这是后端菜单配置的入口，请补充对应前端路由或修正菜单 path。</span>
      <span v-else>当前访问的页面不存在，或对应前端路由尚未配置。</span>
    </template>
  </ErrorLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()
const route = useRoute()

const targetPath = computed(() => getSingleQueryValue(route.query.path) ?? route.fullPath)
const menuTitle = computed(() => getSingleQueryValue(route.query.title))

const fromMenu = computed(() => route.query.source === 'menu')

const description = computed(() => {
  if (fromMenu.value) {
    const menuLabel = menuTitle.value ? `"${menuTitle.value}"` : '该菜单'
    return `菜单 ${menuLabel} 指向了一个尚未注册的前端路由。请检查路由配置。`
  }
  return '您访问的页面不存在，可能已被移除或地址输入错误。'
})

onMounted(() => {
  console.warn('[404] 未找到匹配路由', {
    currentPath: route.fullPath,
    targetPath: targetPath.value,
    source: route.query.source,
    menuTitle: menuTitle.value
  })
})

function getSingleQueryValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function navigateToDashboard(): void {
  router.push('/dashboard')
}

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
    return
  }
  navigateToDashboard()
}

function goDashboard(): void {
  navigateToDashboard()
}
</script>

<style scoped>
/* 图标样式 */
.icon-404 {
  position: relative;
  width: 72px;
  height: 72px;
}

.maze-icon {
  width: 100%;
  height: 100%;
  animation: iconFloat 4s ease-in-out infinite;
}

html.dark .maze-icon {
  color: var(--color-primary);
  filter: drop-shadow(0 0 10px rgb(var(--color-primary-rgb) / 40%));
}

html:not(.dark) .maze-icon {
  color: #1e40af;
  filter: drop-shadow(0 0 10px rgb(30 64 175 / 30%));
}

@keyframes iconFloat {
  0%,
  100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-6px) rotate(3deg);
  }
}

/* 指南针环 */
.compass-ring {
  position: absolute;
  inset: -3px;
  border: 2px dashed;
  border-radius: 50%;
  animation: compassSpin 20s linear infinite;
}

html.dark .compass-ring {
  border-color: rgb(var(--color-primary-rgb) / 25%);
}

html:not(.dark) .compass-ring {
  border-color: rgb(30 64 175 / 20%);
}

@keyframes compassSpin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 路由信息 */
.route-info {
  border-radius: 8px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

html.dark .label {
  color: rgb(230 237 243 / 40%);
}

html:not(.dark) .label {
  color: var(--color-industrial-dark-text-muted);
}

.path-code {
  display: block;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: 'IBM Plex Mono', 'Fira Code', monospace;
  font-size: 14px;
  word-break: break-all;
}

html.dark .path-code {
  background: rgb(0 0 0 / 40%);
  color: #7cf7ff;
  border: 1px solid rgb(var(--color-primary-rgb) / 15%);
}

html:not(.dark) .path-code {
  background: var(--color-industrial-light-surface);
  color: var(--color-industrial-dark-surface);
  border: 1px solid var(--color-industrial-light-border);
}

/* 按钮样式 */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  letter-spacing: 0.02em;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
}

.btn svg {
  width: 16px;
  height: 16px;
}

.btn-primary {
  border: none;
}

html.dark .btn-primary {
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  color: #0d1117;
  box-shadow:
    0 4px 20px rgb(var(--color-primary-rgb) / 30%),
    inset 0 1px 0 rgb(var(--color-industrial-light-surface-rgb) / 20%);
}

html.dark .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 30px rgb(var(--color-primary-rgb) / 40%),
    inset 0 1px 0 rgb(var(--color-industrial-light-surface-rgb) / 20%);
}

html:not(.dark) .btn-primary {
  background: linear-gradient(135deg, #1e40af 0%, var(--color-info) 100%);
  color: var(--color-industrial-light-surface);
  box-shadow: 0 4px 20px rgb(30 64 175 / 25%);
}

html:not(.dark) .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgb(30 64 175 / 35%);
}

.btn-secondary {
  background: transparent;
}

html.dark .btn-secondary {
  color: #e6edf3;
  border: 1px solid rgb(var(--color-industrial-light-surface-rgb) / 15%);
}

html.dark .btn-secondary:hover {
  background: rgb(var(--color-industrial-light-surface-rgb) / 5%);
  border-color: rgb(var(--color-primary-rgb) / 30%);
  transform: translateY(-2px);
}

html:not(.dark) .btn-secondary {
  color: var(--color-industrial-light-text-secondary);
  border: 1px solid var(--color-industrial-light-border-hover);
}

html:not(.dark) .btn-secondary:hover {
  background: var(--color-industrial-light-bg);
  border-color: #1e40af;
  color: #1e40af;
  transform: translateY(-2px);
}

/* 响应式 */
@media (width <= 640px) {
  .btn {
    width: 100%;
    justify-content: center;
    padding: 12px 20px;
  }
}
</style>
