<template>
  <div
    class="sandbox-cycle-status"
    :class="[`sandbox-cycle-status--${phase}`]"
  >
    <div class="sandbox-cycle-status__phase">
      <div class="sandbox-cycle-status__dot" />
      <span class="sandbox-cycle-status__label">{{ phaseLabel }}</span>
      <span class="sandbox-cycle-status__hint">{{ phaseHint }}</span>
    </div>

    <div
      v-if="activeSession"
      class="sandbox-cycle-status__session"
    >
      <RuntimeStatusBadge
        :status="activeSession.status"
        size="small"
      />
      <span class="sandbox-cycle-status__session-id">
        {{
          displaySession({
            session_code: activeSession.session_code,
            session_id: activeSession.session_id
          })
        }}
      </span>
      <span
        v-if="activeProgress !== '—'"
        class="sandbox-cycle-status__step"
      >
        {{ activeProgress }}
      </span>
      <span
        v-if="activeWaitType"
        class="sandbox-cycle-status__wait"
      >
        等待 {{ waitLabel }}
      </span>
      <span
        v-if="activeSession.is_timed_out"
        class="sandbox-cycle-status__timeout"
      >
        已超时
      </span>
    </div>

    <div class="sandbox-cycle-status__counts">
      <template v-if="hasActions">
        <span v-if="newCount">{{ newCount }} 待派发</span>
        <span v-if="sentCount">{{ sentCount }} 待 ACK</span>
        <span v-if="ackedCount">{{ ackedCount }} 待 Result</span>
        <span v-if="externalCallbackCount">{{ externalCallbackCount }} 待外部回调</span>
        <span v-if="blockedCount">{{ blockedCount }} 阻塞</span>
      </template>
      <span
        v-else-if="!activeSession"
        class="sandbox-cycle-status__counts-empty"
      >
        无活跃会话
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { displaySession } from '@/utils/runtime-display-identity'
import { resolveRuntimeProgressLabel } from '@/utils/runtime-display'
import {
  canAckSandboxOutbox,
  canSubmitSandboxExternalCallback,
  canSubmitSandboxResult,
  isCurrentSandboxAction
} from '@/utils/sandbox-outbox'
import type {
  RuntimeMonitorSessionItem,
  RuntimeMonitorTraceItem,
  SandboxPendingOutbox
} from '@/types/runtime'

const props = defineProps<{
  activeSessions: (RuntimeMonitorSessionItem | RuntimeMonitorTraceItem)[]
  pendingOutboxes: SandboxPendingOutbox[]
}>()

const activeSession = computed(() => {
  const nonTerminal = props.activeSessions.find(
    s => !['COMPLETED', 'FAILED', 'CANCELLED'].includes(s.status)
  )
  return nonTerminal ?? props.activeSessions[0] ?? null
})

const activeProgress = computed(() => resolveRuntimeProgressLabel(activeSession.value))

const newCount = computed(
  () =>
    props.pendingOutboxes.filter(
      o =>
        isCurrentSandboxAction(o) &&
        !canAckSandboxOutbox(o) &&
        (o.status === 'NEW' || o.status === 'DISPATCHING')
    ).length
)
const sentCount = computed(() => props.pendingOutboxes.filter(canAckSandboxOutbox).length)
const ackedCount = computed(() => props.pendingOutboxes.filter(canSubmitSandboxResult).length)
const externalCallbackCount = computed(
  () => props.pendingOutboxes.filter(canSubmitSandboxExternalCallback).length
)
const blockedCount = computed(
  () =>
    props.pendingOutboxes.filter(o => isCurrentSandboxAction(o) && o.status === 'BLOCKED_RESOURCE')
      .length
)

const hasActions = computed(
  () =>
    newCount.value +
      sentCount.value +
      ackedCount.value +
      externalCallbackCount.value +
      blockedCount.value >
    0
)

const phase = computed<'idle' | 'action' | 'done'>(() => {
  const hasTerminal = props.activeSessions.some(s =>
    ['COMPLETED', 'FAILED', 'CANCELLED'].includes(s.status)
  )
  if (hasTerminal) return 'done'
  if (hasActions.value) return 'action'
  if (props.activeSessions.length > 0) return 'idle'
  return 'idle'
})

const phaseLabel = computed(() => {
  if (phase.value === 'done') return '循环结束'
  if (phase.value === 'action') return '待操作'
  if (props.activeSessions.length > 0) return '等待注入'
  return '就绪'
})

const phaseHint = computed(() => {
  if (phase.value === 'done') return '可继续发起新 Event 开始下一轮'
  if (phase.value === 'action') {
    if (externalCallbackCount.value > 0) return '有外部系统回调需要模拟'
    if (ackedCount.value > 0) return '有命令需要提交 Result'
    if (sentCount.value > 0) return '有命令等待 ACK'
    if (blockedCount.value > 0) return '有命令被阻塞'
    return '有命令需要处理'
  }
  if (props.activeSessions.length > 0) return '会话运行中，等待系统派发命令'
  return '选择设备 → 发送 Event → 开始测试'
})

const activeWaitType = computed(() => {
  return (
    (activeSession.value as unknown as { current_wait_type?: string | null })?.current_wait_type ??
    null
  )
})

const waitLabel = computed(() => {
  const typeMap: Record<string, string> = {
    DEVICE_CALLBACK: '设备回调',
    EXTERNAL_API: '外部 API',
    TIMER: '定时器',
    MANUAL: '人工操作'
  }
  const waitType = activeWaitType.value
  return typeMap[waitType ?? ''] ?? waitType ?? '—'
})
</script>

<style scoped>
.sandbox-cycle-status {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--runtime-border, rgb(245, 158, 11, 0.12));
  background: var(--runtime-surface, rgb(30, 41, 59, 0.8));
}

.sandbox-cycle-status__phase {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.sandbox-cycle-status__dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #475569;
}

.sandbox-cycle-status--idle .sandbox-cycle-status__dot {
  background: #3b82f6;
}
.sandbox-cycle-status--action .sandbox-cycle-status__dot {
  background: #eab308;
  box-shadow: 0 0 6px rgb(234, 179, 8, 0.4);
}
.sandbox-cycle-status--done .sandbox-cycle-status__dot {
  background: #22c55e;
}

.sandbox-cycle-status__label {
  color: var(--runtime-text-primary);
  font-size: 13px;
  font-weight: 700;
}

.sandbox-cycle-status__hint {
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.sandbox-cycle-status__session {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-left: 16px;
  border-left: 1px solid rgb(245, 158, 11, 0.12);
}

.sandbox-cycle-status__session-id {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.sandbox-cycle-status__step {
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
}

.sandbox-cycle-status__wait {
  color: #fde047;
  font-size: 11px;
}

.sandbox-cycle-status__timeout {
  color: var(--runtime-badge-danger-text);
  font-size: 11px;
  font-weight: 600;
}

.sandbox-cycle-status__counts {
  display: flex;
  gap: 12px;
  margin-left: auto;
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
}

.sandbox-cycle-status__counts-empty {
  color: var(--runtime-text-muted);
  font-family: var(--font-body, inherit);
  font-style: normal;
}

@media (width <= 1279px) {
  .sandbox-cycle-status {
    flex-wrap: wrap;
    gap: 8px;
  }

  .sandbox-cycle-status__session {
    border-left: none;
    padding-left: 0;
  }
}
</style>
