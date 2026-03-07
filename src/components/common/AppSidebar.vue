<template>
  <aside
    class="app-sidebar"
    :class="{
      'is-collapsed': sidebarCollapsed,
      'is-mobile': isMobile,
      'is-open': isMobileMenuOpen
    }"
  >
    <!-- Logo 区域 -->
    <div class="sidebar-header">
      <div class="logo-container">
        <img
          :src="logoSvg"
          alt="P9 WES"
          class="logo-image"
        />
        <transition name="logo-text">
          <div
            v-show="!sidebarCollapsed"
            class="logo-text"
          >
            <span class="logo-highlight">P9</span>
            WES
          </div>
        </transition>
      </div>
    </div>

    <!-- 菜单区域 -->
    <el-menu
      :default-active="selectedPath"
      :default-openeds="openedPaths"
      :collapse="sidebarCollapsed && !isMobile"
      :unique-opened="true"
      class="sidebar-menu"
      @select="handleMenuSelect"
      @open="handleMenuOpen"
      @close="handleMenuClose"
    >
      <!-- 递归渲染菜单项 -->
      <sidebar-menu-item
        v-for="menuItem in visibleMenus"
        :key="menuItem.id"
        :menu-item="menuItem"
        :sidebar-collapsed="sidebarCollapsed"
      />
    </el-menu>

    <!-- 底部信息 -->
    <div class="sidebar-footer">
      <transition name="footer-text">
        <div
          v-show="!sidebarCollapsed"
          class="version-info"
        >
          v{{ APP_VERSION }}
        </div>
      </transition>
    </div>

    <!-- 移动端遮罩层 -->
    <div
      v-if="isMobile && isMobileMenuOpen"
      class="sidebar-overlay"
      @click="closeMobileMenu"
    />
  </aside>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import logoSvg from '@/assets/logo.svg'
import SidebarMenuItem from './SidebarMenuItem.vue'
import { useLayout } from '@/composables/useLayout'
import { useMenu } from '@/composables/useMenu'
import { APP_VERSION } from '@/constants/app'

// ==================== 状态管理 ====================

const { sidebarCollapsed, isMobileMenuOpen, isMobile, closeMobileMenu } = useLayout()

const { menuTree, selectedPath, openedPaths, selectMenu } = useMenu()

// ==================== 计算属性 ====================

/** 可见的菜单（过滤掉隐藏的菜单） */
const visibleMenus = computed(() => {
  return menuTree.value.filter(menu => !menu.is_hidden)
})

// ==================== 方法 ====================

/**
 * 处理菜单选择事件
 */
const handleMenuSelect = (path: string) => {
  selectMenu(path)

  // 移动端：选择菜单后关闭抽屉
  if (isMobile.value) {
    closeMobileMenu()
  }
}

/**
 * 处理子菜单展开事件
 */
const handleMenuOpen = (path: string) => {
  if (!openedPaths.value.includes(path)) {
    openedPaths.value.push(path)
  }
}

/**
 * 处理子菜单收起事件
 */
const handleMenuClose = (path: string) => {
  const index = openedPaths.value.indexOf(path)
  if (index > -1) {
    openedPaths.value.splice(index, 1)
  }
}
</script>

<style scoped>
/* ==================== CSS 变量定义 ==================== */

/* 暗黑模式变量 */
html.dark .app-sidebar {
  --sidebar-bg: rgb(10 14 39 / 98%);
  --sidebar-border: rgb(0 243 255 / 10%);
  --sidebar-shadow: 2px 0 20px rgb(0 0 0 / 30%);
  --header-bg: rgb(0 243 255 / 3%);
  --header-border: rgb(0 243 255 / 8%);
  --logo-text-color: #fff;
  --logo-glow: rgb(0 243 255 / 50%);
  --menu-color: rgb(255 255 255 / 70%);
  --menu-hover-bg: rgb(0 243 255 / 8%);
  --menu-hover-color: rgb(255 255 255 / 100%);
  --menu-active-bg: rgb(0 243 255 / 12%);
  --menu-active-color: #00f3ff;
  --menu-active-shadow: 0 0 20px rgb(0 243 255 / 10%);
  --menu-icon-glow: rgb(0 243 255 / 50%);
  --menu-opened-bg: rgb(0 243 255 / 5%);
  --menu-opened-color: rgb(255 255 255 / 90%);
  --footer-border: rgb(0 243 255 / 8%);
  --footer-color: rgb(255 255 255 / 30%);
  --scrollbar-thumb: rgb(0 243 255 / 10%);
  --scrollbar-thumb-hover: rgb(0 243 255 / 20%);
}

/* 亮模式变量 */
html:not(.dark) .app-sidebar {
  --sidebar-bg: #f5f6f7;
  --sidebar-border: #e4e7ed;
  --sidebar-shadow: 2px 0 8px rgb(0 0 0 / 5%);
  --header-bg: #f5f7fa;
  --header-border: #e4e7ed;
  --logo-text-color: #303133;
  --logo-glow: rgb(64 158 255 / 50%);
  --menu-color: #606266;
  --menu-hover-bg: #ecf5ff;
  --menu-hover-color: #409eff;
  --menu-active-bg: #409eff;
  --menu-active-color: #fff;
  --menu-active-shadow: 0 2px 8px rgb(64 158 255 / 30%);
  --menu-icon-glow: rgb(64 158 255 / 50%);
  --menu-opened-bg: #f5f7fa;
  --menu-opened-color: #303133;
  --footer-border: #e4e7ed;
  --footer-color: #909399;
  --scrollbar-thumb: rgb(0 0 0 / 10%);
  --scrollbar-thumb-hover: rgb(0 0 0 / 20%);
}

/* ==================== 基础布局 ==================== */
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  display: flex;
  flex-direction: column;

  /* 使用 CSS 变量 */
  background: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  backdrop-filter: blur(20px);
  box-shadow: var(--sidebar-shadow);
}

/* 桌面端宽度 */
.app-sidebar:not(.is-mobile) {
  width: 240px;
}

.app-sidebar:not(.is-mobile).is-collapsed {
  width: 64px;
}

/* 移动端 */
.app-sidebar.is-mobile {
  width: 240px;
  transform: translateX(-100%);
}

.app-sidebar.is-mobile.is-open {
  transform: translateX(0);
}

/* ==================== Logo 区域 ==================== */
.sidebar-header {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  flex-shrink: 0;
  border-bottom: 1px solid var(--header-border);
  background: var(--header-bg);
}

.logo-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
}

.logo-image {
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  filter: drop-shadow(0 0 10px var(--logo-glow));
}

.logo-text {
  margin-left: 12px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: var(--logo-text-color);
}

.logo-highlight {
  font-size: 24px;
  background: linear-gradient(135deg, #00f3ff 0%, #0f8 100%);
  background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 折叠状态 */
.is-collapsed .logo-text {
  display: none;
}

/* ==================== 菜单区域 ==================== */
.sidebar-menu {
  flex: 1;
  overflow: hidden auto;
  background: transparent;
  border: none;
  padding: 8px 0;
}

/* 自定义滚动条 */
.sidebar-menu::-webkit-scrollbar {
  width: 6px;
}

.sidebar-menu::-webkit-scrollbar-track {
  background: transparent;
}

.sidebar-menu::-webkit-scrollbar-thumb {
  background: var(--scrollbar-thumb);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: var(--scrollbar-thumb-hover);
}

/* Element Plus 菜单样式覆盖 */
.sidebar-menu.el-menu {
  background: transparent;
}

/* 隐藏 Element Plus 默认的子菜单箭头图标 */
.sidebar-menu :deep(.el-sub-menu__icon-arrow) {
  display: none !important;
}

/* 菜单项基础样式 */
.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: var(--menu-color);
  background: transparent;
  border-radius: 8px;
  margin: 0 8px;
  padding: 0 12px;
  height: 44px;
  line-height: 44px;
  transition: all 0.3s ease;
}

.sidebar-menu :deep(.el-menu-item:hover),
.sidebar-menu :deep(.el-sub-menu__title:hover) {
  background: var(--menu-hover-bg);
  color: var(--menu-hover-color);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: var(--menu-active-bg);
  color: var(--menu-active-color);
  box-shadow: var(--menu-active-shadow);
}

.sidebar-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  background: var(--menu-opened-bg);
  color: var(--menu-opened-color);
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 48px;
  background: transparent;
}

/* 子菜单项选中状态（需要更高优先级） */
.sidebar-menu :deep(.el-sub-menu .el-menu-item.is-active) {
  background: var(--menu-active-bg) !important;
  color: var(--menu-active-color) !important;
  box-shadow: var(--menu-active-shadow);
}

/* 二级菜单缩进 */
.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 68px;
}

/* 三级菜单项选中状态 */
.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-menu-item.is-active) {
  background: var(--menu-active-bg) !important;
  color: var(--menu-active-color) !important;
  box-shadow: var(--menu-active-shadow);
}

/* 子菜单容器样式 */
.sidebar-menu :deep(.el-menu--inline) {
  background: transparent;
  padding: 4px 0;
}

.sidebar-menu :deep(.el-sub-menu .el-menu) {
  background: transparent;
}

/* ==================== 底部信息 ==================== */
.sidebar-footer {
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-top: 1px solid var(--footer-border);
}

.version-info {
  font-size: 12px;
  font-family: 'Courier New', monospace;
  color: var(--footer-color);
}

/* ==================== 移动端遮罩层 ==================== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
  z-index: 99;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* ==================== 过渡动画 ==================== */
.logo-text-enter-active,
.logo-text-leave-active {
  transition: all 0.3s ease;
}

.logo-text-enter-from,
.logo-text-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}

.footer-text-enter-active,
.footer-text-leave-active {
  transition: all 0.3s ease;
}

.footer-text-enter-from,
.footer-text-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
</style>
