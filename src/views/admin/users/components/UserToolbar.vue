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
    <!-- 标题区 + 操作区 -->
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
      <el-button
        v-if="selectedCount === 0 && canCreate"
        type="primary"
        @click="$emit('create')"
      >
        <el-icon><Plus /></el-icon>
        新增用户
      </el-button>

      <!-- 批量操作模式：显示批量删除按钮 -->
      <el-button
        v-if="selectedCount > 0 && canDelete"
        type="danger"
        :loading="batchDeleteLoading"
        @click="$emit('batch-delete')"
      >
        <el-icon><Delete /></el-icon>
        批量删除
      </el-button>
    </div>

    <!-- 搜索区 + 控制区 -->
    <div class="user-toolbar__right">
      <!-- 智能搜索框 -->
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

      <!-- 刷新按钮 -->
      <el-button
        :icon="Refresh"
        :loading="loading"
        @click="$emit('refresh')"
      >
        刷新
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { User, Plus, Refresh, Delete } from '@element-plus/icons-vue'
import { usePermission } from '@/composables/usePermission'
import { USER_PERMISSION } from '../constants'
import SmartSearchBar from '@/components/search/SmartSearchBar.vue'
import type { SearchCondition, SearchFieldDef, SearchFavorite } from '@/types/search'
import type { QuickSearchPreset } from '@/types/search'

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
}

withDefaults(defineProps<Props>(), {
  loading: false,
  activeField: undefined,
  selectedCount: 0,
  batchDeleteLoading: false
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
  display: flex;
  justify-content: space-between;
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
  flex-shrink: 0;
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

.user-toolbar__right {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
}
</style>
