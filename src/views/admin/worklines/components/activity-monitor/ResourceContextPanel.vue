<!--
  T5 右侧上下文面板：默认展示整线摘要，选中资源后切换为该资源上下文，清除选择恢复整线摘要。
-->
<script setup lang="ts">
import { computed } from 'vue'
import type {
  PlaneActiveObjectsV2,
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
}>()
const emit = defineEmits<{ clear: [] }>()

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
</script>

<template>
  <aside
    class="context-panel"
    aria-label="上下文面板"
    aria-live="polite"
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
</style>
