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
import AppIconButton from '@/components/ui/AppIconButton.vue'
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
  formTitle
} = controller
const { state: pageState, search, dialogs } = page
const data = pageState.data
const loading = pageState.loading
const error = pageState.error
const columnConfig = columnsManager.columnConfig
const dialogOpen = dialogs.formOpen
const dialogKey = dialogs.key
const editingId = dialogs.editingId
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
        :data="data ?? []"
        :columns="tableColumns"
        :loading="loading"
        :error="error"
        :pagination="pageState.pagination"
        :density="toolbarState.density"
        :show-selection="pageConfig.table.selectable ?? false"
        :empty-text="emptyText"
        :default-sort="tableDefaultSort"
        :column-resizable="pageConfig.table.columnResizable ?? false"
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

    <TableColumnConfigDialog
      v-if="features.columnConfig"
      v-model="columnConfigDialogOpen"
      :column-config="columnConfig"
      :default-columns="pageConfig.table.columns.defaultColumns"
      @update:config="columnsManager.updateConfig"
    />
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
