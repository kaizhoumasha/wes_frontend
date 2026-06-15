<template>
  <div
    class="default-layout"
    :class="{ 'sidebar-collapsed': sidebarCollapsed, 'is-immersive': isImmersiveRoute }"
  >
    <!-- 侧边栏 -->
    <app-sidebar v-if="!isImmersiveRoute" />

    <!-- 移动端侧边栏遮罩层 -->
    <div
      v-if="!isImmersiveRoute && isMobile && isMobileMenuOpen"
      class="sidebar-overlay"
      @click="closeMobileMenu"
    />

    <!-- 主内容区 -->
    <div
      class="main-content"
      :style="{ marginLeft: isImmersiveRoute ? '0' : contentMarginLeft }"
    >
      <!-- 顶部导航栏 -->
      <app-header v-if="!isImmersiveRoute" />

      <!-- 页面内容 -->
      <main class="page-main">
        <router-view v-slot="{ Component }">
          <transition
            name="page"
            mode="out-in"
          >
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useLayout } from '@/composables/useLayout'
import { useMenu } from '@/composables/useMenu'

// ==================== 状态管理 ====================

const { sidebarCollapsed, contentMarginLeft, isMobile, isMobileMenuOpen, closeMobileMenu } =
  useLayout()
const { selectMenu, isMenuLoaded, loadMenus } = useMenu()

// ==================== 路由 ====================

const route = useRoute()
const isImmersiveRoute = computed(() => route.meta.runtimeImmersive === true)

// ==================== 生命周期 ====================

onMounted(() => {
  // 兜底初始化：刷新/新标签页进入时，确保菜单数据可用
  if (!isMenuLoaded.value) {
    loadMenus().catch(error => {
      console.warn('布局初始化菜单失败:', error)
    })
  }

  // 初始化：选中当前路由对应的菜单
  selectMenu(route.path)
})
</script>

<style scoped>
/* ==================== 基础布局 ==================== */
.default-layout {
  --layout-header-height: 64px;
  --layout-page-padding: 8px;

  min-height: 100vh;
  overflow: hidden;
}

.default-layout.is-immersive {
  --layout-header-height: 0px;
  --layout-page-padding: 0px;
}

/* 暗黑模式背景 */
html.dark .default-layout {
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1117 100%);
}

/* 亮模式背景 - 使用更柔和的暖灰色 */
html:not(.dark) .default-layout {
  background: linear-gradient(135deg, #f0f2f5 0%, #e4e8eb 100%);
}

/* ==================== 主内容区 ==================== */
.main-content {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* ==================== 页面内容 ==================== */
.page-main {
  flex: 1;
  padding: var(--layout-page-padding);
  margin-top: var(--layout-header-height);
  overflow: auto;
  min-height: 0;
}

/* 自定义滚动条 */
.page-main::-webkit-scrollbar {
  width: 8px;
}

.page-main::-webkit-scrollbar-track {
  background: transparent;
}

.page-main::-webkit-scrollbar-thumb {
  background: rgb(148 163 184 / 15%);
  border-radius: 4px;
}

.page-main::-webkit-scrollbar-thumb:hover {
  background: rgb(148 163 184 / 25%);
}

/* ==================== 页面切换动画 ==================== */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.page-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* ==================== 移动端侧边栏遮罩层 ==================== */
.sidebar-overlay {
  position: fixed;
  inset: 0;
  background: rgb(0 0 0 / 50%);
  backdrop-filter: blur(4px);
  z-index: 999;
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

/* ==================== 移动端适配 ==================== */
@media (width < 768px) {
  .page-main {
    padding: 16px;
  }

  .main-content {
    margin-left: 0 !important;
  }
}
</style>
