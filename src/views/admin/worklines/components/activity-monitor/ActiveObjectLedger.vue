<!--
  T5 活动对象台账：复用 DataTable 基础组件，不另造表格框架。
  按冲突状态/对象类型/仅未映射过滤；选中资源时自动按 resource_ref 联动过滤。
-->
<script setup lang="ts">
import { computed, h, ref } from 'vue'
import DataTable from '@/components/ui/table/DataTable.vue'
import type { TableColumnConfig } from '@/components/ui/table/table.types'
import type { ConflictState, PlaneActiveObjectView, PlaneResourceRef } from '@/api/types/plane-v2'
import { CONFLICT_STATE_LABEL, filterActiveObjects } from './planeV2Helpers'

const CONFLICT_STATES: ConflictState[] = ['OK', 'TRANSIENT', 'RECONCILING']

const props = defineProps<{
  objects: PlaneActiveObjectView[]
  loading: boolean
  trustworthy: boolean
  selectedResourceRef: PlaneResourceRef | null
}>()
const emit = defineEmits<{ inspect: [object: PlaneActiveObjectView] }>()

const conflictFilter = ref<ConflictState | ''>('')
const objectTypeFilter = ref('')
const unmappedOnly = ref(false)

const objectTypes = computed(() =>
  [...new Set(props.objects.map(object => object.object_type))].sort()
)

interface Row extends PlaneActiveObjectView {
  _rowKey: string
}

const rows = computed<Row[]>(() => {
  const filtered = filterActiveObjects(props.objects, {
    selectedResourceRef: unmappedOnly.value ? null : props.selectedResourceRef,
    conflictState: conflictFilter.value || null,
    objectType: objectTypeFilter.value || null,
    unmappedOnly: unmappedOnly.value
  })
  return filtered.map(object => ({
    ...object,
    _rowKey: `${object.object_type}:${object.object_key}`
  }))
})

function conflictBadge(state: ConflictState) {
  return h(
    'span',
    { class: `ledger-conflict ledger-conflict--${state.toLowerCase()}` },
    CONFLICT_STATE_LABEL[state]
  )
}

const columns: TableColumnConfig[] = [
  { field: 'object_type', title: '对象类型', width: 160 },
  { field: 'object_key', title: '对象标识', minWidth: 160, className: 'mono' },
  {
    field: 'conflict_state',
    title: '过程状态',
    width: 120,
    slots: { default: scope => conflictBadge((scope.row as unknown as Row).conflict_state) }
  },
  {
    field: 'resource_ref',
    title: '资源关联',
    minWidth: 160,
    formatter: value => {
      const ref = value as PlaneResourceRef | null
      return ref ? `${ref.group}:${ref.key}` : '未映射'
    }
  },
  {
    field: 'operator_hint',
    title: '操作提示',
    minWidth: 140,
    formatter: value => (value as string | null) || '—'
  },
  {
    field: 'primary_source',
    title: '主来源',
    minWidth: 140,
    formatter: value => (value as string | null) || '—'
  },
  {
    field: 'evidence',
    title: '证据',
    width: 90,
    slots: {
      default: scope =>
        h(
          'button',
          {
            type: 'button',
            class: 'ledger-evidence-btn',
            onClick: () => emit('inspect', scope.row as unknown as PlaneActiveObjectView)
          },
          '查看'
        )
    }
  }
]
</script>

<template>
  <section
    class="ledger"
    aria-label="活动对象台账"
  >
    <div class="ledger__filters">
      <select
        v-model="conflictFilter"
        aria-label="按过程状态过滤"
      >
        <option value="">全部过程状态</option>
        <option
          v-for="state in CONFLICT_STATES"
          :key="state"
          :value="state"
        >
          {{ CONFLICT_STATE_LABEL[state] }}
        </option>
      </select>
      <select
        v-model="objectTypeFilter"
        aria-label="按对象类型过滤"
      >
        <option value="">全部对象类型</option>
        <option
          v-for="type in objectTypes"
          :key="type"
          :value="type"
        >
          {{ type }}
        </option>
      </select>
      <label class="ledger__unmapped-toggle">
        <input
          v-model="unmappedOnly"
          type="checkbox"
        />
        仅未映射
      </label>
      <span
        v-if="selectedResourceRef && !unmappedOnly"
        class="ledger__sync-hint"
      >
        已按所选资源过滤：{{ selectedResourceRef.group }}:{{ selectedResourceRef.key }}
      </span>
    </div>
    <p
      v-if="!trustworthy"
      class="ledger__untrusted"
    >
      当前动态数据不完整，以下列表可能不完整
    </p>
    <DataTable
      :data="rows"
      :columns="columns"
      :loading="loading"
      row-key="_rowKey"
      density="compact"
    />
  </section>
</template>

<style scoped>
.ledger {
  display: grid;
  gap: var(--space-xs);
  min-width: 0;
}
.ledger__filters {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--space-xs);
}
.ledger__filters select {
  min-height: 32px;
  padding: var(--space-4xs) var(--space-2xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--el-bg-color);
  color: var(--color-text-primary);
}
.ledger__unmapped-toggle {
  display: inline-flex;
  align-items: center;
  gap: var(--space-4xs);
  color: var(--color-text-primary);
}
.ledger__sync-hint {
  color: var(--color-text-secondary);
  font-size: var(--el-font-size-small);
}
.ledger__untrusted {
  margin: 0;
  color: var(--color-warning-dark);
  font-size: var(--el-font-size-small);
}
:deep(.mono) {
  font-family: var(--font-mono);
}
:deep(.ledger-conflict) {
  font-size: var(--el-font-size-small);
}
:deep(.ledger-conflict--ok) {
  color: var(--color-success);
}
:deep(.ledger-conflict--transient) {
  color: var(--color-warning);
}
:deep(.ledger-conflict--reconciling) {
  color: var(--color-info);
}
:deep(.ledger-evidence-btn) {
  min-height: 32px;
  padding: 0 var(--space-2xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
}
</style>
