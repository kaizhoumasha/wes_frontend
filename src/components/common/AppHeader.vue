<template>
  <header class="app-header">
    <!-- 左侧：折叠按钮 + 面包屑 -->
    <div class="header-left">
      <button
        class="collapse-button"
        @click="toggleSidebar"
      >
        <el-icon :size="20">
          <Fold v-if="!sidebarCollapsed" />
          <Expand v-else />
        </el-icon>
      </button>

      <el-breadcrumb
        v-if="breadcrumb.length > 0"
        class="breadcrumb"
        separator="/"
      >
        <el-breadcrumb-item
          v-for="(item, index) in breadcrumb"
          :key="item.path"
          :to="index === breadcrumb.length - 1 ? undefined : item.path"
        >
          {{ item.title }}
        </el-breadcrumb-item>
      </el-breadcrumb>
    </div>

    <!-- 右侧：用户菜单 -->
    <div class="header-right">
      <!-- 占位：全局搜索（后续实现） -->
      <div class="search-placeholder">
        <el-icon :size="18">
          <Search />
        </el-icon>
      </div>

      <!-- 用户菜单 -->
      <el-dropdown
        trigger="click"
        @command="handleUserMenuCommand"
      >
        <div class="user-dropdown">
          <el-avatar
            :size="36"
            :src="userAvatar"
            class="user-avatar"
          >
            <el-icon :size="20">
              <User />
            </el-icon>
          </el-avatar>
          <span class="user-name">{{ username }}</span>
          <el-icon class="dropdown-arrow">
            <ArrowDown />
          </el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="user-dropdown-menu">
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>
              <span>个人资料</span>
            </el-dropdown-item>
            <el-dropdown-item
              command="sessions"
              divided
            >
              <el-icon><Monitor /></el-icon>
              <span>会话管理</span>
            </el-dropdown-item>
            <el-dropdown-item
              command="logout"
              divided
            >
              <el-icon><SwitchButton /></el-icon>
              <span>退出登录</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Fold,
  Expand,
  Search,
  User,
  ArrowDown,
  Monitor,
  SwitchButton
} from '@element-plus/icons-vue'
import { useLayout } from '@/composables/useLayout'
import { useMenu } from '@/composables/useMenu'
import { logout } from '@/api/services/token-refresh'
import { apiClient } from '@/api/client'
import { usePermission } from '@/composables/usePermission'
import type { MenuItem } from '@/types/menu'

// ==================== 状态管理 ====================

const { toggleSidebar, sidebarCollapsed } = useLayout()
const { clearMenus } = useMenu()
const { clearPermissions } = usePermission()

// ==================== 路由 ====================

const router = useRouter()
const route = useRoute()

// ==================== 计算属性 ====================

/** 当前用户名 */
const username = computed(() => {
  return 'Admin' // TODO: 从用户状态获取
})

/** 用户头像 */
const userAvatar = computed(() => {
  return '' // TODO: 从用户状态获取
})

/** 当前路由的面包屑 */
const breadcrumb = computed(() => {
  // 排除根路径
  if (route.path === '/' || route.path === '/dashboard') {
    return [] as MenuItem[]
  }

  // TODO: 从菜单系统获取面包屑
  return [] as MenuItem[]

  // const { getBreadcrumb } = useMenu()
  // return getBreadcrumb(route.path)
})

// ==================== 方法 ====================

/**
 * 处理用户菜单命令
 */
const handleUserMenuCommand = async (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('个人资料功能开发中')
      break

    case 'sessions':
      ElMessage.info('会话管理功能开发中')
      // TODO: 跳转到会话管理页面
      break

    case 'logout':
      await handleLogout()
      break
  }
}

/**
 * 处理退出登录
 */
const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    // 调用后端登出接口
    await logout(apiClient)

    // 清除权限和菜单
    clearPermissions()
    clearMenus()

    ElMessage.success('已退出登录')

    // 跳转到登录页
    router.push('/login')
  } catch (error) {
    // 用户取消操作
    if (error === 'cancel') {
      return
    }

    console.error('登出失败:', error)
    ElMessage.error('登出失败，请稍后重试')
  }
}
</script>

<style scoped>
/* ==================== 基础布局 ==================== */
.app-header {
  position: fixed;
  top: 0;
  right: 0;
  left: 240px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  background: rgb(13 17 23 / 80%);
  border-bottom: 1px solid rgb(0 243 255 / 10%);
  backdrop-filter: blur(20px);
  z-index: 99;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 20px rgb(0 0 0 / 30%);
}

/* 折叠状态 */
.sidebar-collapsed .app-header {
  left: 64px;
}

/* 移动端 */
@media (width < 1280px) {
  .app-header {
    left: 0;
  }
}

/* ==================== 左侧区域 ==================== */
.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

.collapse-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: rgb(255 255 255 / 70%);
  background: transparent;
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.collapse-button:hover {
  color: #00f3ff;
  background: rgb(0 243 255 / 8%);
  border-color: rgb(0 243 255 / 30%);
}

/* 面包屑导航 */
.breadcrumb {
  display: flex;
  align-items: center;
}

.breadcrumb :deep(.el-breadcrumb__item) {
  display: flex;
  align-items: center;
}

.breadcrumb :deep(.el-breadcrumb__inner) {
  color: rgb(255 255 255 / 60%);
  font-size: 14px;
  transition: all 0.3s ease;
}

.breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: #00f3ff;
}

.breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: rgb(255 255 255 / 90%);
}

.breadcrumb :deep(.el-breadcrumb__separator) {
  color: rgb(255 255 255 / 30%);
  margin: 0 8px;
}

/* ==================== 右侧区域 ==================== */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 搜索占位符 */
.search-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  color: rgb(255 255 255 / 40%);
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 10%);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.search-placeholder:hover {
  color: rgb(255 255 255 / 70%);
  background: rgb(255 255 255 / 8%);
  border-color: rgb(255 255 255 / 20%);
}

/* 用户下拉菜单 */
.user-dropdown {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 12px 4px 4px;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-dropdown:hover {
  background: rgb(255 255 255 / 5%);
}

.user-avatar {
  color: #00f3ff;
  background: rgb(0 243 255 / 10%);
  border: 1px solid rgb(0 243 255 / 30%);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  color: rgb(255 255 255 / 90%);
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 14px;
  color: rgb(255 255 255 / 40%);
  transition: all 0.3s ease;
}

.user-dropdown:hover .dropdown-arrow {
  color: rgb(255 255 255 / 70%);
}

/* ==================== 用户下拉菜单样式 ==================== */
.user-dropdown-menu {
  background: rgb(10 14 39 / 98%);
  border: 1px solid rgb(0 243 255 / 10%);
  box-shadow: 0 0 40px rgb(0 243 255 / 10%);
  backdrop-filter: blur(20px);
  padding: 8px;
  min-width: 160px;
}

.user-dropdown-menu :deep(.el-dropdown-menu__item) {
  color: rgb(255 255 255 / 70%);
  background: transparent;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.user-dropdown-menu :deep(.el-dropdown-menu__item:hover) {
  background: rgb(0 243 255 / 8%);
  color: rgb(255 255 255 / 100%);
}

.user-dropdown-menu :deep(.el-dropdown-menu__item.is-divided) {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid rgb(0 243 255 / 10%);
}

.user-dropdown-menu :deep(.el-dropdown-menu__item .el-icon) {
  color: inherit;
}

/* ==================== 响应式设计 ==================== */
@media (width < 768px) {
  .app-header {
    padding: 0 16px;
  }

  .user-name {
    display: none;
  }

  .search-placeholder {
    display: none;
  }
}
</style>
