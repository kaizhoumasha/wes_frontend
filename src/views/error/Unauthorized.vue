<template>
  <div class="unauthorized-page">
    <div class="container">
      <!-- 403 图标 -->
      <div class="icon-wrapper">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>

      <!-- 锁定图标叠加 -->
      <div class="lock-icon">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
        >
          <rect
            x="3"
            y="11"
            width="18"
            height="11"
            rx="2"
            ry="2"
          />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>

      <!-- 标题 -->
      <h1 class="title">
        403
      </h1>
      <h2 class="subtitle">
        访问受限
      </h2>

      <!-- 说明信息 -->
      <p class="description">
        您没有访问此页面的权限
      </p>

      <!-- 所需权限提示 -->
      <div
        v-if="requiredPermission"
        class="permission-info"
      >
        <span class="label">所需权限：</span>
        <code class="permission-code">{{ requiredPermission }}</code>
      </div>

      <!-- 操作按钮 -->
      <div class="actions">
        <button
          class="btn-primary"
          @click="goBack"
        >
          返回上一页
        </button>
        <button
          class="btn-secondary"
          @click="goHome"
        >
          回到首页
        </button>
      </div>

      <!-- 联系管理员提示 -->
      <p class="hint">
        如果您认为这是一个错误，请联系系统管理员
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

// 从查询参数中获取重定向路径和所需权限
const redirectPath = computed(() => route.query.redirect as string | undefined)
const requiredPermission = computed(() => route.query.permission as string | undefined)

onMounted(() => {
  console.warn(`[403] 无权限访问`, {
    path: route.path,
    redirect: redirectPath.value,
    permission: requiredPermission.value
  })
})

const goBack = () => {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.unauthorized-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  padding: 20px;
}

.container {
  text-align: center;
  max-width: 480px;
}

/* 图标区域 */
.icon-wrapper {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 40px;
}

.icon-wrapper svg {
  width: 100%;
  height: 100%;
  color: rgb(255 255 255 / 20%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-20px);
  }
}

.lock-icon {
  position: absolute;
  bottom: -10px;
  right: -10px;
  width: 48px;
  height: 48px;
  background: #ef4444;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 4px 20px rgb(239 68 68 / 40%),
    0 0 0 4px rgb(239 68 68 / 20%);
}

.lock-icon svg {
  width: 28px;
  height: 28px;
  color: #fff;
  animation: none;
}

/* 标题 */
.title {
  font-size: 120px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1;
  text-shadow:
    0 10px 30px rgb(0 0 0 / 30%),
    0 0 0 10px rgb(255 255 255 / 10%);
}

.subtitle {
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 24px;
}

.description {
  font-size: 18px;
  color: rgb(255 255 255 / 70%);
  margin: 0 0 32px;
}

/* 权限信息 */
.permission-info {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 16px 24px;
  background: rgb(0 0 0 / 20%);
  border-radius: 12px;
  margin-bottom: 32px;
  backdrop-filter: blur(10px);
}

.permission-info .label {
  color: rgb(255 255 255 / 70%);
  font-size: 14px;
}

.permission-code {
  padding: 6px 12px;
  background: rgb(239 68 68 / 20%);
  border: 1px solid rgb(239 68 68 / 30%);
  border-radius: 6px;
  color: #fca5a5;
  font-family: 'Courier New', monospace;
  font-size: 13px;
}

/* 操作按钮 */
.actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  margin-bottom: 24px;
}

.actions button {
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: #fff;
  color: #667eea;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgb(0 0 0 / 20%);
}

.btn-secondary {
  background: rgb(255 255 255 / 10%);
  color: #fff;
  border: 1px solid rgb(255 255 255 / 20%);
  backdrop-filter: blur(10px);
}

.btn-secondary:hover {
  background: rgb(255 255 255 / 20%);
  transform: translateY(-2px);
}

/* 提示信息 */
.hint {
  font-size: 14px;
  color: rgb(255 255 255 / 50%);
  margin: 0;
}

/* 响应式 */
@media (width <= 640px) {
  .title {
    font-size: 80px;
  }

  .subtitle {
    font-size: 24px;
  }

  .description {
    font-size: 16px;
  }

  .actions {
    flex-direction: column;
  }

  .actions button {
    width: 100%;
  }
}
</style>
