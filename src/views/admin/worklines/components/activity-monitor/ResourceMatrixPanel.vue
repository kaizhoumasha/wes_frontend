<!--
  T4 资源矩阵：POSITION_SLOT / DEVICE_ROLE 双组只读表格。
  - 5 列固定：资源键 / 展示名称 / 实际绑定 / 绑定状态 / 活动摘要
  - 绑定状态使用中性文字徽标（不借用红/黄/绿），活动摘要的冲突状态才使用过程语义色
  - 行可选中（driving 右侧上下文与台账联动），选中态不依赖颜色，附加文字/图标提示
  - Snapshot 非 COMPLETE 时活动摘要显示“—”，不得渲染伪造的零活动
-->
<script setup lang="ts">
import { computed } from 'vue'
import type {
  PlaneOrphanBinding,
  PlaneResource,
  PlaneResourceGroup,
  PlaneResourceGroups,
  PlaneResourceRef,
  PlaneResourceState,
  PlaneSnapshotSourceStatus
} from '@/api/types/plane-v2'
import { BINDING_STATE_LABEL, CONFLICT_STATE_LABEL, findResourceState } from './planeV2Helpers'

const props = defineProps<{
  groups: PlaneResourceGroups | null
  orphanBindings: PlaneOrphanBinding[]
  resourceStates: PlaneResourceState[]
  sourceStatus: PlaneSnapshotSourceStatus | null
  loading: boolean
  error: string
  selected: PlaneResourceRef | null
}>()
const emit = defineEmits<{ select: [ref: PlaneResourceRef | null] }>()

const activitySummaryTrustworthy = computed(() => props.sourceStatus === 'COMPLETE')

interface Section {
  group: PlaneResourceGroup
  title: string
  rows: PlaneResource[]
}
const sections = computed<Section[]>(() => [
  {
    group: 'POSITION_SLOT',
    title: '工作位 (POSITION_SLOT)',
    rows: props.groups?.POSITION_SLOT ?? []
  },
  { group: 'DEVICE_ROLE', title: '设备角色 (DEVICE_ROLE)', rows: props.groups?.DEVICE_ROLE ?? [] }
])

function isSelected(group: PlaneResourceGroup, key: string): boolean {
  return props.selected !== null && props.selected.group === group && props.selected.key === key
}

function toggle(group: PlaneResourceGroup, key: string): void {
  emit('select', isSelected(group, key) ? null : { group, key })
}

function activitySummary(
  group: PlaneResourceGroup,
  key: string
): { text: string; conflict?: string } {
  if (!activitySummaryTrustworthy.value) return { text: '—' }
  const state = findResourceState(props.resourceStates, { group, key })
  if (!state) return { text: '0' }
  const suffix =
    state.highest_conflict_state === 'OK'
      ? ''
      : ` · ${CONFLICT_STATE_LABEL[state.highest_conflict_state]}`
  return { text: `${state.active_object_count}${suffix}`, conflict: state.highest_conflict_state }
}
</script>

<template>
  <section
    class="resource-matrix"
    aria-label="资源矩阵"
  >
    <ElAlert
      v-if="error"
      :title="`资源场景加载失败：${error}`"
      type="error"
      :closable="false"
    />
    <template v-else>
      <div
        v-for="section in sections"
        :key="section.group"
        class="resource-matrix__section"
      >
        <h3>{{ section.title }}</h3>
        <ElSkeleton
          v-if="loading"
          :rows="3"
          animated
        />
        <p
          v-else-if="section.rows.length === 0"
          class="resource-matrix__empty"
        >
          当前插件未声明此类资源
        </p>
        <table
          v-else
          class="resource-matrix__table"
          role="grid"
        >
          <thead>
            <tr role="row">
              <th role="columnheader">资源键</th>
              <th role="columnheader">展示名称</th>
              <th role="columnheader">实际绑定</th>
              <th role="columnheader">绑定状态</th>
              <th role="columnheader">活动摘要</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="resource in section.rows"
              :key="resource.key"
              role="row"
              tabindex="0"
              class="resource-matrix__row"
              :class="{ 'is-selected': isSelected(section.group, resource.key) }"
              :aria-selected="isSelected(section.group, resource.key)"
              @click="toggle(section.group, resource.key)"
              @keydown.enter.prevent="toggle(section.group, resource.key)"
              @keydown.space.prevent="toggle(section.group, resource.key)"
            >
              <td
                role="gridcell"
                class="mono"
              >
                <span
                  v-if="isSelected(section.group, resource.key)"
                  class="resource-matrix__selected-mark"
                  aria-hidden="true"
                >
                  ▸
                </span>
                {{ resource.key }}
              </td>
              <td role="gridcell">{{ resource.display_name }}</td>
              <td
                role="gridcell"
                class="mono"
              >
                {{
                  resource.binding
                    ? `${resource.binding.code}${resource.binding.name ? ` · ${resource.binding.name}` : ''}`
                    : '—'
                }}
              </td>
              <td role="gridcell">
                <span
                  class="binding-badge"
                  :class="`binding-badge--${resource.binding_state.toLowerCase()}`"
                >
                  {{ BINDING_STATE_LABEL[resource.binding_state] }}
                </span>
              </td>
              <td
                role="gridcell"
                class="mono"
              >
                <span
                  :class="[
                    'activity-summary',
                    activitySummary(section.group, resource.key).conflict &&
                      `activity-summary--${activitySummary(section.group, resource.key).conflict?.toLowerCase()}`
                  ]"
                >
                  {{ activitySummary(section.group, resource.key).text }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <details
        v-if="orphanBindings.length > 0"
        class="resource-matrix__orphans"
      >
        <summary>诊断：{{ orphanBindings.length }} 项历史绑定已不再被当前插件声明</summary>
        <ul>
          <li
            v-for="orphan in orphanBindings"
            :key="`${orphan.group}-${orphan.key}`"
          >
            <span class="mono">
              {{ orphan.group }} · {{ orphan.key }} → {{ orphan.bound_code }}
            </span>
            <span class="resource-matrix__orphan-reason">{{ orphan.reason }}</span>
          </li>
        </ul>
      </details>
    </template>
  </section>
</template>

<style scoped>
.resource-matrix {
  display: grid;
  gap: var(--space-md);
  min-width: 0;
}
.resource-matrix__section h3 {
  margin: 0 0 var(--space-xs);
  font-size: var(--el-font-size-medium);
  font-weight: 600;
  color: var(--color-text-primary);
}
.resource-matrix__empty {
  color: var(--color-text-secondary);
  font-size: var(--el-font-size-base);
}
.mono {
  font-family: var(--font-mono);
}
.resource-matrix__table {
  width: 100%;
  border-collapse: collapse;
  font-size: var(--el-font-size-base);
}
.resource-matrix__table th {
  text-align: left;
  padding: var(--space-2xs) var(--space-xs);
  color: var(--color-text-secondary);
  font-weight: 500;
  border-bottom: 1px solid var(--color-border);
}
.resource-matrix__row td {
  padding: var(--space-2xs) var(--space-xs);
  border-bottom: 1px solid var(--color-border);

  /* 行高固定，活动数量变化不改变行高 */
  height: 44px;
  vertical-align: middle;
}
.resource-matrix__row {
  cursor: pointer;
}
.resource-matrix__row:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: -2px;
}
.resource-matrix__row.is-selected {
  background: rgb(var(--color-primary-rgb) / 0.08);
  box-shadow: inset 3px 0 0 var(--color-primary);
}
.resource-matrix__selected-mark {
  color: var(--color-primary);
  margin-right: var(--space-4xs);
}
.binding-badge {
  display: inline-block;
  padding: var(--space-4xs) var(--space-2xs);
  border-radius: var(--radius-sm);
  font-size: var(--el-font-size-small);
  border: 1px solid var(--color-border);
  color: var(--color-text-secondary);
}
.binding-badge--bound {
  border-color: var(--color-text-secondary);
  color: var(--color-text-primary);
}
.binding-badge--invalid {
  border-style: dashed;
  border-color: var(--color-text-secondary);
}
.activity-summary--transient {
  color: var(--color-warning);
}
.activity-summary--reconciling {
  color: var(--color-info);
}
.resource-matrix__orphans {
  font-size: var(--el-font-size-small);
  color: var(--color-text-secondary);
}
.resource-matrix__orphans summary {
  cursor: pointer;
}
.resource-matrix__orphan-reason {
  margin-left: var(--space-xs);
  color: var(--color-text-secondary);
}

@media (prefers-reduced-motion: reduce) {
  .resource-matrix__row {
    transition: none;
  }
}
</style>
