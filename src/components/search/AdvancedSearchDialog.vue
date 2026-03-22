<template>
  <StandardDialog
    ref="dialogRef"
    :model-value="modelValue"
    size="xl"
    title="高级搜索"
    title-icon="info"
    :show-footer="true"
    :scrollable="true"
    min-height="520px"
    custom-class="advanced-search-dialog"
    @update:model-value="value => emit('update:modelValue', value)"
  >
    <div class="advanced-search-dialog__layout">
      <section class="advanced-search-dialog__hero">
        <p class="advanced-search-dialog__description">
          支持用 AND / OR / NOT 组合多层筛选条件，精确定位你需要的数据。
        </p>
        <div
          v-if="regularConditionsCount > 0"
          class="advanced-search-dialog__context"
        >
          <span class="advanced-search-dialog__context-title">
            当前还有 {{ regularConditionsCount }} 个普通条件
          </span>
          <span class="advanced-search-dialog__context-text">
            应用后会与这里的高级规则一起生效
          </span>
        </div>
      </section>

      <section v-if="validationErrors.length > 0" class="advanced-search-dialog__errors">
        <span class="advanced-search-dialog__errors-title">条件未完成，请先修正以下问题：</span>
        <ul>
          <li v-for="error in validationErrors" :key="error">{{ error }}</li>
        </ul>
      </section>

      <FilterGroupBuilder
        ref="groupBuilderRef"
        :group="draftGroup"
        :fields="fields"
        root
        @clear-root="handleClearAll"
        @update="handleGroupUpdate"
      />
      <FavoritesPanel
        :favorites="favorites"
        :collapsed="favoritesCollapsed"
        @apply="handleApplyFavorite"
        @toggle-collapse="favoritesCollapsed = !favoritesCollapsed"
      />
      <GroupSummaryBar
        :summary="groupSummary"
        :active="modelValue"
        :reset-token="summaryResetToken"
      />
    </div>

    <template #footer>
      <div class="advanced-search-dialog__footer">
        <div class="advanced-search-dialog__footer-left">
          <el-button text @click="handleSaveFavorite">保存为收藏</el-button>
        </div>
        <div class="advanced-search-dialog__footer-actions">
          <el-button @click="emit('update:modelValue', false)">取消</el-button>
          <el-button type="primary" @click="handleApply">应用搜索</el-button>
        </div>
      </div>
    </template>
  </StandardDialog>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, toRef, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FilterGroup } from '@/api/base/crud-api'
import { StandardDialog, type StandardDialogExpose } from '@/components/ui/StandardDialog'
import type { SearchCondition, SearchFavorite, SearchFieldDef, UIFilterGroup } from '@/types/search'
import {
  getFavoriteFilterGroup,
  hasMeaningfulUIFilterGroup,
  stripUIFilterGroup,
  summarizeUIFilterGroup,
} from '@/utils/advanced-search'
import FavoritesPanel from './advanced-search/FavoritesPanel.vue'
import FilterGroupBuilder from './advanced-search/FilterGroupBuilder.vue'
import GroupSummaryBar from './advanced-search/GroupSummaryBar.vue'
import { useAdvancedSearchDraft } from './advanced-search/useAdvancedSearchDraft'

interface Props {
  modelValue: boolean
  conditions: SearchCondition[]
  fields: SearchFieldDef[]
  favorites: SearchFavorite[]
  initialFilter?: FilterGroup
  draftSeed?: {
    fieldKey: string
    nonce: number
  }
}

const props = defineProps<Props>()
const dialogRef = ref<StandardDialogExpose | null>(null)
const groupBuilderRef = ref<{
  focusAddConditionButton?: () => boolean
  focusFirstCondition?: (preferIncomplete?: boolean) => boolean
  focusLastCondition?: () => boolean
} | null>(null)
const returnFocusTarget = ref<HTMLElement | null>(null)

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'apply-filter-group', value: FilterGroup | undefined): void
  (e: 'save-favorite', value: { name: string; filterGroup: FilterGroup }): void
  (e: 'apply'): void
}>()

const {
  draftGroup,
  favoritesCollapsed,
  validationErrors,
  clearDraftGroup,
  replaceDraftGroup,
  resetValidationErrors,
  validateDraftGroup
} = useAdvancedSearchDraft({
  modelValue: toRef(props, 'modelValue'),
  fields: toRef(props, 'fields'),
  initialFilter: toRef(props, 'initialFilter'),
  draftSeed: toRef(props, 'draftSeed')
})
const groupSummary = computed(() => summarizeUIFilterGroup(draftGroup.value, props.fields))
const regularConditionsCount = computed(() => props.conditions.length)
const summaryResetToken = ref(0)

function resetSummaryBar(): void {
  summaryResetToken.value += 1
}

function captureReturnFocusTarget(): void {
  if (typeof document === 'undefined') {
    return
  }

  const activeElement = document.activeElement
  returnFocusTarget.value = activeElement instanceof HTMLElement ? activeElement : null
}

function restoreReturnFocus(): void {
  const target = returnFocusTarget.value
  returnFocusTarget.value = null

  if (!target || !target.isConnected) {
    return
  }

  requestAnimationFrame(() => {
    target.focus()
  })
}

async function focusInitialTarget(): Promise<void> {
  await nextTick()

  requestAnimationFrame(() => {
    const builder = groupBuilderRef.value
    if (!builder) {
      return
    }

    const openedFromField = props.draftSeed?.nonce !== undefined

    if (openedFromField && builder.focusLastCondition?.()) {
      return
    }

    if (draftGroup.value.conditions.length === 0) {
      if (builder.focusAddConditionButton?.()) {
        return
      }
    }

    if (builder.focusFirstCondition?.(true)) {
      return
    }

    if (builder.focusAddConditionButton?.()) {
      return
    }

    const bodyElement = dialogRef.value?.getBodyElement()
    const fallbackFocusable = bodyElement?.querySelector<HTMLElement>(
      'input, textarea, select, button, [tabindex]:not([tabindex="-1"])'
    )
    fallbackFocusable?.focus()
  })
}

watch(() => props.modelValue, (isOpen, wasOpen) => {
  if (isOpen) {
    captureReturnFocusTarget()
    resetSummaryBar()
    void focusInitialTarget()
    return
  }

  if (wasOpen) {
    restoreReturnFocus()
  }
})

function handleGroupUpdate(value: UIFilterGroup) {
  replaceDraftGroup(value)
}

async function handleApplyFavorite(favoriteId: string) {
  const favorite = props.favorites.find(item => item.id === favoriteId)
  if (!favorite) {
    return
  }

  if (hasMeaningfulUIFilterGroup(draftGroup.value)) {
    try {
      await ElMessageBox.confirm(
        '应用收藏会替换当前正在编辑的筛选条件，是否继续？',
        '替换当前条件',
        {
          type: 'warning',
          confirmButtonText: '替换',
          cancelButtonText: '取消'
        }
      )
    } catch {
      return
    }
  }
  replaceDraftGroup(getFavoriteFilterGroup(favorite, props.fields))
  resetValidationErrors()
  resetSummaryBar()
  void nextTick(() => {
    groupBuilderRef.value?.focusFirstCondition?.(false)
  })
}

function handleClearAll() {
  clearDraftGroup()
  resetSummaryBar()
  void nextTick(() => {
    groupBuilderRef.value?.focusAddConditionButton?.()
  })
}

async function handleSaveFavorite() {
  if (!hasMeaningfulUIFilterGroup(draftGroup.value)) {
    ElMessage.warning('请先添加至少一个完整条件，再保存收藏。')
    return
  }

  const errors = validateDraftGroup()
  if (errors.length > 0) {
    ElMessage.warning('请先补全当前过滤条件，再保存收藏。')
    return
  }
  try {
    const { value } = await ElMessageBox.prompt('为这组高级搜索起一个名称', '保存收藏', {
      inputPlaceholder: '例如：待审且近 7 天创建',
      confirmButtonText: '保存',
      cancelButtonText: '取消'
    })
    emit('save-favorite', {
      name: value,
      filterGroup: stripUIFilterGroup(draftGroup.value)
    })
  } catch {
    // 用户取消时不需要额外处理
  }
}

function handleApply() {
  const errors = validateDraftGroup()
  if (errors.length > 0) {
    ElMessage.warning('还有未完成的条件，请先修正。')
    return
  }
  const filterGroup = stripUIFilterGroup(draftGroup.value)
  emit('apply-filter-group', filterGroup.conditions?.length ? filterGroup : undefined)
  emit('apply')
  emit('update:modelValue', false)
}
</script>

<style scoped lang="scss">
.advanced-search-dialog__layout {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.advanced-search-dialog__hero {
  padding: 8px 2px 0;
}

.advanced-search-dialog__description {
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: var(--el-text-color-secondary);
}

.advanced-search-dialog__context {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
  margin-top: 10px;
  padding: 10px 12px;
  background: color-mix(in srgb, var(--el-color-primary-light-9) 72%, var(--el-bg-color));
  border: 1px solid color-mix(in srgb, var(--el-color-primary) 18%, var(--el-border-color));
  border-radius: 14px;
}

.advanced-search-dialog__context-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--el-color-primary-dark-2);
}

.advanced-search-dialog__context-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.advanced-search-dialog__errors {
  padding: 14px 16px;
  color: var(--el-color-danger-dark-2);
  background: color-mix(in srgb, var(--el-color-danger-light-9) 90%, transparent);
  border: 1px solid color-mix(in srgb, var(--el-color-danger) 25%, var(--el-border-color));
  border-radius: 18px;

  ul {
    margin: 8px 0 0;
    padding-left: 20px;
  }
}

.advanced-search-dialog__errors-title {
  font-weight: 700;
}

.advanced-search-dialog__footer {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
}

.advanced-search-dialog__footer-left,
.advanced-search-dialog__footer-actions {
  display: flex;
  gap: 10px;
  align-items: center;
}

:deep(.advanced-search-dialog .standard-dialog__body) {
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--el-fill-color-lighter) 62%, transparent), transparent 180px),
    var(--el-bg-color-page);
}

@media (max-width: 768px) {
  .advanced-search-dialog__footer {
    flex-direction: column;
  }

  .advanced-search-dialog__footer-actions,
  .advanced-search-dialog__footer-left {
    width: 100%;
  }

  .advanced-search-dialog__footer-actions {
    justify-content: flex-end;
  }
}
</style>
