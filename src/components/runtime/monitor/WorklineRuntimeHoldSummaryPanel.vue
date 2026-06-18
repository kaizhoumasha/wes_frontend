<template>
  <section class="workline-hold-panel">
    <div class="workline-hold-panel__status-bar" />
    <div class="workline-hold-panel__body">
      <div class="workline-hold-panel__main">
        <span class="workline-hold-panel__eyebrow">Runtime Hold</span>
        <h2 class="workline-hold-panel__title">线体恢复需人工处置</h2>
        <p class="workline-hold-panel__copy">
          异常、停靠命令和物料处置都以 Runtime Hold 为准；在处置页确认继续生产或退回 NG。
        </p>
      </div>

      <dl class="workline-hold-panel__facts">
        <div class="workline-hold-panel__fact">
          <dt>Active Hold</dt>
          <dd>{{ activeHoldIds.length }}</dd>
        </div>
        <div class="workline-hold-panel__fact">
          <dt>异常节点</dt>
          <dd>{{ openIssueCount }}</dd>
        </div>
        <div class="workline-hold-panel__fact">
          <dt>已停靠</dt>
          <dd>{{ blockedOutboxCount }}</dd>
        </div>
        <div class="workline-hold-panel__fact">
          <dt>未完成命令</dt>
          <dd>{{ openCommandCount }}</dd>
        </div>
      </dl>

      <div class="workline-hold-panel__requirements">
        <div class="workline-hold-panel__requirement">
          <span class="workline-hold-panel__requirement-label">处置证据</span>
          <strong>{{ evidenceStatus }}</strong>
        </div>
        <div class="workline-hold-panel__requirement">
          <span class="workline-hold-panel__requirement-label">物料去向</span>
          <strong>继续 / 退回 NG</strong>
        </div>
      </div>

      <div class="workline-hold-panel__actions">
        <RouterLink
          v-if="firstHoldId && canViewHold"
          class="workline-hold-panel__primary"
          :to="{ name: 'RuntimeHoldDetail', params: { holdId: firstHoldId } }"
        >
          打开 Hold #{{ firstHoldId }}
        </RouterLink>
        <span
          v-else-if="firstHoldId"
          class="workline-hold-panel__disabled"
        >
          需要 Runtime Hold 查看权限
        </span>
        <span
          v-else
          class="workline-hold-panel__disabled"
        >
          等待 repair job 补齐 Hold
        </span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import type {
  RuntimeWorklineMonitorProjectionResponse,
  RuntimeWorklineSummary
} from '@/types/runtime'

const props = defineProps<{
  summary: RuntimeWorklineSummary
  projection: RuntimeWorklineMonitorProjectionResponse
  canViewHold?: boolean
}>()

const activeHoldIds = computed(() => {
  const ids = new Set<number>()
  for (const device of props.projection.device_nodes ?? []) {
    for (const holdId of device.active_runtime_hold_ids ?? []) ids.add(holdId)
  }
  return Array.from(ids)
})

const firstHoldId = computed(() => activeHoldIds.value[0] ?? null)
const openIssueCount = computed(() =>
  (props.projection.device_nodes ?? []).reduce(
    (total, device) => total + (device.open_issue_count ?? 0),
    0
  )
)
const blockedOutboxCount = computed(() =>
  (props.projection.device_nodes ?? []).reduce(
    (total, device) => total + (device.blocked_outbox_count ?? 0),
    0
  )
)
const openCommandCount = computed(() =>
  (props.projection.device_nodes ?? []).reduce(
    (total, device) => total + (device.open_command_count ?? device.pending_command_count ?? 0),
    0
  )
)
const evidenceStatus = computed(() =>
  activeHoldIds.value.length > 0
    ? '进入处置页确认'
    : props.summary.stopped_reason || '缺少 Hold 投影'
)
</script>

<style scoped>
.workline-hold-panel {
  display: flex;
  overflow: hidden;
  border: 1px solid rgb(239, 68, 68, 0.28);
  border-radius: 8px;
  background: rgb(var(--color-industrial-dark-bg-rgb) / 0.86);
}

.workline-hold-panel__status-bar {
  width: 4px;
  flex-shrink: 0;
  background: var(--color-danger-light);
}

.workline-hold-panel__body {
  display: grid;
  grid-template-columns: minmax(220px, 1.2fr) minmax(280px, 1fr) minmax(220px, 0.9fr) auto;
  gap: 16px;
  width: 100%;
  padding: 18px;
}

.workline-hold-panel__main,
.workline-hold-panel__requirements,
.workline-hold-panel__actions {
  min-width: 0;
}

.workline-hold-panel__eyebrow {
  color: var(--color-danger-light);
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workline-hold-panel__title {
  margin: 6px 0 0;
  color: var(--runtime-text-primary);
  font-size: 18px;
}

.workline-hold-panel__copy {
  margin: 8px 0 0;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.workline-hold-panel__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
  margin: 0;
}

.workline-hold-panel__fact {
  min-width: 0;
  padding: 10px;
  border: 1px solid rgb(var(--color-primary-rgb) / 0.12);
  border-radius: 6px;
  background: var(--runtime-surface-subtle);
}

.workline-hold-panel__fact dt,
.workline-hold-panel__requirement-label {
  color: var(--runtime-text-muted);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.workline-hold-panel__fact dd {
  margin: 4px 0 0;
  color: var(--color-industrial-dark-text);
  font-family: var(--font-mono);
  font-size: 18px;
  font-weight: 800;
}

.workline-hold-panel__requirements {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.workline-hold-panel__requirement {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 10px;
  border: 1px solid rgb(239, 68, 68, 0.18);
  border-radius: 6px;
  background: rgb(239, 68, 68, 0.08);
}

.workline-hold-panel__requirement strong {
  color: var(--color-danger-light);
  font-size: 12px;
}

.workline-hold-panel__actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

.workline-hold-panel__primary,
.workline-hold-panel__disabled {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 0 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.workline-hold-panel__primary {
  border: 1px solid rgb(239, 68, 68, 0.38);
  background: rgb(239, 68, 68, 0.16);
  color: var(--color-danger-light);
  text-decoration: none;
}

.workline-hold-panel__primary:hover {
  background: rgb(239, 68, 68, 0.24);
}

.workline-hold-panel__disabled {
  border: 1px solid var(--runtime-border-neutral);
  color: var(--runtime-text-muted);
}

@media (width <= 1080px) {
  .workline-hold-panel__body {
    grid-template-columns: 1fr;
  }

  .workline-hold-panel__actions {
    justify-content: stretch;
  }

  .workline-hold-panel__primary,
  .workline-hold-panel__disabled {
    width: 100%;
  }
}
</style>
