<!--
用户管理工具栏组件

4段式布局：
- 标题区：[i] 用户管理
- 操作区：[+ 新增] [...] 更多
- 搜索区：SmartSearchBar
- 控制区：[⟳] [⛶] [↕] [⚙]

支持批量操作模式：
- 有选中项时，标题区变为上下文操作区
-->
<template>
  <div class="user-toolbar">
    <!-- 标题区 + 操作区（居左） -->
    <div class="user-toolbar__left">
      <!-- 正常模式：显示标题 -->
      <h2
        v-if="selectedCount === 0"
        class="user-toolbar__title"
      >
        <el-icon><User /></el-icon>
        <span>用户管理</span>
      </h2>

      <!-- 批量操作模式：显示选中状态 -->
      <div
        v-else
        class="user-toolbar__selection"
      >
        <span class="user-toolbar__selection-count">已选中 {{ selectedCount }} 项</span>
        <el-button
          link
          @click="$emit('cancel-selection')"
        >
          取消选择
        </el-button>
      </div>

      <!-- 正常模式：显示新增按钮 -->
      <el-tooltip
        v-if="selectedCount === 0 && canCreate"
        content="创建新用户"
        placement="bottom"
      >
        <el-button
          type="primary"
          @click="$emit('create')"
        >
          <el-icon><Plus /></el-icon>
          新增用户
        </el-button>
      </el-tooltip>

      <!-- 批量操作模式：显示批量删除按钮 -->
      <el-tooltip
        v-if="selectedCount > 0 && canDelete"
        content="删除选中的用户"
        placement="bottom"
      >
        <el-button
          type="danger"
          :loading="batchDeleteLoading"
          @click="$emit('batch-delete')"
        >
          <el-icon><Delete /></el-icon>
          批量删除
        </el-button>
      </el-tooltip>
    </div>

    <!-- 搜索框（居中） -->
    <div class="user-toolbar__search">
      <SmartSearchBar
        :conditions="conditions"
        :keyword="keyword"
        :active-field="activeField"
        :fields="fields"
        :favorites="favorites"
        :quick-presets="quickPresets"
        :loading="loading"
        :popover-open="popoverOpen"
        placeholder="搜索用户名、邮箱..."
        @update:keyword="handleUpdateKeyword"
        @remove-condition="handleRemoveCondition"
        @clear="handleClear"
        @search="handleSearch"
        @open-popover="$emit('open-popover')"
        @close-popover="$emit('close-popover')"
        @toggle-popover="handleTogglePopover"
        @open-advanced="handleOpenAdvanced"
        @keydown-next="$emit('keydown-next')"
        @keydown-prev="$emit('keydown-prev')"
        @activate-field="$emit('activate-field', $event)"
        @open-advanced-for-field="$emit('open-advanced-for-field', $event)"
      />
    </div>

    <!-- 控制区（居右） -->
    <div class="user-toolbar__controls-wrapper">
      <div class="user-toolbar__controls">
        <!-- 刷新按钮 -->
        <el-tooltip
          content="刷新数据"
          placement="bottom"
        >
          <el-button
            size="small"
            :icon="Refresh"
            :loading="loading"
            @click="$emit('refresh')"
          />
        </el-tooltip>

        <!-- 全屏切换按钮 -->
        <el-tooltip
          :content="isFullscreen ? '退出全屏' : '全屏显示'"
          placement="bottom"
        >
          <el-button
            size="small"
            :icon="isFullscreen ? ScaleToOriginal : FullScreen"
            @click="$emit('toggle-fullscreen')"
          />
        </el-tooltip>

        <!-- 密度切换下拉菜单 -->
        <el-tooltip
          content="调整行高"
          placement="bottom"
        >
          <el-dropdown
            trigger="click"
            @command="(val: TableDensity) => $emit('change-density', val)"
          >
            <el-button
              size="small"
              :icon="Grid"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="(config, key) in DENSITY_CONFIG"
                  :key="key"
                  :command="key"
                  :class="{ 'is-active': density === key }"
                >
                  {{ config.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </el-tooltip>

        <!-- 列配置按钮 -->
        <el-tooltip
          content="配置显示列"
          placement="bottom"
        >
          <el-button
            size="small"
            :icon="Setting"
            @click="$emit('open-column-config')"
          />
        </el-tooltip>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import {
  User,
  Plus,
  Refresh,
  Delete,
  FullScreen,
  ScaleToOriginal,
  Grid,
  Setting
} from '@element-plus/icons-vue'
import { usePermission } from '@/composables/usePermission'
import { USER_PERMISSION } from '../constants'
import SmartSearchBar from '@/components/search/SmartSearchBar.vue'
import type { SearchCondition, SearchFieldDef, SearchFavorite } from '@/types/search'
import type { QuickSearchPreset } from '@/types/search'
import type { TableDensity } from '@/types/table'
import { DENSITY_CONFIG } from '@/types/table'

// ==================== 权限控制 ====================

const permissions = usePermission()

const canCreate = computed(() => permissions.hasPermission(USER_PERMISSION.create))
const canDelete = computed(() => permissions.hasPermission(USER_PERMISSION.delete))

// ==================== 类型定义 ====================

interface Emits {
  (e: 'create'): void
  (e: 'refresh'): void
  (e: 'update:keyword', value: string): void
  (e: 'remove-condition', id: string): void
  (e: 'clear'): void
  (e: 'search'): void
  (e: 'open-popover'): void
  (e: 'close-popover'): void
  (e: 'toggle-popover'): void
  (e: 'open-advanced'): void
  (e: 'open-advanced-for-field', fieldKey: string): void
  (e: 'keydown-next'): void
  (e: 'keydown-prev'): void
  (e: 'activate-field', fieldKey: string): void
  (e: 'batch-delete'): void
  (e: 'cancel-selection'): void
  (e: 'toggle-fullscreen'): void
  (e: 'change-density', density: TableDensity): void
  (e: 'open-column-config'): void
}

interface Props {
  /** 搜索条件列表 */
  conditions: SearchCondition[]
  /** 关键字 */
  keyword: string
  /** 当前高亮字段 */
  activeField?: string
  /** 可搜索字段列表 */
  fields: SearchFieldDef[]
  /** 收藏夹列表 */
  favorites: SearchFavorite[]
  /** 快速搜索预设 */
  quickPresets: QuickSearchPreset[]
  /** Popover 是否打开 */
  popoverOpen: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 选中的数量 */
  selectedCount?: number
  /** 批量删除是否加载中 */
  batchDeleteLoading?: boolean
  /** 是否全屏 */
  isFullscreen?: boolean
  /** 当前密度 */
  density?: TableDensity
}

withDefaults(defineProps<Props>(), {
  loading: false,
  activeField: undefined,
  selectedCount: 0,
  batchDeleteLoading: false,
  isFullscreen: false,
  density: 'compact'
})

const emit = defineEmits<Emits>()

// ==================== 事件处理 ====================

function handleUpdateKeyword(value: string) {
  emit('update:keyword', value)
}

function handleRemoveCondition(id: string) {
  emit('remove-condition', id)
}

function handleClear() {
  emit('clear')
}

function handleSearch() {
  emit('search')
}

function handleTogglePopover() {
  emit('toggle-popover')
}

function handleOpenAdvanced() {
  emit('open-advanced')
}
</script>

<style scoped>
.user-toolbar {
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  padding: 16px;
  background: var(--el-bg-color);
  border-radius: 8px;
  gap: 16px;
  border: 1px solid var(--el-border-color-lighter);
}

.user-toolbar__left {
  display: flex;
  align-items: center;
  gap: 16px;
  justify-self: start;
}

.user-toolbar__search {
  width: 100%; /* 填充 Grid 中间列的可用空间 */
  min-width: var(--search-min-width);
  max-width: var(--search-max-width);
  justify-self: center;
  display: flex;
  justify-content: center;
}

.user-toolbar__title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.user-toolbar__selection {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-toolbar__selection-count {
  font-weight: 500;
  color: var(--el-color-primary);
}

.user-toolbar__controls-wrapper {
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.user-toolbar__controls {
  display: flex;
  align-items: center;
  gap: 4px;
}

.user-toolbar__controls :deep(.el-dropdown) {
  display: flex;
  align-items: center;
  line-height: 1;
}

/* 覆盖 Element Plus 的 .el-button + .el-button { margin-left: 12px } 全局规则 */
.user-toolbar__controls :deep(.el-button + .el-button) {
  margin-left: 0;
}

/* ==================== 响应式断点 ==================== */

/* 注意：@media 查询不支持 CSS 变量，必须使用固定值 */

/* 参考：src/constants/breakpoints.ts, tailwind.config.js */

/* 平板端（768px - 1279px）：搜索框单独一行，居左和居右元素在第二行 */
@media (width >= 768px) and (width < 1280px) {
  .user-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
  }

  .user-toolbar__search {
    width: 100%;
    max-width: 100%;
    order: -1; /* 搜索框排在第一行 */
    margin-bottom: 12px;
  }

  .user-toolbar__left {
    width: auto;
  }

  .user-toolbar__controls-wrapper {
    width: auto;
    margin-left: auto; /* 推到右侧 */
  }
}

/* 移动端（< 768px）：搜索框、标题区、控制区各占一行 */
@media (width <= 767px) {
  .user-toolbar {
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .user-toolbar__search {
    width: 100%;
    max-width: 100%;
    order: -1; /* 搜索框排在第一行 */
  }

  .user-toolbar__left {
    width: 100%;
  }

  .user-toolbar__controls-wrapper {
    width: 100%;
    display: flex;
    justify-content: flex-end;
  }
}
</style>
