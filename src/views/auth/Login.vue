<template>
  <div class="login-page">
    <!-- 主题切换 -->
    <div class="page-theme-toggle">
      <ThemeToggle />
    </div>

    <!-- 网格背景层 -->
    <div class="grid-background">
      <div
        v-for="i in 300"
        :key="`grid-${i}`"
        class="grid-dot"
        :style="gridDotStyle(i)"
      />
    </div>

    <!-- 粒子效果层 -->
    <div class="particles">
      <div
        v-for="i in 20"
        :key="`particle-${i}`"
        class="particle"
        :style="particleStyle()"
      />
    </div>

    <!-- 主内容区 -->
    <div class="main-container">
      <!-- 左侧品牌展示区 -->
      <div class="brand-section">
        <div class="brand-content">
          <!-- 3D 旋转 LOGO 立方体 -->
          <div class="icon-container">
            <div class="warehouse-icon">
              <div class="cube-wrapper">
                <div class="cube">
                  <div class="cube-face cube-face-front">
                    <img
                      :src="logoSvg"
                      alt="P9 WES"
                      class="cube-logo"
                    >
                  </div>
                  <div class="cube-face cube-face-back">
                    <img
                      :src="logoSvg"
                      alt="P9 WES"
                      class="cube-logo"
                    >
                  </div>
                  <div class="cube-face cube-face-right">
                    <img
                      :src="logoSvg"
                      alt="P9 WES"
                      class="cube-logo"
                    >
                  </div>
                  <div class="cube-face cube-face-left">
                    <img
                      :src="logoSvg"
                      alt="P9 WES"
                      class="cube-logo"
                    >
                  </div>
                  <div class="cube-face cube-face-top">
                    <img
                      :src="logoSvg"
                      alt="P9 WES"
                      class="cube-logo"
                    >
                  </div>
                  <div class="cube-face cube-face-bottom">
                    <img
                      :src="logoSvg"
                      alt="P9 WES"
                      class="cube-logo"
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 class="brand-title">
            <span class="title-highlight">P9</span> WES
          </h1>
          <p class="brand-subtitle">
            Houston Warehouse Execution System
          </p>

          <div class="brand-features">
            <div class="feature-item">
              <div class="feature-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                </svg>
              </div>
              <span>实时监控</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path
                    d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"
                  />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line
                    x1="12"
                    y1="22.08"
                    x2="12"
                    y2="12"
                  />
                </svg>
              </div>
              <span>智能调度</span>
            </div>
            <div class="feature-item">
              <div class="feature-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <span>安全可靠</span>
            </div>
          </div>
        </div>

        <!-- 底部装饰线 -->
        <div class="brand-footer">
          <div class="data-stream">
            <span
              v-for="i in 30"
              :key="i"
              :style="{ animationDelay: `${i * 0.1}s` }"
              class="data-bit"
            >0</span>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单区 -->
      <div class="form-section">
        <div class="form-container">
          <div class="form-header">
            <h2>系统登录</h2>
            <p>Warehouse Execution System</p>
          </div>

          <form
            class="login-form"
            @submit.prevent="handleLogin"
          >
            <!-- 用户名输入 -->
            <div
              class="form-group"
              :class="{ focused: usernameFocused, filled: form.username }"
            >
              <label for="username">用户名</label>
              <input
                id="username"
                ref="usernameInput"
                v-model="form.username"
                type="text"
                @focus="usernameFocused = true"
                @blur="usernameFocused = false"
              >
              <div class="input-border" />
              <div class="input-icon">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="1.5"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle
                    cx="12"
                    cy="7"
                    r="4"
                  />
                </svg>
              </div>
            </div>

            <!-- 密码输入 -->
            <div
              class="form-group"
              :class="{ focused: passwordFocused, filled: form.password }"
            >
              <label for="password">密码</label>
              <input
                id="password"
                ref="passwordInput"
                v-model="form.password"
                type="password"
                @focus="passwordFocused = true"
                @blur="passwordFocused = false"
              >
              <div class="input-border" />
              <div class="input-icon">
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
            </div>

            <!-- 登录按钮 -->
            <button
              type="submit"
              class="login-button"
              :disabled="loading"
            >
              <span v-if="!loading">登录系统</span>
              <span
                v-else
                class="loading-text"
              >
                <span class="loading-dot" />
                <span class="loading-dot" />
                <span class="loading-dot" />
              </span>
              <div class="button-glow" />
            </button>
          </form>

          <!-- 底部信息 -->
          <div class="form-footer">
            <div class="version-info">
              v{{ version }}
            </div>
            <div class="status-indicator">
              <span class="status-dot" />
              <span>系统正常运行</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 角落装饰 -->
    <div class="corner-decoration top-left" />
    <div class="corner-decoration top-right" />
    <div class="corner-decoration bottom-left" />
    <div class="corner-decoration bottom-right" />
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { authApi } from '@/api/modules/auth'
import { ApiResponseError } from '@/api/client'
import { setAccessToken, setTokenExpiresAt } from '@/api/services/token-refresh'
import { usePermission } from '@/composables/usePermission'
import { useMenu } from '@/composables/useMenu'
import ThemeToggle from '@/components/common/ThemeToggle.vue'
import logoSvg from '@/assets/logo.svg'

const router = useRouter()
const { loadPermissions, hydratePermissions } = usePermission()
const { loadMenus, hydrateMenus } = useMenu()
const usernameInput = ref()
const passwordInput = ref()
const loading = ref(false)
const usernameFocused = ref(false)
const passwordFocused = ref(false)
const version = ref('0.1.0')

const form = reactive({
  username: '',
  password: ''
})

// 网格点样式生成 - 创建 20x15 网格
const gridDotStyle = (index: number) => {
  const col = index % 20
  const row = Math.floor(index / 20)
  const x = col * 5 + 2.5 // 偏移 5% 使点居中
  const y = row * 6.667 + 3.333
  return {
    left: `${x}%`,
    top: `${y}%`,
    animationDelay: `${(col + row) * 0.2}s`
  }
}

// 粒子样式生成
const particleStyle = () => {
  const size = Math.random() * 3 + 4
  return {
    width: `${size}px`,
    height: `${size}px`,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    animationDuration: `${Math.random() * 10 + 10}s`
  }
}

const handleLogin = async () => {
  // 基础验证
  if (!form.username) {
    ElMessage.warning('请输入用户名')
    usernameInput.value?.focus()
    return
  }
  if (form.username.length < 3) {
    ElMessage.warning('用户名长度至少 3 个字符')
    usernameInput.value?.focus()
    return
  }
  if (!form.password) {
    ElMessage.warning('请输入密码')
    passwordInput.value?.focus()
    return
  }
  if (form.password.length < 6) {
    ElMessage.warning('密码长度至少 6 个字符')
    passwordInput.value?.focus()
    return
  }

  try {
    loading.value = true

    const result = await authApi.login({
      username: form.username,
      password: form.password
    })

    setAccessToken(result.access_token)
    const expiresAt = Date.now() + result.expires_in * 1000
    setTokenExpiresAt(expiresAt)

    // 优先使用聚合接口一次性加载用户上下文（权限 + 菜单）
    let initializedFromMy = false
    try {
      const myContext = await authApi.getMy()
      if (Array.isArray(myContext.permissions) && myContext.permissions.length > 0) {
        hydratePermissions(myContext.permissions)
      } else {
        await loadPermissions(true)
      }

      if (Array.isArray(myContext.menus) && myContext.menus.length > 0) {
        hydrateMenus(myContext.menus)
      } else {
        await loadMenus(true)
      }

      initializedFromMy = true
    } catch (contextError) {
      console.warn('加载 /auth/my 失败，回退到分步加载:', contextError)
    }

    // 回退方案：兼容旧后端，分步加载权限和菜单
    if (!initializedFromMy) {
      try {
        await loadPermissions(true)
      } catch (permError) {
        console.error('加载权限失败:', permError)
        // 权限加载失败，清除 token 并提示
        localStorage.removeItem('access_token')
        localStorage.removeItem('token_expires_at')
        ElMessage.error('权限加载失败，请重试')
        loading.value = false
        return
      }

      try {
        await loadMenus(true)
      } catch (menuError) {
        console.error('加载菜单失败:', menuError)
        // 菜单加载失败，清除 token 并提示
        localStorage.removeItem('access_token')
        localStorage.removeItem('token_expires_at')
        ElMessage.error('菜单加载失败，请重试')
        loading.value = false
        return
      }
    }

    ElMessage.success('登录成功')

    const redirect = sessionStorage.getItem('redirect_after_login')
    sessionStorage.removeItem('redirect_after_login')
    router.push(redirect || '/dashboard')
  } catch (error) {
    console.error('登录失败:', error)
    if (!(error instanceof ApiResponseError)) {
      ElMessage.error('登录失败，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  // 自动聚焦用户名输入框
  setTimeout(() => {
    usernameInput.value?.focus()
  }, 500)
})
</script>

<style scoped>
/* ==================== 基础布局 ==================== */
.login-page {
  position: relative;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    sans-serif;
  transition: background 0.3s ease;
}

/* 主题切换入口 */
.page-theme-toggle {
  position: fixed;
  top: 24px;
  right: 24px;
  z-index: 30;
}

/* 暗黑模式登录页背景 */
html.dark .login-page {
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1117 100%);
}

/* 亮模式登录页背景 - 使用更柔和的暖灰色 */
html:not(.dark) .login-page {
  background: linear-gradient(135deg, #f0f2f5 0%, #e4e8eb 100%);
}

/* ==================== 网格背景 ==================== */
.grid-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  background-size: 25px 25px;
  background-position: -1px -1px;
  transition: background-image 0.3s ease;
}

/* 暗黑模式网格 */
html.dark .grid-background {
  background-image:
    linear-gradient(rgb(0 243 255 / 3%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(0 243 255 / 3%) 1px, transparent 1px);
}

html.dark .grid-dot {
  background: radial-gradient(
    circle,
    rgb(0 243 255 / 40%) 0%,
    rgb(0 243 255 / 15%) 50%,
    transparent 70%
  );
}

/* 亮模式网格 */
html:not(.dark) .grid-background {
  background-image:
    linear-gradient(rgb(64 158 255 / 5%) 1px, transparent 1px),
    linear-gradient(90deg, rgb(64 158 255 / 5%) 1px, transparent 1px);
}

html:not(.dark) .grid-dot {
  background: radial-gradient(
    circle,
    rgb(64 158 255 / 30%) 0%,
    rgb(64 158 255 / 10%) 50%,
    transparent 70%
  );
}

.grid-dot {
  position: absolute;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  animation: pulse 3s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.8;
    transform: scale(1);
  }

  50% {
    opacity: 0.5;
    transform: scale(1.5);
  }
}

/* ==================== 粒子效果 ==================== */
.particles {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.particle {
  position: absolute;
  border-radius: 50%;
  animation: float linear infinite;
  filter: blur(0.5px);
  transition: background 0.3s ease;
}

/* 暗黑模式粒子 */
html.dark .particle {
  background: linear-gradient(180deg, rgb(0 243 255 / 80%) 0%, rgb(0 243 255 / 0%) 100%);
}

/* 亮模式粒子 */
html:not(.dark) .particle {
  background: linear-gradient(180deg, rgb(64 158 255 / 60%) 0%, rgb(64 158 255 / 0%) 100%);
}

@keyframes float {
  0% {
    transform: translateY(100vh) translateX(0);
    opacity: 0;
  }

  10% {
    opacity: 0.8;
  }

  90% {
    opacity: 0.8;
  }

  100% {
    transform: translateY(-100px) translateX(calc(100vw - 200% * var(--progress, 0)));
    opacity: 0;
  }
}

/* ==================== 主容器 ==================== */
.main-container {
  position: relative;
  z-index: 10;
  display: flex;
  width: 90%;
  max-width: 1200px;
  min-height: 600px;
  border-radius: 24px;
  backdrop-filter: blur(20px);
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 暗黑模式主容器 */
html.dark .main-container {
  background: rgb(13 17 23 / 80%);
  border: 1px solid rgb(0 243 255 / 10%);
  box-shadow:
    0 0 80px rgb(0 243 255 / 10%),
    0 20px 60px rgb(0 0 0 / 50%),
    inset 0 1px 0 rgb(255 255 255 / 5%);
}

/* 亮模式主容器 - 使用柔和的灰白色 */
html:not(.dark) .main-container {
  background: #f5f6f7;
  border: 1px solid #e4e7ed;
  box-shadow:
    0 20px 60px rgb(0 0 0 / 10%),
    inset 0 1px 0 rgb(255 255 255 / 100%);
}

/* ==================== 品牌区 ==================== */
.brand-section {
  position: relative;
  flex: 1;
  padding: 60px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow: hidden;
  transition: background 0.3s ease;
}

/* 暗黑模式品牌区 */
html.dark .brand-section {
  background:
    linear-gradient(135deg, rgb(0 243 255 / 5%) 0%, transparent 50%),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgb(0 243 255 / 2%) 2px,
      rgb(0 243 255 / 2%) 4px
    );
}

html.dark .brand-section::before {
  background: radial-gradient(circle at 30% 50%, rgb(0 243 255 / 10%) 0%, transparent 50%);
}

/* 亮模式品牌区 */
html:not(.dark) .brand-section {
  background:
    linear-gradient(135deg, rgb(64 158 255 / 3%) 0%, transparent 50%),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgb(64 158 255 / 1%) 2px,
      rgb(64 158 255 / 1%) 4px
    );
}

html:not(.dark) .brand-section::before {
  background: radial-gradient(circle at 30% 50%, rgb(64 158 255 / 5%) 0%, transparent 50%);
}

.brand-section::before {
  content: '';
  position: absolute;
  inset: 0;
  animation: glow 8s ease-in-out infinite alternate;
}

@keyframes glow {
  0% {
    opacity: 0.5;
    transform: scale(1);
  }

  100% {
    opacity: 1;
    transform: scale(1.2);
  }
}

.brand-content {
  position: relative;
  z-index: 1;
}

/* 3D 图标 */
.icon-container {
  margin-bottom: 40px;
  perspective: 1000px;
}

.warehouse-icon {
  width: 150px;
  height: 150px;
}

.cube-wrapper {
  width: 100%;
  height: 100%;
  animation: rotateCube 20s linear infinite;
}

@keyframes rotateCube {
  0% {
    transform: rotateX(-20deg) rotateY(0deg);
  }

  100% {
    transform: rotateX(-20deg) rotateY(360deg);
  }
}

.cube {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.cube-face {
  position: absolute;
  width: 150px;
  height: 150px;
  border: 1px solid rgb(0 243 255 / 30%);
  background: rgb(10 14 39 / 95%);
  box-shadow:
    inset 0 0 40px rgb(0 243 255 / 15%),
    0 0 30px rgb(0 243 255 / 15%);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.cube-logo {
  width: 80%;
  height: 80%;
  object-fit: contain;
  filter: drop-shadow(0 0 10px rgb(0 243 255 / 50%));
}

.cube-face-front {
  transform: translateZ(75px);
}

.cube-face-back {
  transform: rotateY(180deg) translateZ(75px);
}

.cube-face-right {
  transform: rotateY(90deg) translateZ(75px);
}

.cube-face-left {
  transform: rotateY(-90deg) translateZ(75px);
}

.cube-face-top {
  transform: rotateX(90deg) translateZ(75px);
}

.cube-face-bottom {
  transform: rotateX(-90deg) translateZ(75px);
}

/* 品牌标题 */
.brand-title {
  font-size: 64px;
  font-weight: 700;
  letter-spacing: -2px;
  margin: 0 0 16px;
  background: linear-gradient(135deg, #00f3ff 0%, #0f8 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

.title-highlight {
  font-size: 80px;
}

.brand-subtitle {
  font-size: 18px;
  font-weight: 300;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin: 0 0 60px;
  transition: color 0.3s ease;
}

/* 暗黑模式副标题 */
html.dark .brand-subtitle {
  color: rgb(255 255 255 / 50%);
}

/* 亮模式副标题 */
html:not(.dark) .brand-subtitle {
  color: #606266;
}

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

/* 底部数据流 */
.brand-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 20px 60px;
  border-top: 1px solid rgb(0 243 255 / 10%);
}

.data-stream {
  display: flex;
  gap: 4px;
  overflow: hidden;
}

.data-bit {
  font-family: 'Courier New', monospace;
  font-size: 12px;
  color: rgb(0 243 255 / 30%);
  animation: dataFlow 2s linear infinite;
}

@keyframes dataFlow {
  0% {
    opacity: 0.8;
  }

  50% {
    opacity: 0.5;
  }

  100% {
    opacity: 0.5;
  }
}

/* ==================== 表单区 ==================== */
.form-section {
  position: relative;
  width: 480px;
  padding: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

/* 暗黑模式表单区 */
html.dark .form-section {
  background: rgb(10 14 39 / 50%);
  border-left: 1px solid rgb(0 243 255 / 10%);
}

html.dark .form-section::before {
  background: radial-gradient(circle, rgb(0 243 255 / 10%) 0%, transparent 70%);
}

/* 亮模式表单区 */
html:not(.dark) .form-section {
  background: #f5f7fa;
  border-left: 1px solid #e4e7ed;
}

html:not(.dark) .form-section::before {
  background: radial-gradient(circle, rgb(64 158 255 / 5%) 0%, transparent 70%);
}

.form-section::before {
  content: '';
  position: absolute;
  top: -100px;
  right: -100px;
  width: 200px;
  height: 200px;
  filter: blur(60px);
}

.form-container {
  width: 100%;
  max-width: 360px;
}

/* 表单头部 */
.form-header {
  text-align: center;
  margin-bottom: 48px;
}

.form-header h2 {
  font-size: 32px;
  font-weight: 600;
  margin: 0 0 8px;
  letter-spacing: -0.5px;
  transition: color 0.3s ease;
}

.form-header p {
  font-size: 14px;
  margin: 0;
  letter-spacing: 1px;
  text-transform: uppercase;
  transition: color 0.3s ease;
}

/* 暗黑模式表单头部 */
html.dark .form-header h2 {
  color: #fff;
}

html.dark .form-header p {
  color: rgb(255 255 255 / 40%);
}

/* 亮模式表单头部 */
html:not(.dark) .form-header h2 {
  color: #303133;
}

html:not(.dark) .form-header p {
  color: #909399;
}

/* 表单 */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* 表单组 */
.form-group {
  position: relative;
}

.form-group label {
  position: absolute;
  left: 48px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 14px;
  pointer-events: none;
  transition: all 0.3s ease;
}

/* 暗黑模式标签 */
html.dark .form-group label {
  color: rgb(255 255 255 / 40%);
}

html.dark .form-group.focused label,
html.dark .form-group.filled label {
  color: #00f3ff;
}

/* 亮模式标签 */
html:not(.dark) .form-group label {
  color: #909399;
}

html:not(.dark) .form-group.focused label,
html:not(.dark) .form-group.filled label {
  color: #409eff;
}

.form-group.focused label,
.form-group.filled label {
  left: 0;
  top: 0;
  font-size: 12px;
}

.form-group input {
  width: 100%;
  height: 56px;
  padding: 0 48px;
  font-size: 16px;
  border-radius: 8px;
  outline: none;
  transition: all 0.3s ease;
}

/* 暗黑模式输入框 */
html.dark .form-group input {
  color: #fff;
  background: rgb(255 255 255 / 3%);
  border: 1px solid rgb(255 255 255 / 10%);
}

html.dark .form-group input:focus {
  background: rgb(0 243 255 / 3%);
  border-color: rgb(0 243 255 / 30%);
}

/* 亮模式输入框 */
html:not(.dark) .form-group input {
  color: #303133;
  background: #fff;
  border: 1px solid #dcdfe6;
}

html:not(.dark) .form-group input:focus {
  background: #ecf5ff;
  border-color: #409eff;
}

.form-group input::placeholder {
  color: transparent;
}

.input-border {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 0;
  height: 1px;
  background: linear-gradient(90deg, #00f3ff 0%, #0f8 100%);
  transition: width 0.3s ease;
}

.form-group.focused .input-border {
  width: 100%;
}

.input-icon {
  position: absolute;
  right: 16px;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;
  height: 24px;
  color: rgb(255 255 255 / 30%);
  transition: all 0.3s ease;
}

.form-group.focused .input-icon {
  color: #00f3ff;
  filter: drop-shadow(0 0 8px rgb(0 243 255 / 50%));
}

/* 登录按钮 */
.login-button {
  position: relative;
  width: 100%;
  height: 56px;
  margin-top: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #0a0e27;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

/* 暗黑模式按钮 */
html.dark .login-button {
  background: linear-gradient(135deg, #00f3ff 0%, #0f8 100%);
}

html.dark .login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgb(0 243 255 / 30%);
}

/* 亮模式按钮 */
html:not(.dark) .login-button {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
}

html:not(.dark) .login-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 10px 40px rgb(64 158 255 / 30%);
}

.login-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.button-glow {
  position: absolute;
  inset: 0;
  background: radial-gradient(
    circle at var(--mouse-x, 50%) var(--mouse-y, 50%),
    rgb(255 255 255 / 30%) 0%,
    transparent 50%
  );
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.login-button:hover .button-glow {
  opacity: 1;
}

.loading-text {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background: #0a0e27;
  border-radius: 50%;
  animation: bounce 1.4s ease-in-out infinite;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.2s;
}

.loading-dot:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes bounce {
  0%,
  80%,
  100% {
    transform: scale(0.8);
    opacity: 0.5;
  }

  40% {
    transform: scale(1.2);
    opacity: 1;
  }
}

/* 表单底部 */
.form-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  padding-top: 24px;
  border-top: 1px solid;
  transition: border-color 0.3s ease;
}

/* 暗黑模式底部 */
html.dark .form-footer {
  border-top: 1px solid rgb(255 255 255 / 5%);
}

html.dark .version-info {
  color: rgb(255 255 255 / 30%);
}

html.dark .status-indicator {
  color: rgb(255 255 255 / 40%);
}

/* 亮模式底部 */
html:not(.dark) .form-footer {
  border-top: 1px solid #e4e7ed;
}

html:not(.dark) .version-info {
  color: #909399;
}

html:not(.dark) .status-indicator {
  color: #606266;
}

.version-info {
  font-size: 12px;
  font-family: 'Courier New', monospace;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
}

.status-dot {
  width: 8px;
  height: 8px;
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

/* ==================== 角落装饰 ==================== */
.corner-decoration {
  position: absolute;
  width: 100px;
  height: 100px;
  pointer-events: none;
}

.corner-decoration::before,
.corner-decoration::after {
  content: '';
  position: absolute;
  background: rgb(0 243 255 / 15%);
}

.corner-decoration.top-left {
  top: 0;
  left: 0;
}

.corner-decoration.top-left::before {
  width: 100px;
  height: 1px;
  top: 0;
  left: 0;
}

.corner-decoration.top-left::after {
  width: 1px;
  height: 100px;
  top: 0;
  left: 0;
}

.corner-decoration.top-right {
  top: 0;
  right: 0;
}

.corner-decoration.top-right::before {
  width: 100px;
  height: 1px;
  top: 0;
  right: 0;
}

.corner-decoration.top-right::after {
  width: 1px;
  height: 100px;
  top: 0;
  right: 0;
}

.corner-decoration.bottom-left {
  bottom: 0;
  left: 0;
}

.corner-decoration.bottom-left::before {
  width: 100px;
  height: 1px;
  bottom: 0;
  left: 0;
}

.corner-decoration.bottom-left::after {
  width: 1px;
  height: 100px;
  bottom: 0;
  left: 0;
}

.corner-decoration.bottom-right {
  bottom: 0;
  right: 0;
}

.corner-decoration.bottom-right::before {
  width: 100px;
  height: 1px;
  bottom: 0;
  right: 0;
}

.corner-decoration.bottom-right::after {
  width: 1px;
  height: 100px;
  bottom: 0;
  right: 0;
}

/* ==================== 响应式设计 ==================== */
@media (width <=1024px) {
  .main-container {
    flex-direction: column;
    min-height: auto;
  }

  .brand-section {
    padding: 40px;
    min-height: 300px;
  }

  .brand-title {
    font-size: 48px;
  }

  .title-highlight {
    font-size: 60px;
  }

  .form-section {
    width: 100%;
    border-left: none;
    border-top: 1px solid var(--el-border-color);
  }
}

@media (width <=768px) {
  .page-theme-toggle {
    top: 16px;
    right: 16px;
  }

  .main-container {
    width: 95%;
  }

  .brand-section {
    padding: 30px;
  }

  .form-section {
    padding: 40px 30px;
  }

  .brand-features {
    flex-direction: column;
  }

  .feature-item {
    flex-direction: row;
    justify-content: flex-start;
    gap: 16px;
  }
}

@media (width <=480px) {
  .brand-title {
    font-size: 36px;
  }

  .title-highlight {
    font-size: 48px;
  }

  .form-header h2 {
    font-size: 24px;
  }

  .form-group input {
    height: 48px;
  }

  .login-button {
    height: 48px;
  }
}
</style>
