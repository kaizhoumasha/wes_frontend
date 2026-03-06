<template>
  <div
    class="default-layout"
    :class="{ 'sidebar-collapsed': sidebarCollapsed }"
  >
    <!-- 侧边栏 -->
    <app-sidebar />

    <!-- 主内容区 -->
    <div
      class="main-content"
      :style="{ marginLeft: contentMarginLeft }"
    >
      <!-- 顶部导航栏 -->
      <app-header />

      <!-- 页面内容 -->
      <main class="page-main">
        <router-view v-slot="{ Component, route: currentRoute }">
          <transition
            name="page"
            mode="out-in"
          >
            <component
              :is="Component"
              :key="currentRoute.path"
            />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from '@/components/common/AppSidebar.vue'
import AppHeader from '@/components/common/AppHeader.vue'
import { useLayout } from '@/composables/useLayout'
import { useMenu } from '@/composables/useMenu'

// ==================== 状态管理 ====================

const { sidebarCollapsed, contentMarginLeft } = useLayout()
const { selectMenu, isMenuLoaded, loadMenus } = useMenu()

// ==================== 路由 ====================

const route = useRoute()

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
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0e27 0%, #1a1f3a 50%, #0d1117 100%);
  overflow: hidden;
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
  padding: 24px;
  margin-top: 64px;
  overflow: hidden auto;
}

/* 自定义滚动条 */
.page-main::-webkit-scrollbar {
  width: 8px;
}

.page-main::-webkit-scrollbar-track {
  background: transparent;
}

.page-main::-webkit-scrollbar-thumb {
  background: rgb(0 243 255 / 10%);
  border-radius: 4px;
}

.page-main::-webkit-scrollbar-thumb:hover {
  background: rgb(0 243 255 / 20%);
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
