<template>
  <div
    class="monitor-command-chain"
    data-test="monitor-command-chain"
  >
    <header class="monitor-command-chain__header">
      <span class="monitor-command-chain__title">指令链路</span>
      <span
        :class="[
          'monitor-command-chain__pill',
          `monitor-command-chain__pill--${command ? command.ackState : 'idle'}`
        ]"
        data-test="monitor-command-chain-ack-state"
      >
        {{ ackStateLabel }}
      </span>
    </header>

    <div
      v-if="!command"
      class="monitor-command-chain__idle"
      data-test="monitor-command-chain-idle"
    >
      暂无在途指令
    </div>

    <dl
      v-else
      class="monitor-command-chain__grid"
    >
      <div class="monitor-command-chain__cell">
        <dt>指令编码</dt>
        <dd
          class="monitor-command-chain__mono"
          data-test="monitor-command-chain-code"
        >
          {{ command.code }}
        </dd>
      </div>
      <div class="monitor-command-chain__cell">
        <dt>状态</dt>
        <dd
          class="monitor-command-chain__mono"
          data-test="monitor-command-chain-status"
        >
          {{ command.status }}
        </dd>
      </div>
      <div class="monitor-command-chain__cell">
        <dt>WES 下发</dt>
        <dd
          class="monitor-command-chain__mono"
          data-test="monitor-command-chain-sent-at"
        >
          {{ formatRuntimeDateTime(command.sentAt) }}
        </dd>
      </div>
      <div class="monitor-command-chain__cell">
        <dt>ECS ACK</dt>
        <dd
          class="monitor-command-chain__mono"
          data-test="monitor-command-chain-ack-at"
        >
          {{ formatRuntimeDateTime(command.ackReceivedAt) }}
        </dd>
      </div>
      <div
        v-if="command.ackCode != null || command.ackMessage"
        class="monitor-command-chain__cell monitor-command-chain__cell--full"
      >
        <dt>ACK 详情</dt>
        <dd
          class="monitor-command-chain__ack-detail"
          data-test="monitor-command-chain-ack-detail"
        >
          <span
            v-if="command.ackCode != null"
            class="monitor-command-chain__mono"
          >
            #{{ command.ackCode }}
          </span>
          <span v-if="command.ackMessage">
            {{ command.ackMessage }}
          </span>
        </dd>
      </div>
    </dl>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  RuntimeSceneCommandAckState,
  RuntimeSceneCommandSnapshotView
} from '@/utils/runtime-scene'
import { formatRuntimeDateTime } from '@/utils/runtime-display'

const props = defineProps<{
  command: RuntimeSceneCommandSnapshotView | null
}>()

const ACK_LABELS: Record<RuntimeSceneCommandAckState | 'idle', string> = {
  idle: '空闲',
  pending: '等待 ACK',
  acked: '已 ACK',
  rejected: '已拒绝',
  expired: '已过期',
  unknown: '未知'
}

const ackStateLabel = computed(() =>
  props.command ? ACK_LABELS[props.command.ackState] : ACK_LABELS.idle
)
</script>

<style scoped>
.monitor-command-chain {
  display: grid;
  gap: 10px;
  padding: 12px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.2));
  border-radius: 8px;
  background: var(--runtime-surface);
  color: var(--runtime-text);
}

.monitor-command-chain__header {
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.monitor-command-chain__title {
  color: var(--runtime-text);
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.monitor-command-chain__pill {
  padding: 2px 8px;
  border-radius: 999px;
  background: rgb(148, 163, 184, 0.16);
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.monitor-command-chain__pill--pending {
  background: rgb(var(--color-info-rgb) / 0.14);
  color: var(--color-info);
}

.monitor-command-chain__pill--acked {
  background: rgb(var(--color-success-rgb) / 0.14);
  color: var(--color-success);
}

.monitor-command-chain__pill--rejected {
  background: rgb(var(--color-danger-rgb) / 0.14);
  color: var(--color-danger);
}

.monitor-command-chain__pill--expired {
  background: rgb(var(--color-warning-rgb) / 0.14);
  color: #b45309;
}

.monitor-command-chain__idle {
  padding: 16px 12px;
  border: 1px dashed var(--runtime-border-subtle, rgb(148, 163, 184, 0.25));
  border-radius: 6px;
  color: var(--runtime-text-muted);
  font-size: 12px;
  text-align: center;
}

.monitor-command-chain__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  margin: 0;
}

.monitor-command-chain__cell {
  display: grid;
  gap: 4px;
  min-width: 0;
  padding: 8px 10px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.18));
  border-radius: 6px;
  background: rgb(15, 23, 42, 0.04);
}

.monitor-command-chain__cell--full {
  grid-column: span 2;
}

.monitor-command-chain__cell dt {
  margin: 0;
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.monitor-command-chain__cell dd {
  margin: 0;
  color: var(--runtime-text);
  font-size: 13px;
  overflow-wrap: anywhere;
}

.monitor-command-chain__mono {
  font-family: var(--font-mono, 'JetBrains Mono', monospace);
}

.monitor-command-chain__ack-detail {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: baseline;
}
</style>
