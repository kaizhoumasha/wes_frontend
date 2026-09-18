<!--
  T5 右侧上下文面板：默认展示整线摘要，选中资源后切换为该资源上下文，清除选择恢复整线摘要。
-->
<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import type {
  PlaneActiveObjectsV2,
  PlaneCurrentTaskView,
  PlaneResource,
  PlaneResourceRef,
  PlaneSnapshotV2
} from '@/api/types/plane-v2'
import { BINDING_STATE_LABEL, CONFLICT_STATE_LABEL, findResourceState } from './planeV2Helpers'

const props = defineProps<{
  lineName: string
  lineCode: string
  snapshot: PlaneSnapshotV2 | null
  activeObjects: PlaneActiveObjectsV2 | null
  selected: PlaneResourceRef | null
  selectedResource: PlaneResource | null
  staleBannerText: string | null
  generatedAtLabel: string | null
  currentTask: PlaneCurrentTaskView | null
  currentTaskLoaded: boolean
  currentTaskLoading: boolean
  currentTaskError: string
  currentTaskGeneratedAtLabel: string | null
}>()
const emit = defineEmits<{ clear: []; loadCurrentTask: [] }>()

const trustworthy = computed(() => props.snapshot?.source_status === 'COMPLETE')

const conflictBreakdown = computed(() => {
  const counts: Record<string, number> = { OK: 0, TRANSIENT: 0, RECONCILING: 0 }
  for (const object of props.activeObjects?.objects ?? []) {
    counts[object.conflict_state] = (counts[object.conflict_state] ?? 0) + 1
  }
  return counts
})

const selectedResourceState = computed(() => {
  if (!props.selected || !props.snapshot) return null
  return findResourceState(props.snapshot.resource_states ?? [], props.selected)
})

const currentTaskStatusLabel = computed(() => {
  if (!props.currentTask) return ''
  return props.currentTask.status === 'PREPARING' ? '准备中' : '执行中'
})

const currentTaskActionLabel = computed(() => {
  if (props.currentTaskLoading) return '正在读取'
  if (props.currentTaskError) return '重试'
  return props.currentTaskLoaded ? '重新读取' : '查看当前任务'
})

const currentTaskActionIcon = computed(() => {
  if (props.currentTaskLoading) return 'ep:loading'
  return props.currentTaskLoaded || props.currentTaskError ? 'lucide:refresh-cw' : 'lucide:eye'
})

const currentTaskActionType = computed<'danger' | 'default'>(() =>
  props.currentTaskError ? 'danger' : 'default'
)
</script>

<template>
  <aside
    class="context-panel"
    aria-label="上下文面板"
  >
    <p
      v-if="staleBannerText"
      class="context-panel__banner"
      role="status"
    >
      {{ staleBannerText }}
      <span v-if="generatedAtLabel">（截至 {{ generatedAtLabel }}）</span>
    </p>
    <p
      v-else-if="generatedAtLabel"
      class="context-panel__timestamp"
    >
      截至 {{ generatedAtLabel }}
    </p>

    <template v-if="selected && selectedResource">
      <header class="context-panel__header">
        <h3>{{ selectedResource.display_name }}</h3>
        <button
          type="button"
          class="context-panel__clear"
          @click="emit('clear')"
        >
          返回整线概览
        </button>
      </header>
      <dl class="context-panel__facts">
        <dt>资源键</dt>
        <dd class="mono">{{ selectedResource.key }}</dd>
        <dt>分组</dt>
        <dd>{{ selected.group === 'POSITION_SLOT' ? '工作位' : '设备角色' }}</dd>
        <dt>实际绑定</dt>
        <dd class="mono">
          {{
            selectedResource.binding
              ? `${selectedResource.binding.code}${selectedResource.binding.name ? ` · ${selectedResource.binding.name}` : ''}`
              : '—'
          }}
        </dd>
        <dt>绑定状态</dt>
        <dd>{{ BINDING_STATE_LABEL[selectedResource.binding_state] }}</dd>
        <dt>活动对象数</dt>
        <dd class="mono">
          {{ trustworthy ? (selectedResourceState?.active_object_count ?? 0) : '—' }}
        </dd>
        <dt>过程状态</dt>
        <dd>
          {{
            trustworthy
              ? CONFLICT_STATE_LABEL[selectedResourceState?.highest_conflict_state ?? 'OK']
              : '数据不可信，暂不展示'
          }}
        </dd>
      </dl>
    </template>

    <template v-else>
      <header class="context-panel__header">
        <h3>{{ lineName }}</h3>
        <span class="mono context-panel__line-code">{{ lineCode }}</span>
      </header>
      <dl class="context-panel__facts">
        <dt>活动对象总数</dt>
        <dd class="mono">{{ trustworthy ? (activeObjects?.total_count ?? 0) : '—' }}</dd>
        <dt>未映射对象数</dt>
        <dd class="mono">{{ trustworthy ? (snapshot?.unmapped_object_count ?? 0) : '—' }}</dd>
        <dt>正常</dt>
        <dd class="mono">{{ trustworthy ? conflictBreakdown.OK : '—' }}</dd>
        <dt>瞬时冲突</dt>
        <dd class="mono">{{ trustworthy ? conflictBreakdown.TRANSIENT : '—' }}</dd>
        <dt>协调中</dt>
        <dd class="mono">{{ trustworthy ? conflictBreakdown.RECONCILING : '—' }}</dd>
      </dl>
      <p class="context-panel__hint">选择左侧矩阵中的资源行以查看其上下文</p>
    </template>

    <section
      class="context-panel__task"
      aria-labelledby="current-task-title"
    >
      <div class="context-panel__task-header">
        <h4 id="current-task-title">当前任务</h4>
        <AppButton
          :icon="currentTaskActionIcon"
          size="small"
          :type="currentTaskActionType"
          plain
          :aria-disabled="currentTaskLoading ? 'true' : undefined"
          :aria-busy="currentTaskLoading ? 'true' : undefined"
          @click="emit('loadCurrentTask')"
        >
          {{ currentTaskActionLabel }}
        </AppButton>
      </div>

      <p
        v-if="currentTaskLoading"
        class="context-panel__task-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        正在读取当前任务
      </p>
      <p
        v-else-if="currentTaskError"
        class="context-panel__task-status context-panel__task-status--error"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        当前任务加载失败：{{ currentTaskError }}
      </p>
      <template v-else-if="currentTaskLoaded && currentTask">
        <dl class="context-panel__facts context-panel__task-facts">
          <dt>任务 ID</dt>
          <dd class="mono">{{ currentTask.task_id }}</dd>
          <dt>状态</dt>
          <dd>
            <ElTag
              :type="currentTask.status === 'EXECUTING' ? 'success' : 'info'"
              size="small"
            >
              {{ currentTaskStatusLabel }}
            </ElTag>
          </dd>
          <dt>计划版本</dt>
          <dd class="mono">{{ currentTask.last_applied_plan_revision }}</dd>
          <dt>目标货架</dt>
          <dd class="mono">
            {{
              currentTask.last_applied_plan_revision > 0
                ? currentTask.target_rack_id || '—'
                : '尚未生成'
            }}
          </dd>
          <dt>目标货架面</dt>
          <dd class="mono">
            {{
              currentTask.last_applied_plan_revision > 0
                ? currentTask.target_rack_face || '—'
                : '尚未生成'
            }}
          </dd>
        </dl>
      </template>
      <p
        v-else-if="currentTaskLoaded"
        class="context-panel__task-status"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        当前无准备中或执行中的任务
      </p>
      <p
        v-if="currentTaskLoaded && !currentTaskError && currentTaskGeneratedAtLabel"
        class="context-panel__task-time"
      >
        任务读取 · {{ currentTaskGeneratedAtLabel }}
      </p>
    </section>
  </aside>
</template>

<style scoped>
.context-panel {
  display: grid;
  gap: var(--space-sm);
  align-content: start;
  padding: var(--space-md);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--el-bg-color);
  min-width: 0;
}
.mono {
  font-family: var(--font-mono);
}
.context-panel__banner {
  margin: 0;
  padding: var(--space-2xs) var(--space-xs);
  border: 1px solid var(--color-warning);
  border-radius: var(--radius-sm);
  color: var(--color-warning-dark);
  font-size: var(--el-font-size-small);
}
.context-panel__timestamp {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--el-font-size-small);
}
.context-panel__header {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: var(--space-xs);
}
.context-panel__header h3 {
  margin: 0;
  font-size: var(--el-font-size-medium);
  font-weight: 600;
  color: var(--color-text-primary);
}
.context-panel__line-code {
  color: var(--color-text-secondary);
  font-size: var(--el-font-size-small);
}
.context-panel__clear {
  min-height: 32px;
  padding: var(--space-4xs) var(--space-xs);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-primary);
  cursor: pointer;
}
.context-panel__clear:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
.context-panel__facts {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: var(--space-3xs) var(--space-sm);
  margin: 0;
  font-size: var(--el-font-size-base);
}
.context-panel__facts dt {
  color: var(--color-text-secondary);
}
.context-panel__facts dd {
  margin: 0;
  color: var(--color-text-primary);
  text-align: right;
}
.context-panel__hint {
  color: var(--color-text-secondary);
  font-size: var(--el-font-size-small);
  margin: 0;
}
.context-panel__task {
  display: grid;
  gap: var(--space-xs);
  min-block-size: 96px;
  padding-top: var(--space-md);
  border-top: 1px solid var(--color-border);
}
.context-panel__task-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--space-xs);
}
.context-panel__task-header h4 {
  margin: 0;
  font-size: var(--el-font-size-base);
  font-weight: 600;
}
.context-panel__task-status,
.context-panel__task-time {
  margin: 0;
  color: var(--color-text-secondary);
  font-size: var(--el-font-size-small);
}
.context-panel__task-status--error {
  color: var(--color-danger);
}
.context-panel__task-facts {
  overflow-wrap: anywhere;
}
.context-panel__task-time {
  font-variant-numeric: tabular-nums;
}
.context-panel__task :deep(.el-button) {
  min-height: 44px;
}
.context-panel__task :deep(.el-button.is-plain.el-button--default) {
  color: var(--color-text-primary);
  border-color: var(--color-border);
}
</style>
