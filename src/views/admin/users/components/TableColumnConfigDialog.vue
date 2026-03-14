<!--
  列配置对话框

  功能：
  - 拖拽调整列顺序（全局顺序）
  - 配置各列在哪些设备端显示
  - 恢复默认配置
  - 持久化到 localStorage（通过 useUserTableColumns composable）
-->
<template>
  <el-dialog
    v-model="visible"
    title="配置显示列"
    width="640px"
    :close-on-click-modal="false"
  >
    <div class="column-config">
      <p class="column-config__hint">
        拖拽调整全局列顺序。设备显示按层级继承：勾选移动设备将自动包含平板和 PC。
      </p>

      <div class="column-config__header">
        <span class="column-config__header-label">列名</span>
        <span>PC 端</span>
        <span>平板</span>
        <span>移动设备</span>
      </div>

      <div class="column-config__list">
        <div
          v-for="(col, index) in localConfig"
          :key="col.key"
          class="column-config__item"
          :class="{
            'is-locked': col.reorderLocked,
            'is-dragging': dragIndex === index,
            'is-drop-before':
              dragOverIndex === index && dragOverIndex !== dragIndex && dragOverPosition === 'before',
            'is-drop-after':
              dragOverIndex === index && dragOverIndex !== dragIndex && dragOverPosition === 'after'
          }"
          :draggable="!col.reorderLocked"
          @dragstart="handleDragStart(index)"
          @dragover.prevent="event => handleDragOver(index, event)"
          @drop.prevent="handleDrop"
          @dragend="handleDragEnd"
        >
          <div class="column-config__column-label">
            <el-icon class="column-config__drag-handle">
              <Rank />
            </el-icon>
            <span>{{ col.label }}</span>
            <el-tag
              v-if="col.fixed"
              size="small"
              type="info"
              effect="plain"
            >
              固定{{ col.fixed === 'left' ? '左侧' : '右侧' }}
            </el-tag>
          </div>

          <el-checkbox
            :model-value="isChecked(col, 'desktop')"
            :disabled="col.hideable === false"
            @change="value => handleVisibilityChange(col, 'desktop', Boolean(value))"
          />
          <el-checkbox
            :model-value="isChecked(col, 'tablet')"
            :disabled="col.hideable === false"
            @change="value => handleVisibilityChange(col, 'tablet', Boolean(value))"
          />
          <el-checkbox
            :model-value="isChecked(col, 'mobile')"
            :disabled="col.hideable === false"
            @change="value => handleVisibilityChange(col, 'mobile', Boolean(value))"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <div class="column-config__footer">
        <el-button
          text
          @click="handleReset"
        >
          恢复默认
        </el-button>
        <div>
          <el-button @click="visible = false">取消</el-button>
          <el-button
            type="primary"
            @click="handleConfirm"
          >
            确定
          </el-button>
        </div>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Rank } from '@element-plus/icons-vue'
import {
  useUserTableColumns,
  DEFAULT_COLUMN_CONFIG,
  type ColumnBreakpoint,
  type ColumnConfig
} from '../composables/useUserTableColumns'

// ==================== 对话框状态 ====================

const visible = defineModel<boolean>({ default: false })

const { columnConfig, updateConfig } = useUserTableColumns()

// 本地副本，确认后才写入
const localConfig = ref<ColumnConfig[]>([])

// 打开对话框时同步最新配置
watch(visible, value => {
  if (value) {
    localConfig.value = columnConfig.value.map(column => ({ ...column }))
  }
})

// ==================== 拖拽排序 ====================

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)
const dragOverPosition = ref<'before' | 'after' | null>(null)

function handleDragStart(index: number) {
  if (localConfig.value[index]?.reorderLocked) {
    return
  }

  dragIndex.value = index
}

function handleDragOver(index: number, event: DragEvent) {
  if (localConfig.value[index]?.reorderLocked) {
    return
  }

  dragOverIndex.value = index
  const currentTarget = event.currentTarget as HTMLElement | null
  if (!currentTarget) {
    dragOverPosition.value = 'after'
    return
  }

  const rect = currentTarget.getBoundingClientRect()
  const offsetY = event.clientY - rect.top
  dragOverPosition.value = offsetY < rect.height / 2 ? 'before' : 'after'
}

function handleDrop() {
  if (dragIndex.value === null || dragOverIndex.value === null) return
  if (dragIndex.value === dragOverIndex.value) return
  if (localConfig.value[dragIndex.value]?.reorderLocked) return
  if (localConfig.value[dragOverIndex.value]?.reorderLocked) return

  const items = [...localConfig.value]
  const movableIndices = items
    .map((column, index) => (column.reorderLocked ? null : index))
    .filter((index): index is number => index !== null)

  const dragMovableIndex = movableIndices.indexOf(dragIndex.value)
  const dropMovableIndex = movableIndices.indexOf(dragOverIndex.value)
  if (dragMovableIndex === -1 || dropMovableIndex === -1) return

  const movableItems = movableIndices.map(index => items[index])
  const [moved] = movableItems.splice(dragMovableIndex, 1)
  let insertionIndex = dropMovableIndex + (dragOverPosition.value === 'after' ? 1 : 0)
  if (dragMovableIndex < insertionIndex) {
    insertionIndex -= 1
  }
  insertionIndex = Math.max(0, Math.min(insertionIndex, movableItems.length))
  movableItems.splice(insertionIndex, 0, moved)

  const nextConfig = [...items]
  let movableCursor = 0
  for (let index = 0; index < nextConfig.length; index += 1) {
    if (nextConfig[index].reorderLocked) {
      continue
    }

    nextConfig[index] = movableItems[movableCursor]
    movableCursor += 1
  }

  localConfig.value = nextConfig
}

function handleDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
  dragOverPosition.value = null
}

// ==================== 可见性矩阵 ====================

function isChecked(column: ColumnConfig, breakpoint: ColumnBreakpoint): boolean {
  switch (breakpoint) {
    case 'desktop':
      return column.visibleFrom !== null
    case 'tablet':
      return column.visibleFrom === 'tablet' || column.visibleFrom === 'mobile'
    case 'mobile':
      return column.visibleFrom === 'mobile'
  }
}

function handleVisibilityChange(
  column: ColumnConfig,
  breakpoint: ColumnBreakpoint,
  checked: boolean
) {
  if (column.hideable === false) {
    return
  }

  if (checked) {
    if (breakpoint === 'mobile') {
      column.visibleFrom = 'mobile'
      return
    }

    if (breakpoint === 'tablet') {
      column.visibleFrom = column.visibleFrom === 'mobile' ? 'mobile' : 'tablet'
      return
    }

    column.visibleFrom = column.visibleFrom ?? 'desktop'
    return
  }

  if (breakpoint === 'desktop') {
    column.visibleFrom = null
    return
  }

  if (breakpoint === 'tablet') {
    column.visibleFrom = 'desktop'
    return
  }

  column.visibleFrom = 'tablet'
}

// ==================== 操作 ====================

function handleConfirm() {
  updateConfig(localConfig.value)
  visible.value = false
}

function handleReset() {
  localConfig.value = DEFAULT_COLUMN_CONFIG.map(column => ({ ...column }))
}
</script>

<style scoped>
.column-config__hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.column-config__header,
.column-config__item {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 72px 72px 96px;
  align-items: center;
  column-gap: 8px;
}

.column-config__header {
  padding: 0 12px 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.column-config__header-label {
  padding-left: 28px;
}

.column-config__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.column-config__item {
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: grab;
  transition:
    background-color 0.15s,
    border-color 0.15s;
  user-select: none;
}

.column-config__item:hover {
  background-color: var(--el-fill-color-light);
}

.column-config__item.is-locked {
  cursor: default;
}

.column-config__item.is-locked .column-config__drag-handle {
  cursor: not-allowed;
  opacity: 0.45;
}

.column-config__item :deep(.el-checkbox.is-disabled) {
  opacity: 0.75;
}

.column-config__item.is-dragging {
  opacity: 0.4;
}

.column-config__item.is-drop-before,
.column-config__item.is-drop-after {
  position: relative;
  background-color: var(--el-fill-color-light);
}

.column-config__item.is-drop-before::before,
.column-config__item.is-drop-after::after {
  content: '';
  position: absolute;
  left: 16px;
  right: 16px;
  height: 2px;
  background-color: var(--el-color-primary);
  border-radius: 999px;
  box-shadow: 0 0 0 2px var(--el-bg-color);
}

.column-config__item.is-drop-before::before {
  top: -3px;
}

.column-config__item.is-drop-after::after {
  bottom: -3px;
}

.column-config__column-label {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.column-config__drag-handle {
  color: var(--el-text-color-placeholder);
  cursor: grab;
  flex-shrink: 0;
}

.column-config__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

@media (width <= 767px) {
  .column-config__header,
  .column-config__item {
    grid-template-columns: minmax(0, 1fr) 56px 56px 72px;
  }
}
</style>
