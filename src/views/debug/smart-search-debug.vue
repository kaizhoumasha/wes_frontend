<!--
智能搜索调试页面

用于独立测试和验证智能搜索功能。
-->
<template>
  <div class="smart-search-debug">
    <div class="smart-search-debug__header">
      <h1>智能搜索调试页面</h1>
      <p class="subtitle">独立测试智能搜索能力，不依赖具体业务模块</p>
    </div>

    <!-- 搜索区域 -->
    <el-card class="smart-search-debug__search-section">
      <SmartSearchBar
        :conditions="smartSearch.conditions.value"
        :keyword="smartSearch.state.value.keyword"
        :active-field="smartSearch.state.value.activeField"
        :fields="debugFields"
        :favorites="debugFavorites"
        :quick-presets="debugQuickPresets"
        :loading="loading"
        :popover-open="smartSearch.state.value.popoverOpen"
        @update:keyword="smartSearch.setKeyword"
        @remove-condition="handleRemoveCondition"
        @open-popover="smartSearch.openPopover"
        @close-popover="smartSearch.closePopover"
        @open-advanced="smartSearch.openAdvancedDialog"
        @clear="handleClear"
        @select-field="smartSearch.setActiveField"
        @toggle-popover="smartSearch.togglePopover"
        @apply-preset="handleApplyPreset"
        @apply-favorite="smartSearch.applyFavorite"
        @activate-field="handleActivateField"
        @open-advanced-for-field="handleOpenAdvancedForField"
        @keydown-next="smartSearch.getNextActiveField('next')"
        @keydown-prev="smartSearch.getNextActiveField('prev')"
        @keydown-enter="handleKeydownEnter"
        @search="handleApply"
      />
    </el-card>

    <!-- 编译结果展示 -->
    <el-card class="smart-search-debug__output-section">
      <template #header>
        <span>编译结果</span>
        <el-tag
          v-if="hasConditions"
          type="success"
        >
          有效
        </el-tag>
        <el-tag
          v-else
          type="info"
        >
          空
        </el-tag>
      </template>

      <el-descriptions
        :column="1"
        border
      >
        <el-descriptions-item label="条件数量">
          {{ smartSearch.conditions.value.length }}
        </el-descriptions-item>
        <el-descriptions-item label="FilterGroup">
          <pre class="filter-group-output">{{ JSON.stringify(filterGroup, null, 2) }}</pre>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>

    <!-- 条件列表 -->
    <el-card class="smart-search-debug__conditions-section">
      <template #header>
        <span>条件列表</span>
        <el-button
          size="small"
          @click="handleClear"
        >
          清空
        </el-button>
      </template>

      <el-table
        :data="smartSearch.conditions.value"
        stripe
      >
        <el-table-column
          prop="id"
          label="ID"
          width="180"
        />
        <el-table-column
          prop="field"
          label="字段"
          width="120"
        />
        <el-table-column
          prop="operator"
          label="操作符"
          width="100"
        />
        <el-table-column
          prop="value"
          label="值"
          width="100"
        />
        <el-table-column
          prop="label"
          label="显示标签"
        />
        <el-table-column
          prop="source"
          label="来源"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              v-if="row.source === 'manual'"
              type="info"
            >
              手动
            </el-tag>
            <el-tag
              v-else-if="row.source === 'quick'"
              type="success"
            >
              快捷
            </el-tag>
            <el-tag
              v-else-if="row.source === 'favorite'"
              type="warning"
            >
              收藏
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column
          label="操作"
          width="100"
        >
          <template #default="{ row }">
            <el-button
              type="danger"
              text
              @click="smartSearch.removeCondition(row.id)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 操作日志 -->
    <el-card class="smart-search-debug__log-section">
      <template #header>
        <span>操作日志</span>
        <el-button
          size="small"
          @click="clearLogs"
        >
          清空日志
        </el-button>
      </template>

      <div class="log-list">
        <div
          v-for="(log, index) in logs"
          :key="index"
          class="log-item"
        >
          <span class="log-time">{{ log.time }}</span>
          <span :class="`log-type log-type--${log.type}`">{{ log.type }}</span>
          <span class="log-message">{{ log.message }}</span>
        </div>
        <el-empty
          v-if="logs.length === 0"
          description="暂无操作记录"
          :image-size="60"
        />
      </div>
    </el-card>

    <!-- 高级搜索弹窗 -->
    <AdvancedSearchDialog
      v-model="smartSearch.state.value.advancedDialogOpen"
      :conditions="smartSearch.conditions.value"
      :fields="debugFields"
      :favorites="debugFavorites"
      :draft-seed="advancedDialogDraftSeed"
      @replace-conditions="handleReplaceConditions"
      @apply="handleApply"
    />

    <!-- 测试数据展示 -->
    <el-card class="smart-search-debug__data-section">
      <template #header>
        <span>测试数据</span>
      </template>

      <el-tabs
        v-model="activeTab"
        type="border-card"
      >
        <el-tab-pane
          label="字段定义"
          name="fields"
        >
          <el-table
            :data="debugFields"
            stripe
          >
            <el-table-column
              prop="key"
              label="字段键"
              width="120"
            />
            <el-table-column
              prop="label"
              label="显示名称"
              width="120"
            />
            <el-table-column
              prop="dataType"
              label="数据类型"
              width="100"
            />
            <el-table-column
              prop="defaultOperator"
              label="默认操作符"
              width="100"
            />
            <el-table-column
              label="快速操作符"
              width="200"
            >
              <template #default="{ row }">
                <el-tag
                  v-for="op in row.quickOps"
                  :key="op"
                  size="small"
                >
                  {{ op }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane
          label="快速预设"
          name="presets"
        >
          <el-table
            :data="debugQuickPresets"
            stripe
          >
            <el-table-column
              prop="id"
              label="ID"
              width="120"
            />
            <el-table-column
              prop="label"
              label="名称"
            />
            <el-table-column
              prop="description"
              label="描述"
            />
            <el-table-column
              label="条件"
              width="300"
            >
              <template #default="{ row }">
                <el-tag
                  v-for="(cond, index) in row.conditions"
                  :key="index"
                  size="small"
                >
                  {{ cond.field }} {{ cond.operator }} {{ cond.value }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>

        <el-tab-pane
          label="收藏夹"
          name="favorites"
        >
          <el-table
            :data="debugFavorites"
            stripe
          >
            <el-table-column
              prop="id"
              label="ID"
              width="150"
            />
            <el-table-column
              prop="name"
              label="名称"
            />
            <el-table-column
              label="条件"
              width="300"
            >
              <template #default="{ row }">
                <el-tag
                  v-for="(cond, index) in row.conditions"
                  :key="index"
                  size="small"
                >
                  {{ cond.field }} {{ cond.operator }} {{ JSON.stringify(cond.value) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column
              prop="scope"
              label="作用域"
            />
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

import { Document, Suitcase, User } from '@element-plus/icons-vue'

import { useSmartSearch } from '@/composables/useSmartSearch'
import type {
  SearchConditionDraft,
  SearchFieldDef,
  SearchFavorite,
  QuickSearchPreset
} from '@/types/search'
import SmartSearchBar from '@/components/search/SmartSearchBar.vue'
import AdvancedSearchDialog from '@/components/search/AdvancedSearchDialog.vue'

// ==================== 测试数据 ====================

/**
 * 调试页面的测试字段
 */
const debugFields: SearchFieldDef[] = [
  {
    key: 'username',
    label: '用户名',
    dataType: 'text',
    searchable: true,
    defaultOperator: 'contains',
    quickOps: ['contains', 'equals', 'startsWith'],
    placeholder: '请输入用户名',
    icon: User
  },
  {
    key: 'email',
    label: '邮箱',
    dataType: 'text',
    searchable: true,
    defaultOperator: 'contains',
    quickOps: ['contains', 'equals'],
    placeholder: '请输入邮箱',
    icon: Document
  },
  {
    key: 'role',
    label: '角色',
    dataType: 'text',
    searchable: true,
    defaultOperator: 'contains',
    quickOps: ['contains', 'equals'],
    placeholder: '请输入角色名',
    icon: Suitcase
  },
  {
    key: 'status',
    label: '状态',
    dataType: 'enum',
    searchable: true,
    defaultOperator: 'equals',
    quickOps: ['equals', 'in'],
    options: [
      { label: '活跃', value: 'active' },
      { label: '禁用', value: 'inactive' },
      { label: '待审核', value: 'pending' }
    ],
    icon: Document
  },
  {
    key: 'is_active',
    label: '激活状态',
    dataType: 'boolean',
    searchable: true,
    defaultOperator: 'equals',
    quickOps: ['equals'],
    options: [
      { label: '是', value: true },
      { label: '否', value: false }
    ],
    icon: Suitcase
  },
  {
    key: 'score',
    label: '分数',
    dataType: 'number',
    searchable: true,
    defaultOperator: 'gte',
    quickOps: ['gt', 'gte', 'lt', 'lte', 'between'],
    icon: Suitcase
  }
]

/**
 * 调试页面的快速预设
 */
const debugQuickPresets: QuickSearchPreset[] = [
  {
    id: 'active_users',
    label: '活跃用户',
    description: '状态为活跃的用户',
    conditions: [{ field: 'status', operator: 'equals', value: 'active' }]
  },
  {
    id: 'high_score',
    label: '高分用户',
    description: '分数大于等于 80 的用户',
    conditions: [{ field: 'score', operator: 'gte', value: 80 }]
  },
  {
    id: 'admin_users',
    label: '管理员',
    description: '角色包含 admin 的用户',
    conditions: [{ field: 'role', operator: 'contains', value: 'admin' }]
  }
]

/**
 * 调试页面的收藏夹
 */
const debugFavorites: SearchFavorite[] = [
  {
    id: 'fav_active_admin',
    name: '活跃管理员',
    conditions: [
      {
        field: 'status',
        operator: 'equals',
        value: 'active'
      },
      {
        field: 'role',
        operator: 'contains',
        value: 'admin'
      }
    ],
    scope: 'debug'
  },
  {
    id: 'fav_high_score',
    name: '高分用户',
    conditions: [
      {
        field: 'score',
        operator: 'gte',
        value: 80
      }
    ],
    scope: 'debug'
  }
]

// ==================== 智能搜索状态 ====================

const smartSearch = useSmartSearch({
  fields: debugFields,
  favorites: debugFavorites,
  quickPresets: debugQuickPresets
})

// ==================== 状态 ====================

const loading = ref(false)
const activeTab = ref('fields')
const advancedDialogDraftSeed = ref<{ fieldKey: string; nonce: number } | undefined>(undefined)
let draftSeedNonce = 0

// ==================== 计算属性 ====================

const hasConditions = computed(() => smartSearch.conditions.value.length > 0)

const filterGroup = computed(() => smartSearch.compileToFilterGroup())

// ==================== 日志系统 ====================

interface LogEntry {
  time: string
  type: 'info' | 'success' | 'warning' | 'error'
  message: string
}

const logs = ref<LogEntry[]>([])

function addLog(type: LogEntry['type'], message: string) {
  const now = new Date()
  logs.value.unshift({
    time: `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`,
    type,
    message
  })

  // 限制日志数量
  if (logs.value.length > 100) {
    logs.value = logs.value.slice(0, 100)
  }
}

function clearLogs() {
  logs.value = []
}

// ==================== 事件处理 ====================

function handleReplaceConditions(drafts: SearchConditionDraft[]) {
  smartSearch.replaceConditions(drafts)
  addLog('success', `应用高级搜索条件，共 ${drafts.length} 条`)
}

function handleApplyPreset(presetId: string) {
  smartSearch.applyQuickPreset(presetId)
  const preset = debugQuickPresets.find(p => p.id === presetId)
  addLog('success', `应用预设: ${preset?.label || presetId}`)
}

function handleActivateField(fieldKey: string) {
  smartSearch.setActiveField(fieldKey)
  const keyword = smartSearch.state.value.keyword
  const applied = smartSearch.buildConditionFromField(fieldKey)

  if (applied) {
    addLog('success', `点击字段生成条件: ${fieldKey} = ${keyword}`)
  }
}

function handleOpenAdvancedForField(fieldKey: string) {
  smartSearch.setActiveField(fieldKey)
  advancedDialogDraftSeed.value = {
    fieldKey,
    nonce: ++draftSeedNonce
  }
  smartSearch.closePopover()
  smartSearch.openAdvancedDialog()
  addLog('info', `打开高级搜索并带入字段: ${fieldKey}`)
}

function handleRemoveCondition(id: string) {
  const condition = smartSearch.conditions.value.find(c => c.id === id)
  smartSearch.removeCondition(id)
  if (condition) {
    addLog('info', `删除条件: ${condition.label}`)
  }
}

function handleClear() {
  smartSearch.clearConditions()
  smartSearch.clearKeyword()
  addLog('warning', '清空所有条件和关键字')
}

function handleApply() {
  addLog('success', '应用搜索（模拟）')
  // 实际使用时这里会调用 fetchList
}

function handleKeydownEnter() {
  // 缓存当前值（buildConditionFromActiveField 会清空这些值）
  const cachedField = smartSearch.state.value.activeField
  const cachedKeyword = smartSearch.state.value.keyword

  smartSearch.buildConditionFromActiveField()

  addLog('success', `按 Enter 生成条件: ${cachedField} = ${cachedKeyword}`)
}

// ==================== 暴露方法 ====================

defineExpose({
  smartSearch,
  logs,
  clearLogs
})
</script>

<style scoped lang="scss">
.smart-search-debug {
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  &__header {
    text-align: center;
    margin-bottom: 32px;

    h1 {
      margin: 0 0 8px 0;
      font-size: 28px;
      font-weight: 600;
    }

    .subtitle {
      margin: 0;
      color: var(--el-text-color-secondary);
      font-size: 14px;
    }
  }

  &__search-section {
    margin-bottom: 24px;
  }

  &__output-section {
    margin-bottom: 24px;

    .filter-group-output {
      margin: 0;
      padding: 12px;
      background: var(--el-fill-color-light);
      border-radius: 4px;
      font-size: 12px;
      max-height: 300px;
      overflow: auto;
    }
  }

  &__conditions-section {
    margin-bottom: 24px;
  }

  &__log-section {
    margin-bottom: 24px;
  }

  &__data-section {
    margin-bottom: 24px;
  }
}

.log-list {
  max-height: 300px;
  overflow-y: auto;

  .log-item {
    display: flex;
    gap: 12px;
    padding: 8px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    font-family: monospace;
    font-size: 12px;

    &:last-child {
      border-bottom: none;
    }
  }

  .log-time {
    color: var(--el-text-color-secondary);
    flex-shrink: 0;
  }

  .log-type {
    flex-shrink: 0;
    padding: 2px 6px;
    border-radius: 2px;
    font-size: 10px;

    &--info {
      background: var(--el-color-info-light-9);
      color: var(--el-color-info);
    }

    &--success {
      background: var(--el-color-success-light-9);
      color: var(--el-color-success);
    }

    &--warning {
      background: var(--el-color-warning-light-9);
      color: var(--el-color-warning);
    }

    &--error {
      background: var(--el-color-danger-light-9);
      color: var(--el-color-danger);
    }
  }

  .log-message {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}
</style>
