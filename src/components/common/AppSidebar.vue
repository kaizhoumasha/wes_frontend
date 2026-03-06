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
        >
        <transition name="logo-text">
          <div
            v-show="!sidebarCollapsed"
            class="logo-text"
          >
            <span class="logo-highlight">P9</span> WES
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
          v{{ version }}
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

// ==================== 状态管理 ====================

const { sidebarCollapsed, isMobileMenuOpen, isMobile, closeMobileMenu } = useLayout()

const { menuTree, selectedPath, openedPaths, selectMenu } = useMenu()

// ==================== 常量 ====================

const version = '0.1.0'

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
/* ==================== 基础布局 ==================== */
.app-sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  background: rgb(10 14 39 / 98%);
  border-right: 1px solid rgb(0 243 255 / 10%);
  backdrop-filter: blur(20px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 100;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 20px rgb(0 0 0 / 30%);
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
  border-bottom: 1px solid rgb(0 243 255 / 8%);
  background: rgb(0 243 255 / 3%);
  flex-shrink: 0;
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
  filter: drop-shadow(0 0 10px rgb(0 243 255 / 50%));
}

.logo-text {
  margin-left: 12px;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: -0.5px;
  color: #fff;
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
  background: rgb(0 243 255 / 10%);
  border-radius: 3px;
}

.sidebar-menu::-webkit-scrollbar-thumb:hover {
  background: rgb(0 243 255 / 20%);
}

/* Element Plus 菜单样式覆盖 */
.sidebar-menu.el-menu {
  background: transparent;
}

/* 隐藏 Element Plus 默认的子菜单箭头图标 */
.sidebar-menu :deep(.el-sub-menu__icon-arrow) {
  display: none !important;
}

.sidebar-menu :deep(.el-menu-item),
.sidebar-menu :deep(.el-sub-menu__title) {
  color: rgb(255 255 255 / 70%);
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
  background: rgb(0 243 255 / 8%);
  color: rgb(255 255 255 / 100%);
}

.sidebar-menu :deep(.el-menu-item.is-active) {
  background: rgb(0 243 255 / 12%);
  color: #00f3ff;
  box-shadow: 0 0 20px rgb(0 243 255 / 10%);
}

/* 子菜单展开状态的标题样式 */
.sidebar-menu :deep(.el-sub-menu.is-opened > .el-sub-menu__title) {
  background: rgb(0 243 255 / 5%);
  color: rgb(255 255 255 / 90%);
}

.sidebar-menu :deep(.el-sub-menu .el-menu-item) {
  padding-left: 48px;
  background: transparent;
}

/* 二级菜单缩进 */
.sidebar-menu :deep(.el-sub-menu .el-sub-menu .el-menu-item) {
  padding-left: 68px;
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
  border-top: 1px solid rgb(0 243 255 / 8%);
  flex-shrink: 0;
}

.version-info {
  font-size: 12px;
  color: rgb(255 255 255 / 30%);
  font-family: 'Courier New', monospace;
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
