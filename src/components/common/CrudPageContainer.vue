<script
  setup
  lang="ts"
  generic="TItem extends CrudPageEntity, TCreate extends object, TUpdate extends object"
>
import type { ComponentPublicInstance } from 'vue'
import { computed, watch } from 'vue'
import type { FilterGroup } from '@/api/base/crud-api'
import CrudFormDialog from '@/components/common/CrudFormDialog.vue'
import CrudTable from '@/components/common/CrudTable.vue'
import CrudToolbar from '@/components/common/CrudToolbar.vue'
import TableColumnConfigDialog from '@/components/common/TableColumnConfigDialog.vue'
import AdvancedSearchDialog from '@/components/search/AdvancedSearchDialog.vue'
import CrudDetailPanel from '@/components/common/crud-page/detail/CrudDetailPanel.vue'
import AppIconButton from '@/components/ui/AppIconButton.vue'
import MoveDialog from '@/components/common/MoveDialog.vue'
import SortDialog from '@/components/common/SortDialog.vue'
import { ElMessage } from 'element-plus'
import { useSearchFavorites } from '@/composables/useSearchFavorites'
import { DENSITY_CONFIG, type TableDensity } from '@/types/table'
import { provideBreakpointContext } from '@/composables/useBreakpointContext'
import { useCrudPageController } from '@/components/common/crud-page/useCrudPageController'
import type { CrudPageConfig, CrudPageEntity } from '@/components/common/crud-page/types'

interface CrudPageContainerProps {
  config: CrudPageConfig<TItem, TCreate, TUpdate>
  gap?: number
  fitViewport?: boolean
}

const props = withDefaults(defineProps<CrudPageContainerProps>(), {
  gap: 16,
  fitViewport: true
})

// 声明已知插槽类型
defineSlots<{
  'extra-dialogs'?: (props: Record<string, never>) => unknown
}>()

provideBreakpointContext()

const controller = useCrudPageController(props.config)
const {
  config: pageConfig,
  features,
  state: page,
  tableRef,
  title,
  modeSwitcher,
  showSearch,
  emptyText,
  toolbarActions,
  toolbarState,
  tableColumns,
  tableDefaultSort,
  columnConfigDialogOpen,
  columnsManager,
  formTitle,
  detailState,
  tree: treeState,
  moveDialog,
  handleMoveConfirm,
  handleMoveCancel,
  sortDialog,
  handleSortConfirm,
  handleSortCancel
} = controller

const { state: pageState, search, dialogs } = page
const data = pageState.data
const loading = pageState.loading
const error = pageState.error
const columnConfig = columnsManager.columnConfig
const dialogOpen = dialogs.formOpen
const dialogKey = dialogs.key
const editingId = dialogs.editingId
const hasDetailConfig = computed(() => !!pageConfig.detail)
const detailFetcher = pageConfig.resource.api.getById.bind(pageConfig.resource.api)

// 树形模式配置（需要放在 tableData 之前）
const isTreeMode = computed(() => !!pageConfig.resource.treeMode?.enabled)

// 树形模式：表格数据源选择逻辑
// - 有搜索条件（isSearchMode=true）：使用 query 接口的平铺数据（data）
// - 无搜索条件：使用 tree 接口的树形数据（treeData）
const tableData = computed(() => {
  if (isTreeMode.value) {
    // 搜索模式下使用 query 接口的平铺数据
    if (treeState?.isSearchMode?.value) {
      return data.value ?? []
    }
    // 树形模式使用 treeData
    if (treeState?.treeData) {
      return treeState.treeData.value ?? []
    }
  }
  return data.value ?? []
})
const treeModeConfig = computed(() => {
  if (!isTreeMode.value || !treeState) return undefined
  const config = pageConfig.resource.treeMode!
  return {
    treeProps: {
      children: config.childrenKey ?? 'children',
      hasChildren: config.hasChildrenKey ?? 'has_children'
    },
    rowKey: 'id',
    lazy: config.lazyLoad ?? true,
    load: treeState.loadChildren,
    defaultExpandRowKeys: Array.from(treeState.expandedKeys.value) as (string | number)[]
  }
})

const cachedData = computed(() => {
  if (!editingId.value) {
    return undefined
  }

  return pageState.getCachedData(editingId.value) as Record<string, unknown> | undefined
})
const { favorites: searchFavorites, saveFavorite } = useSearchFavorites({
  resourceKey: pageConfig.resource.key,
  initialFavorites: pageConfig.search.favorites ?? [],
  fields: pageConfig.search.fields
})

watch(
  searchFavorites,
  favorites => {
    search.instance.setFavorites(favorites)
  },
  { immediate: true }
)

function handleDensityChange(density: string | number | object) {
  controller.setDensity(density as TableDensity)
}

function setTableRef(instance: Element | ComponentPublicInstance | null) {
  tableRef.value = instance as InstanceType<typeof CrudTable> | null
}

function handleApplyAdvancedFilter(filterGroup: FilterGroup | undefined) {
  search.instance.setAdvancedFilterGroup(filterGroup)
}

function handleSaveSearchFavorite(payload: { name: string; filterGroup: FilterGroup }) {
  const result = saveFavorite(payload)
  if (!result.ok && result.reason === 'empty-name') {
    ElMessage.warning('收藏名称不能为空')
    return
  }

  if (!result.ok && result.reason === 'duplicate') {
    ElMessage.warning('已存在同名收藏，请更换名称')
    return
  }

  if (!result.ok && result.reason === 'invalid-filter') {
    ElMessage.warning('当前条件无效或为空，无法保存为收藏')
    return
  }

  if (result.ok) {
    ElMessage.success('已保存到收藏')
  }
}

function handleCloseDetailPanel(): void {
  detailState.closeDetail()
}

async function handleRefreshDetailPanel(): Promise<void> {
  await detailState.refreshDetail(detailFetcher)
}
</script>

<template>
  <div
    class="crud-page-container"
    :class="{
      'crud-page-container--fit-viewport': props.fitViewport,
      'crud-page-container--fullscreen': toolbarState.isFullscreen
    }"
  >
    <div
      class="crud-page-container__toolbar"
      :style="{ marginBottom: `${gap}px` }"
    >
      <CrudToolbar
        :smart-search="search.instance"
        :search-fields="pageConfig.search.fields"
        :favorites="searchFavorites"
        :quick-presets="pageConfig.search.quickPresets ?? []"
        :toolbar-state="toolbarState"
        :actions="toolbarActions"
        :title="title"
        :mode-switcher="modeSwitcher"
        :search-placeholder="pageConfig.search.placeholder ?? '搜索...'"
        :show-search="showSearch"
        @refresh="search.handleRefresh"
        @batch-delete="controller.handleBatchDelete"
        @cancel-selection="controller.handleCancelSelection"
        @search="controller.handleSearch"
        @toggle-fullscreen="controller.toggleFullscreen"
        @change-density="controller.setDensity"
        @open-column-config="controller.openColumnConfig"
        @change-mode="controller.handleViewModeChange"
      >
        <template #controls>
          <AppIconButton
            v-if="features.refresh"
            icon="ep:refresh"
            size="small"
            :loading="toolbarState.loading"
            tooltip="刷新数据"
            @click="search.handleRefresh"
          />

          <AppIconButton
            v-if="features.fullscreen"
            :icon="toolbarState.isFullscreen ? 'ep:scale-to-original' : 'ep:full-screen'"
            size="small"
            :tooltip="toolbarState.isFullscreen ? '退出全屏' : '全屏显示'"
            @click="controller.toggleFullscreen"
          />

          <el-dropdown
            v-if="features.density"
            trigger="click"
            @command="handleDensityChange"
          >
            <AppIconButton
              icon="ep:grid"
              size="small"
              tooltip="调整行高"
            />
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="(densityOption, key) in DENSITY_CONFIG"
                  :key="key"
                  :command="key"
                  :class="{ 'is-active': toolbarState.density === key }"
                >
                  {{ densityOption.label }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>

          <AppIconButton
            v-if="features.columnConfig"
            icon="ep:setting"
            size="small"
            tooltip="配置显示列"
            @click="controller.openColumnConfig"
          />
        </template>
      </CrudToolbar>
    </div>

    <div class="crud-page-container__table">
      <CrudTable
        :ref="setTableRef"
        :data="tableData ?? []"
        :columns="tableColumns"
        :loading="loading"
        :error="error"
        :pagination="pageState.pagination"
        :density="toolbarState.density"
        :show-selection="pageConfig.table.selectable ?? false"
        :empty-text="emptyText"
        :default-sort="tableDefaultSort"
        :column-resizable="pageConfig.table.columnResizable ?? false"
        v-bind="treeModeConfig"
        @selection-change="controller.handleSelectionChange"
        @page-change="controller.handlePageChange"
        @size-change="controller.handleSizeChange"
        @sort-change="search.handleSortChange"
        @column-resize="controller.handleColumnResize"
        @retry="search.handleRefresh"
      />
    </div>

    <CrudFormDialog
      v-if="pageConfig.form && dialogOpen"
      :key="dialogKey"
      :open="dialogOpen"
      :edit-id="editingId"
      :cached-data="cachedData"
      :load-data="controller.loadFormData"
      :schema="pageConfig.form.createSchema"
      :update-schema="pageConfig.form.updateSchema"
      :field-config="pageConfig.form.fieldConfig"
      :title="formTitle"
      :width="pageConfig.form.width"
      @update:open="dialogs.close"
      @submit="controller.handleSubmit"
    />

    <AdvancedSearchDialog
      v-model="search.instance.state.value.advancedDialogOpen"
      :conditions="search.instance.conditions.value"
      :fields="pageConfig.search.fields"
      :favorites="searchFavorites"
      :initial-filter="search.instance.advancedFilterGroup.value"
      :draft-seed="search.instance.state.value.advancedDialogDraftSeed"
      @apply-filter-group="handleApplyAdvancedFilter"
      @save-favorite="handleSaveSearchFavorite"
    />

    <!-- 移动对话框 -->
    <MoveDialog
      v-if="features.move?.enabled"
      v-model="moveDialog.open"
      :moving-id="moveDialog.movingId"
      :tree-data="treeState?.treeData?.value ?? []"
      :loading="moveDialog.loading"
      @confirm="handleMoveConfirm"
      @cancel="handleMoveCancel"
    />

    <!-- 排序对话框 -->
    <SortDialog
      v-if="features.sort?.enabled"
      v-model="sortDialog.open"
      :tree-data="treeState?.treeData?.value ?? []"
      :loading="sortDialog.loading"
      @confirm="handleSortConfirm"
      @cancel="handleSortCancel"
    />

    <TableColumnConfigDialog
      v-if="features.columnConfig"
      v-model="columnConfigDialogOpen"
      :column-config="columnConfig"
      :default-columns="pageConfig.table.columns.defaultColumns"
      @update:config="columnsManager.updateConfig"
    />

    <!-- 详情面板 -->
    <CrudDetailPanel
      v-if="hasDetailConfig"
      :config="pageConfig.detail"
      :fetcher="detailFetcher"
      :open="detailState.open.value"
      :item="detailState.item.value"
      :loading="detailState.loading.value"
      :error="detailState.error.value"
      @update:open="detailState.open.value = $event"
      @close="handleCloseDetailPanel"
      @refresh="handleRefreshDetailPanel"
    />

    <!-- 额外对话框插槽：用于放置自定义对话框，可访问 provide 的 refresh 函数 -->
    <slot name="extra-dialogs" />
  </div>
</template>

<style scoped>
.crud-page-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
}

.crud-page-container--fit-viewport {
  height: calc(100vh - var(--layout-header-height) - var(--layout-page-padding) * 2);
}

.crud-page-container--fullscreen {
  position: fixed;
  inset: 0;
  z-index: 1100;
  height: 100vh;
  background: var(--el-bg-color-page);
}

.crud-page-container__toolbar {
  flex-shrink: 0;
}

.crud-page-container__table {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

@media (width < 768px) {
  .crud-page-container {
    padding: 8px;
  }
}

@media (width >= 1280px) {
  .crud-page-container {
    padding: 16px;
  }
}
</style>
