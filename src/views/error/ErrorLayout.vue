<template>
  <div class="error-layout">
    <!-- 动态网格背景 -->
    <div class="grid-background">
      <div class="grid-lines" />
      <div class="scan-line" />
    </div>

    <!-- 角落装饰 -->
    <div class="corner-decoration top-left" />
    <div class="corner-decoration top-right" />
    <div class="corner-decoration bottom-left" />
    <div class="corner-decoration bottom-right" />

    <!-- 主内容区 -->
    <div class="error-container">
      <!-- 状态码 -->
      <div
        class="status-code"
        :data-text="statusCodeText"
      >
        <span v-if="statusCodeText">{{ statusCodeText }}</span>
        <slot
          v-else
          name="status"
        />
      </div>

      <!-- 图标区域 -->
      <div class="icon-area">
        <slot name="icon" />
      </div>

      <!-- 标题 -->
      <h1 class="error-title">
        <slot name="title" />
      </h1>

      <!-- 描述 -->
      <p class="error-description">
        <slot name="description" />
      </p>

      <!-- 附加信息 -->
      <div
        v-if="$slots.info"
        class="info-section"
      >
        <slot name="info" />
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <slot name="actions" />
      </div>

      <!-- 底部提示 -->
      <p
        v-if="$slots.hint"
        class="hint-text"
      >
        <slot name="hint" />
      </p>
    </div>

    <!-- 底部品牌 -->
    <div class="brand-footer">
      <span class="brand-text">WES</span>
      <span class="brand-divider">|</span>
      <span class="brand-subtitle">Warehouse Execution System</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  statusCode?: number | string
}

const props = defineProps<Props>()

const statusCodeText = computed(() => {
  if (props.statusCode === undefined || props.statusCode === null) {
    return ''
  }

  return String(props.statusCode)
})
</script>

<style scoped>
.error-layout {
  position: relative;

  /* 使用与 CrudPageContainer 相同的高度计算逻辑 */
  height: calc(100vh - var(--layout-header-height, 64px) - var(--layout-page-padding, 8px) * 2);
  height: calc(100dvh - var(--layout-header-height, 64px) - var(--layout-page-padding, 8px) * 2);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
  font-family: 'IBM Plex Mono', 'SF Mono', 'Fira Code', monospace;
  box-sizing: border-box;
}

/* 深色主题 */
html.dark .error-layout {
  background: linear-gradient(135deg, #0d1117 0%, #161b22 50%, #0d1117 100%);
  color: #e6edf3;
}

/* 浅色主题 */
html:not(.dark) .error-layout {
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #f8fafc 100%);
  color: #1e293b;
}

/* 动态网格背景 */
.grid-background {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.grid-lines {
  position: absolute;
  inset: 0;
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 60px,
      rgb(0 243 255 / 6%) 60px,
      rgb(0 243 255 / 6%) 61px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 60px,
      rgb(0 243 255 / 6%) 60px,
      rgb(0 243 255 / 6%) 61px
    );
  animation: gridPulse 8s ease-in-out infinite;
}

html:not(.dark) .grid-lines {
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 60px,
      rgb(30 64 175 / 8%) 60px,
      rgb(30 64 175 / 8%) 61px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 60px,
      rgb(30 64 175 / 8%) 60px,
      rgb(30 64 175 / 8%) 61px
    );
}

@keyframes gridPulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

/* 扫描线效果 */
.scan-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent 0%, #00f3ff 50%, transparent 100%);
  animation: scanMove 4s linear infinite;
  opacity: 0.3;
}

html:not(.dark) .scan-line {
  background: linear-gradient(90deg, transparent 0%, #3b82f6 50%, transparent 100%);
}

@keyframes scanMove {
  0% {
    top: -2px;
  }
  100% {
    top: 100%;
  }
}

/* 角落装饰 */
.corner-decoration {
  position: absolute;
  width: 60px;
  height: 60px;
  border: 2px solid rgb(0 243 255 / 20%);
}

html:not(.dark) .corner-decoration {
  border-color: rgb(30 64 175 / 20%);
}

.corner-decoration.top-left {
  top: 16px;
  left: 16px;
  border-right: none;
  border-bottom: none;
}

.corner-decoration.top-right {
  top: 16px;
  right: 16px;
  border-left: none;
  border-bottom: none;
}

.corner-decoration.bottom-left {
  bottom: 16px;
  left: 16px;
  border-right: none;
  border-top: none;
}

.corner-decoration.bottom-right {
  bottom: 16px;
  right: 16px;
  border-left: none;
  border-top: none;
}

/* 主内容容器 */
.error-container {
  position: relative;
  z-index: 10;
  max-width: 520px;
  width: 100%;
  padding: 32px 28px;
  text-align: center;
}

html.dark .error-container {
  background: rgb(22 27 34 / 85%);
  border: 1px solid rgb(0 243 255 / 15%);
  box-shadow:
    0 0 0 1px rgb(0 243 255 / 5%),
    0 20px 40px -12px rgb(0 0 0 / 60%),
    inset 0 1px 0 rgb(255 255 255 / 3%);
  backdrop-filter: blur(16px);
}

html:not(.dark) .error-container {
  background: rgb(255 255 255 / 90%);
  border: 1px solid rgb(30 64 175 / 12%);
  box-shadow:
    0 0 0 1px rgb(30 64 175 / 5%),
    0 20px 40px -12px rgb(0 0 0 / 15%),
    inset 0 1px 0 rgb(255 255 255 / 100%);
  backdrop-filter: blur(16px);
}

/* 状态码 */
.status-code {
  position: relative;
  margin-bottom: 4px;
  font-size: clamp(64px, 12vw, 100px);
  font-weight: 900;
  line-height: 1;
  letter-spacing: -0.02em;
  animation: textGlitch 3s infinite;
}

.status-code > span {
  position: relative;
}

html.dark .status-code {
  color: #00f3ff;
  text-shadow:
    0 0 10px rgb(0 243 255 / 50%),
    0 0 40px rgb(0 243 255 / 20%);
}

html:not(.dark) .status-code {
  color: #1e40af;
  text-shadow:
    0 0 10px rgb(30 64 175 / 30%),
    0 0 40px rgb(30 64 175 / 10%);
}

@keyframes textGlitch {
  0%,
  90%,
  100% {
    transform: translate(0);
    filter: none;
  }
  92% {
    transform: translate(-3px, 1px);
    filter: hue-rotate(90deg);
  }
  94% {
    transform: translate(3px, -1px);
    filter: hue-rotate(-90deg);
  }
  96% {
    transform: translate(-2px, -1px);
    filter: hue-rotate(180deg);
  }
  98% {
    transform: translate(2px, 1px);
    filter: hue-rotate(0deg);
  }
}

/* Glitch伪元素 */
.status-code::before,
.status-code::after {
  content: attr(data-text);
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
}

html.dark .status-code::before {
  color: #ff0080;
  animation: glitchLeft 3s infinite;
}

html.dark .status-code::after {
  color: #00ff80;
  animation: glitchRight 3s infinite;
}

@keyframes glitchLeft {
  0%,
  90%,
  100% {
    clip-path: inset(0 0 0 0);
    transform: translate(0);
  }
  92% {
    clip-path: inset(40% 0 20% 0);
    transform: translate(-4px);
  }
  94% {
    clip-path: inset(10% 0 60% 0);
    transform: translate(4px);
  }
  96% {
    clip-path: inset(70% 0 10% 0);
    transform: translate(-2px);
  }
}

@keyframes glitchRight {
  0%,
  90%,
  100% {
    clip-path: inset(0 0 0 0);
    transform: translate(0);
  }
  91% {
    clip-path: inset(60% 0 10% 0);
    transform: translate(4px);
  }
  93% {
    clip-path: inset(20% 0 50% 0);
    transform: translate(-4px);
  }
  95% {
    clip-path: inset(50% 0 30% 0);
    transform: translate(2px);
  }
}

/* 图标区域 */
.icon-area {
  margin: -16px auto 16px;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

/* 标题 */
.error-title {
  margin: 0 0 12px;
  font-size: clamp(22px, 4vw, 28px);
  font-weight: 700;
  letter-spacing: 0.02em;
}

html.dark .error-title {
  color: #e6edf3;
}

html:not(.dark) .error-title {
  color: #1e293b;
}

/* 描述 */
.error-description {
  margin: 0 auto 20px;
  max-width: 380px;
  font-size: clamp(14px, 2.5vw, 15px);
  line-height: 1.6;
  letter-spacing: 0.01em;
}

html.dark .error-description {
  color: rgb(230 237 243 / 70%);
}

html:not(.dark) .error-description {
  color: #475569;
}

/* 附加信息区域 */
.info-section {
  margin: 0 auto 20px;
  padding: 12px 16px;
  text-align: left;
  border-radius: 10px;
  font-size: 13px;
}

html.dark .info-section {
  background: rgb(0 0 0 / 30%);
  border: 1px solid rgb(255 255 255 / 8%);
}

html:not(.dark) .info-section {
  background: rgb(241 245 249 / 80%);
  border: 1px solid rgb(203 213 225 / 80%);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

/* 提示文本 */
.hint-text {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.01em;
}

html.dark .hint-text {
  color: rgb(230 237 243 / 45%);
}

html:not(.dark) .hint-text {
  color: #64748b;
}

/* 底部品牌 */
.brand-footer {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 11px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

html.dark .brand-footer {
  color: rgb(230 237 243 / 30%);
}

html:not(.dark) .brand-footer {
  color: #94a3b8;
}

.brand-text {
  font-weight: 700;
  font-size: 12px;
}

html.dark .brand-text {
  color: #00f3ff;
}

html:not(.dark) .brand-text {
  color: #1e40af;
}

.brand-divider {
  opacity: 0.3;
}

.brand-subtitle {
  font-weight: 400;
}

/* 响应式 */
@media (width <= 640px) {
  .error-container {
    padding: 24px 20px;
  }

  .icon-area {
    width: 60px;
    height: 60px;
    margin-top: -12px;
    margin-bottom: 12px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .corner-decoration {
    width: 32px;
    height: 32px;
  }

  .brand-footer {
    flex-direction: column;
    gap: 2px;
    font-size: 10px;
  }

  .brand-divider {
    display: none;
  }
}

/* 超小屏幕适配 */
@media (height <= 600px) {
  .error-layout {
    padding: 12px;
  }

  .error-container {
    padding: 20px 16px;
  }

  .status-code {
    font-size: 56px;
    margin-bottom: 2px;
  }

  .icon-area {
    width: 48px;
    height: 48px;
    margin-top: -8px;
    margin-bottom: 8px;
  }

  .error-title {
    font-size: 20px;
    margin-bottom: 8px;
  }

  .error-description {
    font-size: 13px;
    margin-bottom: 16px;
  }

  .info-section {
    padding: 10px 12px;
    margin-bottom: 16px;
  }

  .action-buttons {
    margin-bottom: 12px;
  }

  .hint-text {
    font-size: 11px;
  }

  .brand-footer {
    bottom: 12px;
    font-size: 9px;
  }
}
</style>
