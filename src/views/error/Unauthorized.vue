<template>
  <ErrorLayout status-code="403">
    <template #icon>
      <div class="icon-403">
        <!-- 警示条纹背景 -->
        <div class="hazard-stripes" />
        <!-- 锁图标 -->
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          class="lock-icon"
        >
          <rect
            x="3"
            y="11"
            width="18"
            height="11"
            rx="2"
          />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          <circle
            cx="12"
            cy="16"
            r="1"
            fill="currentColor"
          />
        </svg>
        <!-- 脉冲圈 -->
        <div class="pulse-ring" />
        <div class="pulse-ring delay-1" />
        <div class="pulse-ring delay-2" />
      </div>
    </template>

    <template #title>访问受限</template>

    <template #description>
      您没有访问此页面的权限。如需访问，请联系系统管理员申请相应权限。
    </template>

    <template #info>
      <div
        v-if="requiredPermission"
        class="permission-info"
      >
        <div class="permission-header">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            class="key-icon"
          >
            <path
              d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"
            />
          </svg>
          <span class="label">所需权限</span>
        </div>
        <code class="permission-code">{{ requiredPermission }}</code>
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
        @click="goHome"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9,22 9,12 15,12 15,22" />
        </svg>
        回到首页
      </button>
    </template>

    <template #hint>如果您认为这是一个错误，请联系系统管理员。</template>
  </ErrorLayout>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import ErrorLayout from './ErrorLayout.vue'

const router = useRouter()
const route = useRoute()

const redirectPath = computed(() => getSingleQueryValue(route.query.redirect))
const requiredPermission = computed(() => getSingleQueryValue(route.query.permission))

onMounted(() => {
  console.warn(`[403] 无权限访问`, {
    path: route.path,
    redirect: redirectPath.value,
    permission: requiredPermission.value
  })
})

function getSingleQueryValue(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined
}

function navigateHome(): void {
  router.push('/')
}

function goBack(): void {
  if (window.history.length > 1) {
    router.back()
  } else {
    navigateHome()
  }
}

function goHome(): void {
  navigateHome()
}
</script>

<style scoped>
/* 图标容器 */
.icon-403 {
  position: relative;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 警示条纹背景 */
.hazard-stripes {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: repeating-conic-gradient(
    from 0deg,
    transparent 0deg 30deg,
    rgb(255 255 255 / 5%) 30deg 60deg
  );
  animation: stripesRotate 30s linear infinite;
}

html.dark .hazard-stripes {
  background: repeating-conic-gradient(
    from 0deg,
    rgb(239 68 68 / 8%) 0deg 30deg,
    transparent 30deg 60deg
  );
}

html:not(.dark) .hazard-stripes {
  background: repeating-conic-gradient(
    from 0deg,
    rgb(239 68 68 / 10%) 0deg 30deg,
    rgb(255 255 255 / 50%) 30deg 60deg
  );
}

@keyframes stripesRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 锁图标 */
.lock-icon {
  position: relative;
  z-index: 2;
  width: 44px;
  height: 44px;
  animation: lockPulse 2s ease-in-out infinite;
}

html.dark .lock-icon {
  color: #f87171;
  filter: drop-shadow(0 0 16px rgb(248 113 113 / 50%));
}

html:not(.dark) .lock-icon {
  color: var(--color-danger);
  filter: drop-shadow(0 0 16px rgb(var(--color-danger-rgb) / 40%));
}

@keyframes lockPulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

/* 脉冲圈 */
.pulse-ring {
  position: absolute;
  inset: -8px;
  border-radius: 50%;
  border: 2px solid;
  animation: pulseExpand 2.5s ease-out infinite;
  opacity: 0;
}

html.dark .pulse-ring {
  border-color: #ef4444;
}

html:not(.dark) .pulse-ring {
  border-color: var(--color-danger);
}

.pulse-ring.delay-1 {
  animation-delay: 0.8s;
}

.pulse-ring.delay-2 {
  animation-delay: 1.6s;
}

@keyframes pulseExpand {
  0% {
    transform: scale(0.8);
    opacity: 0.6;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

/* 权限信息 */
.permission-info {
  border-radius: 8px;
}

.permission-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.key-icon {
  width: 16px;
  height: 16px;
}

html.dark .key-icon {
  color: #f87171;
}

html:not(.dark) .key-icon {
  color: var(--color-danger);
}

.label {
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

.permission-code {
  display: block;
  padding: 12px 16px;
  border-radius: 8px;
  font-family: 'IBM Plex Mono', 'Fira Code', monospace;
  font-size: 14px;
  word-break: break-all;
}

html.dark .permission-code {
  background: rgb(239 68 68 / 12%);
  border: 1px solid rgb(239 68 68 / 25%);
  color: #fca5a5;
}

html:not(.dark) .permission-code {
  background: rgb(254 226 226 / 60%);
  border: 1px solid rgb(252 165 165 / 50%);
  color: #b91c1c;
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
  background: linear-gradient(135deg, #ef4444 0%, var(--color-danger) 100%);
  color: #fff;
  box-shadow:
    0 4px 20px rgb(239 68 68 / 30%),
    inset 0 1px 0 rgb(255 255 255 / 15%);
}

html.dark .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow:
    0 8px 30px rgb(239 68 68 / 40%),
    inset 0 1px 0 rgb(255 255 255 / 15%);
}

html:not(.dark) .btn-primary {
  background: linear-gradient(135deg, var(--color-danger) 0%, #b91c1c 100%);
  color: #fff;
  box-shadow: 0 4px 20px rgb(var(--color-danger-rgb) / 25%);
}

html:not(.dark) .btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgb(var(--color-danger-rgb) / 35%);
}

.btn-secondary {
  background: transparent;
}

html.dark .btn-secondary {
  color: #e6edf3;
  border: 1px solid rgb(255 255 255 / 15%);
}

html.dark .btn-secondary:hover {
  background: rgb(255 255 255 / 5%);
  border-color: rgb(239 68 68 / 30%);
  transform: translateY(-2px);
}

html:not(.dark) .btn-secondary {
  color: var(--color-industrial-light-text-secondary);
  border: 1px solid #cbd5e1;
}

html:not(.dark) .btn-secondary:hover {
  background: var(--color-industrial-dark-text);
  border-color: var(--color-danger);
  color: var(--color-danger);
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
