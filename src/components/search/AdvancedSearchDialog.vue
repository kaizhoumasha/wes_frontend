<!--
高级搜索弹窗组件

提供完整的条件编辑、收藏夹应用、批量清空等功能。
维护本地草稿态，只在点击"应用"时才提交有效条件到全局状态。
-->
<template>
  <el-dialog
    :model-value="modelValue"
    title="高级搜索"
    width="800px"
    :close-on-click-modal="false"
    @update:model-value="handleClose"
  >
    <div class="advanced-search-dialog">
      <!-- 左侧：条件列表 -->
      <div class="advanced-search-dialog__conditions">
        <div class="advanced-search-dialog__conditions-header">
          <h4>编辑条件 ({{ localDrafts.length }})</h4>
          <el-button
            v-if="localDrafts.length > 0"
            type="danger"
            text
            size="small"
            @click="handleClearAll"
          >
            清空全部
          </el-button>
        </div>

        <el-scrollbar class="advanced-search-dialog__conditions-list">
          <div
            v-for="(draft, index) in localDrafts"
            :key="draft.id"
            class="advanced-search-dialog__condition-item"
            :class="{ 'advanced-search-dialog__condition-item--active': editingIndex === index }"
            @click="handleEditDraft(index)"
          >
            <el-tag>{{ draft.label || '未完成条件' }}</el-tag>
            <el-button
              type="danger"
              text
              size="small"
              @click.stop="handleRemoveDraft(draft.id)"
            >
              <el-icon><Close /></el-icon>
            </el-button>
          </div>

          <el-empty
            v-if="localDrafts.length === 0"
            description="暂无条件"
            :image-size="60"
          />
        </el-scrollbar>

        <el-button
          class="advanced-search-dialog__add-btn"
          @click="handleAddDraft"
        >
          <el-icon><Plus /></el-icon>
          添加条件
        </el-button>
      </div>

      <!-- 右侧：编辑区 -->
      <div class="advanced-search-dialog__editor">
        <!-- 条件编辑器 -->
        <div
          v-if="editingDraft"
          class="advanced-search-dialog__condition-editor"
        >
          <div class="advanced-search-dialog__editor-header">
            <h4>编辑条件</h4>
          </div>

          <ConditionEditorRow
            :condition="editingDraft"
            :fields="fields"
            @update="handleUpdateDraft"
            @remove="handleRemoveEditingDraft"
          />
        </div>

        <!-- 收藏夹区 -->
        <div class="advanced-search-dialog__favorites">
          <FavoriteList
            :favorites="favorites"
            variant="dialog"
            title="收藏夹"
            @apply-favorite="handleApplyFavorite"
          />
        </div>
      </div>
    </div>

    <template #footer>
      <span class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button
          type="primary"
          @click="handleApply"
        >
          应用搜索
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import { Close, Plus } from '@element-plus/icons-vue'

import type {
  SearchCondition,
  SearchConditionDraft,
  SearchFavorite,
  SearchFieldDef
} from '@/types/search'
import { generateConditionId, buildConditionLabel } from '@/utils/search-compiler'
import { validateConditionDraft } from '@/types/search'
import ConditionEditorRow from './ConditionEditorRow.vue'
import FavoriteList from './FavoriteList.vue'

// ==================== 类型定义 ====================

interface Props {
  /** 是否显示弹窗 */
  modelValue: boolean
  /** 条件列表（全局状态） */
  conditions: SearchCondition[]
  /** 字段列表 */
  fields: SearchFieldDef[]
  /** 收藏夹列表 */
  favorites: SearchFavorite[]
  /** 外部请求预填的字段种子 */
  draftSeed?: {
    fieldKey: string
    nonce: number
  }
}

interface Emits {
  /** 更新显示状态 */
  (e: 'update:modelValue', value: boolean): void
  /** 批量替换有效条件 */
  (e: 'replace-conditions', drafts: SearchConditionDraft[]): void
  /** 应用搜索 */
  (e: 'apply'): void
}

// ==================== Props & Emits ====================

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// ==================== 本地草稿态 ====================

/**
 * 本地草稿条件列表（UI 草稿态，与全局状态隔离）
 * 草稿可以是不完整的（value = undefined），只在应用时才校验
 */
const localDrafts = ref<(SearchConditionDraft & { id: string; label?: string })[]>([])

/**
 * 编辑中的草稿索引
 */
const editingIndex = ref<number | undefined>(undefined)

// ==================== 监听全局条件变化 ====================

watch(
  () => props.conditions,
  newConditions => {
    // 当全局条件变化时，同步到本地草稿（保持一致性）
    localDrafts.value = newConditions.map(c => ({
      id: c.id,
      field: c.field,
      operator: c.operator,
      value: c.value,
      label: c.label
    }))
  },
  { immediate: true }
)

// ==================== 计算属性 ====================

/**
 * 当前正在编辑的草稿（转换为 SearchCondition 格式用于编辑器）
 */
const editingDraft = computed(() => {
  if (editingIndex.value === undefined) return undefined
  const draft = localDrafts.value[editingIndex.value]
  if (!draft) return undefined

  // 转换为 SearchCondition 格式（编辑器需要）
  return {
    id: draft.id,
    field: draft.field,
    operator: draft.operator,
    value: draft.value,
    label: draft.label || '未完成条件'
  }
})

function appendDraftForField(fieldKey: string) {
  const field = props.fields.find((candidate) => candidate.key === fieldKey)
  if (!field) {
    return
  }

  localDrafts.value.push({
    id: generateConditionId(),
    field: field.key,
    operator: field.defaultOperator || 'equals',
    value: undefined,
    label: undefined
  })
  editingIndex.value = localDrafts.value.length - 1
}

watch(
  () => [props.modelValue, props.draftSeed?.nonce, props.draftSeed?.fieldKey] as const,
  (currentValue, previousValue = [false, undefined, undefined] as const) => {
    const [isOpen, nonce, fieldKey] = currentValue
    const [previousOpen, previousNonce] = previousValue

    if (!isOpen || !fieldKey || nonce === undefined) {
      return
    }

    if (previousOpen === isOpen && previousNonce === nonce) {
      return
    }

    appendDraftForField(fieldKey)
  },
  { immediate: true }
)

// ==================== 事件处理 ====================

function handleClose() {
  emit('update:modelValue', false)
  editingIndex.value = undefined
  // 关闭时不清空本地草稿，允许用户重新打开继续编辑
}

function handleEditDraft(index: number) {
  editingIndex.value = index
}

function handleAddDraft() {
  const defaultField = props.fields[0]
  if (!defaultField) return

  appendDraftForField(defaultField.key)
}

function handleUpdateDraft(condition: SearchCondition) {
  if (editingIndex.value === undefined) return

  const draft: SearchConditionDraft & { id: string; label?: string } = {
    id: condition.id,
    field: condition.field,
    operator: condition.operator,
    value: condition.value
  }

  // 更新本地草稿
  localDrafts.value[editingIndex.value] = {
    ...draft,
    label: buildConditionLabel(draft, props.fields)
  }
}

function handleRemoveDraft(id: string) {
  const index = localDrafts.value.findIndex(d => d.id === id)
  if (index !== -1) {
    localDrafts.value.splice(index, 1)
    if (editingIndex.value === index) {
      editingIndex.value = undefined
    }
  }
}

function handleRemoveEditingDraft() {
  if (editingDraft.value) {
    handleRemoveDraft(editingDraft.value.id)
  }
}

function handleClearAll() {
  localDrafts.value = []
  editingIndex.value = undefined
}

function handleApplyFavorite(favoriteId: string) {
  const favorite = props.favorites.find(f => f.id === favoriteId)
  if (!favorite) return

  // 将收藏夹的条件添加到本地草稿
  favorite.conditions.forEach(condition => {
    const newDraft: SearchConditionDraft & { id: string; label?: string } = {
      id: generateConditionId(),
      field: condition.field,
      operator: condition.operator,
      value: condition.value,
      label: buildConditionLabel(condition, props.fields)
    }
    localDrafts.value.push(newDraft)
  })
}

function handleApply() {
  // 只在点击"应用"时才提交有效条件到全局状态
  const validDrafts = localDrafts.value.filter(draft => {
    return validateConditionDraft(draft, props.fields, { context: '[AdvancedSearchDialog]' })
  })

  emit(
    'replace-conditions',
    validDrafts.map(d => ({
      field: d.field,
      operator: d.operator,
      value: d.value
    }))
  )

  emit('apply')
  handleClose()
}
</script>

<style scoped lang="scss">
.advanced-search-dialog {
  display: flex;
  gap: 16px;
  height: 400px;

  &__conditions {
    flex: 1;
    display: flex;
    flex-direction: column;
    border-right: 1px solid var(--el-border-color-lighter);
    padding-right: 16px;
  }

  &__conditions-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;

    h4 {
      margin: 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  &__conditions-list {
    flex: 1;
    padding: 8px 0;
  }

  &__condition-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px;
    margin-bottom: 8px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
    }

    &--active {
      border-color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }
  }

  &__add-btn {
    margin-top: 12px;
    width: 100%;
  }

  &__editor {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  &__condition-editor {
    padding: 16px;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    background-color: var(--el-fill-color-blank);
  }

  &__editor-header {
    h4 {
      margin: 0 0 12px 0;
      font-size: 14px;
      font-weight: 600;
    }
  }

  &__favorites {
    flex: 1;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 4px;
    overflow: hidden;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
