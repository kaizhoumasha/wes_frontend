<template>
  <div class="trace-health-pipeline">
    <div class="trace-health-pipeline__track">
      <div
        v-for="(stage, index) in stages"
        :key="stage.key"
        class="trace-health-pipeline__stage"
        :class="[`trace-health-pipeline__stage--${stage.state}`]"
      >
        <div class="trace-health-pipeline__node">
          <span class="trace-health-pipeline__dot" />
          <span
            v-if="stage.count"
            class="trace-health-pipeline__badge"
          >
            {{ stage.count }}
          </span>
        </div>
        <span class="trace-health-pipeline__label">{{ stage.label }}</span>
        <span
          v-if="stage.hint"
          class="trace-health-pipeline__hint"
        >
          {{ stage.hint }}
        </span>

        <span
          v-if="index < stages.length - 1"
          class="trace-health-pipeline__connector"
          :class="{ 'trace-health-pipeline__connector--active': stage.state === 'success' }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { TraceDetailResponse } from '@/types/runtime'

const props = defineProps<{
  detail: TraceDetailResponse
}>()

type StageState = 'pending' | 'active' | 'success' | 'failed' | 'empty'

interface PipelineStage {
  key: string
  label: string
  count: number
  hint: string
  state: StageState
}

const stages = computed<PipelineStage[]>(() => {
  const d = props.detail
  const s = d.summary
  const session = d.session
  const hasFailed = s.session_status === 'FAILED'
  const isCompleted = s.session_status === 'COMPLETED' || s.session_status === 'CANCELLED'

  const inboxCount = s.inboxes
  const inboxStatus = resolveStageState(inboxCount, hasFailed, isCompleted)

  const sessionActive = s.session_status && !['NEW'].includes(s.session_status)
  const sessionStatus = sessionActive
    ? hasFailed
      ? 'failed'
      : isCompleted
        ? 'success'
        : 'active'
    : inboxCount > 0
      ? 'pending'
      : 'empty'

  const commandCount = s.commands
  const commandStatus = resolveStageState(commandCount, hasFailed, isCompleted)

  const outboxCount = s.outboxes
  const outboxStatus = resolveStageState(outboxCount, hasFailed, isCompleted)

  const dispatchCount = d.dispatch_attempts?.length ?? 0
  const dispatchFailed = d.dispatch_attempts?.some(a => a.status === 'FAILED') ?? false
  const dispatchStatus: StageState =
    dispatchCount === 0
      ? commandCount > 0
        ? 'pending'
        : 'empty'
      : dispatchFailed
        ? 'failed'
        : isCompleted
          ? 'success'
          : 'active'

  const callbackCount = s.callback_logs
  const callbackFailed = d.callback_logs?.some(l => l.ingress_outcome === 'FAILURE') ?? false
  const callbackStatus: StageState =
    callbackCount === 0
      ? dispatchCount > 0
        ? 'pending'
        : 'empty'
      : callbackFailed
        ? 'failed'
        : isCompleted
          ? 'success'
          : 'active'

  return [
    {
      key: 'inbox',
      label: '入口',
      count: inboxCount,
      hint: inboxStatus === 'failed' ? '入口失败' : '',
      state: inboxStatus
    },
    {
      key: 'session',
      label: '会话',
      count: d.sessions.length,
      hint: session?.plugin_state || '',
      state: sessionStatus
    },
    {
      key: 'command',
      label: '指令',
      count: commandCount,
      hint: '',
      state: commandStatus
    },
    {
      key: 'outbox',
      label: '派发',
      count: outboxCount,
      hint: '',
      state: outboxStatus
    },
    {
      key: 'dispatch',
      label: '投递',
      count: dispatchCount,
      hint: dispatchFailed ? '投递失败' : '',
      state: dispatchStatus
    },
    {
      key: 'callback',
      label: '回调',
      count: callbackCount,
      hint: callbackFailed ? '回调失败' : '',
      state: callbackStatus
    }
  ]
})

function resolveStageState(count: number, hasFailed: boolean, isCompleted: boolean): StageState {
  if (count === 0) return 'empty'
  if (hasFailed) return 'failed'
  if (isCompleted) return 'success'
  return 'active'
}
</script>

<style scoped>
.trace-health-pipeline {
  padding: 14px 18px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 12px;
  background: var(--runtime-surface);
}

.trace-health-pipeline__track {
  display: flex;
  align-items: flex-start;
  gap: 0;
}

.trace-health-pipeline__stage {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.trace-health-pipeline__node {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.trace-health-pipeline__dot {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--runtime-border-neutral);
  border: 2px solid var(--runtime-border-neutral);
}

.trace-health-pipeline__stage--empty .trace-health-pipeline__dot {
  background: var(--runtime-surface-subtle);
  border-color: var(--runtime-border-neutral);
}

.trace-health-pipeline__stage--pending .trace-health-pipeline__dot {
  background: var(--runtime-surface-strong);
  border-color: var(--runtime-border-neutral);
}

.trace-health-pipeline__stage--active .trace-health-pipeline__dot {
  background: #3b82f6;
  border-color: #60a5fa;
  box-shadow: 0 0 8px rgb(59, 130, 246, 0.4);
}

.trace-health-pipeline__stage--success .trace-health-pipeline__dot {
  background: #22c55e;
  border-color: #4ade80;
}

.trace-health-pipeline__stage--failed .trace-health-pipeline__dot {
  background: #ef4444;
  border-color: #f87171;
  box-shadow: 0 0 8px rgb(239, 68, 68, 0.35);
}

.trace-health-pipeline__badge {
  position: absolute;
  top: -8px;
  right: -10px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  border-radius: 8px;
  background: var(--runtime-chip-bg);
  color: var(--runtime-chip-text);
  font-size: 10px;
  font-weight: 700;
  line-height: 16px;
  text-align: center;
}

.trace-health-pipeline__stage--failed .trace-health-pipeline__badge {
  background: var(--runtime-badge-danger-text);
  color: #fff;
}

.trace-health-pipeline__label {
  color: var(--runtime-text-secondary);
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
}

.trace-health-pipeline__stage--active .trace-health-pipeline__label {
  color: var(--runtime-badge-info-text);
}

.trace-health-pipeline__stage--success .trace-health-pipeline__label {
  color: var(--runtime-badge-success-text);
}

.trace-health-pipeline__stage--failed .trace-health-pipeline__label {
  color: var(--runtime-badge-danger-text);
}

.trace-health-pipeline__hint {
  color: var(--runtime-text-muted);
  font-size: 10px;
  font-family: var(--font-mono);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 80px;
}

.trace-health-pipeline__stage--failed .trace-health-pipeline__hint {
  color: var(--runtime-badge-danger-text);
}

.trace-health-pipeline__connector {
  position: absolute;
  top: 6px;
  left: calc(50% + 10px);
  right: calc(-50% + 10px);
  height: 2px;
  background: var(--runtime-border-neutral);
}

.trace-health-pipeline__connector--active {
  background: #22c55e;
}

@media (width <= 767px) {
  .trace-health-pipeline__track {
    flex-wrap: wrap;
    gap: 12px;
  }

  .trace-health-pipeline__stage {
    flex: 0 0 calc(33.33% - 8px);
  }

  .trace-health-pipeline__connector {
    display: none;
  }
}
</style>
