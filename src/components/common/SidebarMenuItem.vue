<template>
  <!-- 有子菜单的情况 -->
  <el-sub-menu
    v-if="hasChildren"
    :index="menuItem.path"
    :popper-class="sidebarCollapsed ? 'sidebar-submenu-popup' : ''"
  >
    <template #title>
      <div class="menu-item-content">
        <AppIcon
          :icon="menuItem.icon"
          :fallback="'Menu'"
          class="menu-icon"
        />
        <span
          v-show="!sidebarCollapsed"
          class="menu-title"
        >
          {{ menuItem.title }}
        </span>
        <el-icon
          v-show="!sidebarCollapsed"
          class="menu-arrow"
        >
          <ArrowRight />
        </el-icon>
      </div>
    </template>

    <!-- 递归渲染子菜单 -->
    <sidebar-menu-item
      v-for="child in visibleChildren"
      :key="child.id"
      :menu-item="child"
      :sidebar-collapsed="sidebarCollapsed"
      :level="level + 1"
    />
  </el-sub-menu>

  <!-- 叶子节点（无子菜单） -->
  <el-menu-item
    v-else
    :index="menuItem.path"
    @click="handleMenuClick"
  >
    <div class="menu-item-content">
      <AppIcon
        :icon="menuItem.icon"
        :fallback="'Document'"
        class="menu-icon"
      />
      <span
        v-show="!sidebarCollapsed"
        class="menu-title"
      >
        {{ menuItem.title }}
      </span>
    </div>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { ArrowRight } from '@element-plus/icons-vue'
import AppIcon from '@/components/ui/AppIcon.vue'
import type { MenuItem } from '@/types/menu'

// ==================== Props ====================

interface Props {
  /** 菜单项数据 */
  menuItem: MenuItem
  /** 侧边栏是否折叠 */
  sidebarCollapsed?: boolean
  /** 菜单层级（用于缩进） */
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  sidebarCollapsed: false,
  level: 0
})

// ==================== 路由 ====================

const router = useRouter()

// ==================== 计算属性 ====================

/** 是否有可见的子菜单 */
const hasChildren = computed(() => {
  return visibleChildren.value.length > 0
})

/** 可见的子菜单（过滤掉隐藏的菜单） */
const visibleChildren = computed(() => {
  return props.menuItem.children.filter(child => !child.is_hidden)
})

// ==================== 方法 ====================

/**
 * 处理菜单点击事件
 */
const handleMenuClick = () => {
  router.push(props.menuItem.path)
}
</script>

<style scoped>
/* ==================== 菜单项内容 ==================== */
.menu-item-content {
  display: flex;
  align-items: center;
  width: 100%;
  transition: all 0.3s ease;
}

/* 使用 CSS 变量的菜单样式 */
.menu-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--menu-icon-color);
  transition: all 0.3s ease;
}

.el-menu-item:hover .menu-icon,
.el-sub-menu__title:hover .menu-icon {
  color: var(--menu-text-hover);
}

.menu-title {
  margin-left: 12px;
  font-size: 14px;
  color: var(--menu-text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: all 0.3s ease;
}

.el-menu-item:hover .menu-title,
.el-sub-menu__title:hover .menu-title {
  color: var(--menu-text-hover);
}

.menu-arrow {
  margin-left: auto;
  font-size: 14px;
  color: var(--menu-arrow-color);
  transition: all 0.3s ease;
}

/* ==================== 选中状态 ==================== */
.el-menu-item.is-active .menu-icon {
  color: var(--menu-text-active);
  filter: drop-shadow(0 0 8px var(--menu-icon-glow));
}

.el-menu-item.is-active .menu-title {
  color: var(--menu-text-active);
}

/* ==================== 子菜单展开状态 ==================== */
.el-sub-menu.is-opened > .el-sub-menu__title .menu-arrow,
.el-sub-menu.is-active.is-opened > .el-sub-menu__title .menu-arrow {
  transform: rotate(90deg);
}

.el-sub-menu > .el-sub-menu__title .menu-arrow {
  transform: rotate(0deg);
}

/* ==================== 折叠状态 ==================== */
.el-menu--collapse .menu-item-content {
  justify-content: center;
  padding: 0;
}

/* ==================== 子菜单弹出样式 ==================== */

/* 暗黑模式子菜单弹出层 */
html.dark .sidebar-submenu-popup {
  background: rgb(10 14 39 / 98%) !important;
  border: 1px solid rgb(0 243 255 / 10%) !important;
  box-shadow: 0 0 40px rgb(0 243 255 / 10%) !important;
  backdrop-filter: blur(20px) !important;
}

html.dark .sidebar-submenu-popup .el-menu-item {
  color: rgb(255 255 255 / 70%) !important;
  background: transparent !important;
}

html.dark .sidebar-submenu-popup .el-menu-item:hover {
  background: rgb(0 243 255 / 8%) !important;
}

html.dark .sidebar-submenu-popup .el-menu-item.is-active {
  background: rgb(0 243 255 / 12%) !important;
  color: #00f3ff !important;
}

/* 亮模式子菜单弹出层 */
html:not(.dark) .sidebar-submenu-popup {
  background: #fff !important;
  border: 1px solid #e4e7ed !important;
  box-shadow: 0 2px 12px rgb(0 0 0 / 10%) !important;
}

html:not(.dark) .sidebar-submenu-popup .el-menu-item {
  color: #606266 !important;
  background: transparent !important;
}

html:not(.dark) .sidebar-submenu-popup .el-menu-item:hover {
  background: #ecf5ff !important;
}

html:not(.dark) .sidebar-submenu-popup .el-menu-item.is-active {
  background: #409eff !important;
  color: #fff !important;
}

.sidebar-submenu-popup .el-menu-item .menu-title {
  color: inherit !important;
}
</style>
