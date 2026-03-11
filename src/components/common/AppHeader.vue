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
      <!-- 主题切换 -->
      <ThemeToggle />

      <!-- 时区设置对话框 -->
      <el-dialog
        v-model="timezoneDialogVisible"
        title="时区设置"
        width="600px"
        :append-to-body="true"
        :close-on-click-modal="false"
        class="timezone-dialog"
      >
        <TimezoneSettings ref="timezoneSettingsRef" />

        <template #footer>
          <div class="timezone-dialog-footer">
            <el-button @click="handleTimezoneCancel">取消</el-button>
            <el-button
              type="primary"
              :disabled="!timezoneSettingsRef?.hasChanges"
              @click="handleTimezoneConfirm"
            >
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>

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
            <el-dropdown-item command="timezone">
              <el-icon><Clock /></el-icon>
              <span>时区设置</span>
              <el-tag
                v-if="currentTimezoneLabel"
                size="small"
                class="timezone-tag"
              >
                {{ currentTimezoneLabel }}
              </el-tag>
            </el-dropdown-item>
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
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Fold,
  Expand,
  Search,
  User,
  ArrowDown,
  Monitor,
  SwitchButton,
  Clock
} from '@element-plus/icons-vue'
import { useLayout } from '@/composables/useLayout'
import { useMenu } from '@/composables/useMenu'
import { logout } from '@/api/services/token-refresh'
import { apiClient } from '@/api/client'
import { usePermission } from '@/composables/usePermission'
import { useTimezoneStore } from '@/stores/timezone'
import type { MenuItem } from '@/types/menu'
import ThemeToggle from './ThemeToggle.vue'
import TimezoneSettings from './TimezoneSettings.vue'

// ==================== 状态管理 ====================

const { toggleSidebar, sidebarCollapsed } = useLayout()
const { clearMenus } = useMenu()
const { clearPermissions } = usePermission()
const timezoneStore = useTimezoneStore()

// ==================== 对话框状态 ====================

/**
 * 时区设置对话框可见性
 */
const timezoneDialogVisible = ref(false)

/**
 * TimezoneSettings 组件引用
 */
const timezoneSettingsRef = ref<InstanceType<typeof TimezoneSettings> | null>(null)

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

/**
 * 当前时区标签（用于显示在用户菜单中）
 */
const currentTimezoneLabel = computed(() => {
  if (timezoneStore.useBrowserTimezone) {
    return '浏览器时区'
  }
  if (timezoneStore.userTimezone) {
    // 简化显示：只显示城市名
    const tz = timezoneStore.userTimezone
    if (tz.includes('/')) {
      const city = tz.split('/').pop()?.replace('_', ' ')
      return city || tz
    }
    return tz
  }
  return null // 默认时区不显示标签
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
    case 'timezone':
      // 打开时区设置对话框
      timezoneDialogVisible.value = true
      break

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
 * 确认时区设置
 */
const handleTimezoneConfirm = () => {
  if (!timezoneSettingsRef.value) return

  // 应用时区设置（保存到 Store）
  timezoneSettingsRef.value.applyTimezoneSettings()

  // 关闭对话框
  timezoneDialogVisible.value = false

  // 显示成功提示
  const timezoneLabel = timezoneSettingsRef.value.currentTimezoneLabel
  ElMessage.success({
    message: `时区已切换为 ${timezoneLabel}`,
    duration: 2000
  })
}

/**
 * 取消时区设置
 */
const handleTimezoneCancel = () => {
  if (!timezoneSettingsRef.value) return

  // 重置编辑状态（放弃修改）
  timezoneSettingsRef.value.resetTimezoneSettings()

  // 关闭对话框
  timezoneDialogVisible.value = false

  // 提示用户已取消
  ElMessage.info({
    message: '已取消时区设置修改',
    duration: 1500
  })
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
  z-index: 99;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* 暗黑模式头部 */
html.dark .app-header {
  background: rgb(13 17 23 / 80%);
  border-bottom: 1px solid rgb(0 243 255 / 10%);
  backdrop-filter: blur(20px);
  box-shadow: 0 2px 20px rgb(0 0 0 / 30%);
}

/* 亮模式头部 */
html:not(.dark) .app-header {
  background: #f5f6f7;
  border-bottom: 1px solid #e4e7ed;
  box-shadow: 0 2px 8px rgb(0 0 0 / 5%);
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

/* 暗黑模式折叠按钮 */
html.dark .collapse-button {
  color: rgb(255 255 255 / 70%);
  background: transparent;
  border: 1px solid rgb(255 255 255 / 10%);
}

html.dark .collapse-button:hover {
  color: #00f3ff;
  background: rgb(0 243 255 / 8%);
  border-color: rgb(0 243 255 / 30%);
}

/* 亮模式折叠按钮 */
html:not(.dark) .collapse-button {
  color: #606266;
  background: transparent;
  border: 1px solid #dcdfe6;
}

html:not(.dark) .collapse-button:hover {
  color: #409eff;
  background: #ecf5ff;
  border-color: #409eff;
}

.collapse-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
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

/* 暗黑模式面包屑 */
html.dark .breadcrumb :deep(.el-breadcrumb__inner) {
  color: rgb(255 255 255 / 60%);
  font-size: 14px;
  transition: all 0.3s ease;
}

html.dark .breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: #00f3ff;
}

html.dark .breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: rgb(255 255 255 / 90%);
}

html.dark .breadcrumb :deep(.el-breadcrumb__separator) {
  color: rgb(255 255 255 / 30%);
  margin: 0 8px;
}

/* 亮模式面包屑 */
html:not(.dark) .breadcrumb :deep(.el-breadcrumb__inner) {
  color: #909399;
  font-size: 14px;
  transition: all 0.3s ease;
}

html:not(.dark) .breadcrumb :deep(.el-breadcrumb__inner:hover) {
  color: #409eff;
}

html:not(.dark) .breadcrumb :deep(.el-breadcrumb__item:last-child .el-breadcrumb__inner) {
  color: #303133;
}

html:not(.dark) .breadcrumb :deep(.el-breadcrumb__separator) {
  color: #c0c4cc;
  margin: 0 8px;
}

/* ==================== 右侧区域 ==================== */
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 暗黑模式搜索占位符 */
html.dark .search-placeholder {
  color: rgb(255 255 255 / 40%);
  background: rgb(255 255 255 / 5%);
  border: 1px solid rgb(255 255 255 / 10%);
}

html.dark .search-placeholder:hover {
  color: rgb(255 255 255 / 70%);
  background: rgb(255 255 255 / 8%);
  border-color: rgb(255 255 255 / 20%);
}

/* 亮模式搜索占位符 */
html:not(.dark) .search-placeholder {
  color: #909399;
  background: #f5f7fa;
  border: 1px solid #dcdfe6;
}

html:not(.dark) .search-placeholder:hover {
  color: #409eff;
  background: #ecf5ff;
  border-color: #409eff;
}

.search-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
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

/* 暗黑模式用户菜单 */
html.dark .user-dropdown:hover {
  background: rgb(255 255 255 / 5%);
}

html.dark .user-name {
  color: rgb(255 255 255 / 90%);
}

html.dark .dropdown-arrow {
  color: rgb(255 255 255 / 40%);
}

html.dark .user-dropdown:hover .dropdown-arrow {
  color: rgb(255 255 255 / 70%);
}

/* 亮模式用户菜单 */
html:not(.dark) .user-dropdown:hover {
  background: #f5f7fa;
}

html:not(.dark) .user-name {
  color: #303133;
}

html:not(.dark) .dropdown-arrow {
  color: #909399;
}

html:not(.dark) .user-dropdown:hover .dropdown-arrow {
  color: #409eff;
}

.user-avatar {
  color: #00f3ff;
  background: rgb(0 243 255 / 10%);
  border: 1px solid rgb(0 243 255 / 30%);
}

.user-name {
  font-size: 14px;
  font-weight: 500;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.dropdown-arrow {
  font-size: 14px;
  transition: all 0.3s ease;
}

/* ==================== 用户下拉菜单样式 ==================== */

/* 暗黑模式下拉菜单 */
html.dark .user-dropdown-menu {
  background: rgb(10 14 39 / 98%);
  border: 1px solid rgb(0 243 255 / 10%);
  box-shadow: 0 0 40px rgb(0 243 255 / 10%);
  backdrop-filter: blur(20px);
}

html.dark .user-dropdown-menu :deep(.el-dropdown-menu__item) {
  color: rgb(255 255 255 / 70%);
}

html.dark .user-dropdown-menu :deep(.el-dropdown-menu__item:hover) {
  background: rgb(0 243 255 / 8%);
  color: rgb(255 255 255 / 100%);
}

html.dark .user-dropdown-menu :deep(.el-dropdown-menu__item.is-divided) {
  border-top: 1px solid rgb(0 243 255 / 10%);
}

/* 亮模式下拉菜单 */
html:not(.dark) .user-dropdown-menu {
  background: #f5f6f7;
  border: 1px solid #e4e7ed;
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%);
}

html:not(.dark) .user-dropdown-menu :deep(.el-dropdown-menu__item) {
  color: #606266;
}

html:not(.dark) .user-dropdown-menu :deep(.el-dropdown-menu__item:hover) {
  background: #ecf5ff;
  color: #409eff;
}

html:not(.dark) .user-dropdown-menu :deep(.el-dropdown-menu__item.is-divided) {
  border-top: 1px solid #e4e7ed;
}

.user-dropdown-menu {
  padding: 8px;
  min-width: 200px;
}

.user-dropdown-menu :deep(.el-dropdown-menu__item) {
  background: transparent;
  border-radius: 6px;
  padding: 8px 12px;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
  justify-content: flex-start;
}

.user-dropdown-menu :deep(.el-dropdown-menu__item > span) {
  flex: 1;
}

.user-dropdown-menu :deep(.el-dropdown-menu__item.is-divided) {
  margin-top: 8px;
  padding-top: 8px;
}

.user-dropdown-menu :deep(.el-dropdown-menu__item .el-icon) {
  color: inherit;
  flex-shrink: 0;
}

/* 时区标签 */
.timezone-tag {
  margin-left: auto;
  font-size: 11px;
  height: 20px;
  line-height: 20px;
  padding: 0 8px;
  flex-shrink: 0;
  border-radius: 4px;
  font-weight: 500;
}

/* 暗黑模式时区标签 */
html.dark .timezone-tag {
  background: rgb(0 243 255 / 15%);
  border-color: rgb(0 243 255 / 30%);
  color: rgb(0 243 255 / 90%);
}

/* 亮模式时区标签 */
html:not(.dark) .timezone-tag {
  background: #ecf5ff;
  border-color: #409eff;
  color: #409eff;
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
