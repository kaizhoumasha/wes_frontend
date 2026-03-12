<!--
  列配置对话框

  功能：
  - 显示/隐藏列（复选框）
  - 拖拽调整列顺序（HTML5 Drag and Drop）
  - 恢复默认配置
  - 持久化到 localStorage（通过 useUserTableColumns composable）
-->
<template>
  <el-dialog
    v-model="visible"
    title="配置显示列"
    width="360px"
    :close-on-click-modal="false"
  >
    <div class="column-config">
      <p class="column-config__hint">拖拽调整列顺序，勾选控制显示/隐藏</p>

      <div class="column-config__list">
        <div
          v-for="(col, index) in localConfig"
          :key="col.key"
          class="column-config__item"
          :class="{
            'is-dragging': dragIndex === index,
            'is-drag-over': dragOverIndex === index && dragOverIndex !== dragIndex
          }"
          draggable="true"
          @dragstart="handleDragStart(index)"
          @dragover.prevent="handleDragOver(index)"
          @drop.prevent="handleDrop"
          @dragend="handleDragEnd"
        >
          <el-icon class="column-config__drag-handle">
            <Rank />
          </el-icon>
          <el-checkbox v-model="col.visible">
            {{ col.label }}
          </el-checkbox>
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
  type ColumnConfig
} from '../composables/useUserTableColumns'

// ==================== 对话框状态 ====================

const visible = defineModel<boolean>({ default: false })

const { columnConfig, updateConfig } = useUserTableColumns()

// 本地副本，确认后才写入
const localConfig = ref<ColumnConfig[]>([])

// 打开对话框时同步最新配置
watch(visible, val => {
  if (val) {
    localConfig.value = columnConfig.value.map(c => ({ ...c }))
  }
})

// ==================== 拖拽排序 ====================

const dragIndex = ref<number | null>(null)
const dragOverIndex = ref<number | null>(null)

function handleDragStart(index: number) {
  dragIndex.value = index
}

function handleDragOver(index: number) {
  dragOverIndex.value = index
}

function handleDrop() {
  if (dragIndex.value === null || dragOverIndex.value === null) return
  if (dragIndex.value === dragOverIndex.value) return

  const items = [...localConfig.value]
  const [moved] = items.splice(dragIndex.value, 1)
  items.splice(dragOverIndex.value, 0, moved)
  localConfig.value = items
}

function handleDragEnd() {
  dragIndex.value = null
  dragOverIndex.value = null
}

// ==================== 操作 ====================

function handleConfirm() {
  updateConfig(localConfig.value)
  visible.value = false
}

function handleReset() {
  localConfig.value = DEFAULT_COLUMN_CONFIG.map(c => ({ ...c }))
}
</script>

<style scoped>
.column-config__hint {
  margin: 0 0 12px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.column-config__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.column-config__item {
  display: flex;
  align-items: center;
  gap: 8px;
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

.column-config__item.is-dragging {
  opacity: 0.4;
}

.column-config__item.is-drag-over {
  border-color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
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
</style>
