<template>
  <div
    class="decision-strip"
    :class="[`decision-strip--${tone}`]"
  >
    <div class="decision-strip__indicator" />

    <div class="decision-strip__body">
      <div class="decision-strip__row">
        <span class="decision-strip__label">{{ label }}</span>
        <span class="decision-strip__counts">
          <span
            v-if="activeHoldCount > 0"
            class="decision-strip__count decision-strip__count--danger"
          >
            Hold {{ activeHoldCount }}
          </span>
          <span
            v-if="blockedOutboxCount > 0"
            class="decision-strip__count decision-strip__count--warning"
          >
            停靠 {{ blockedOutboxCount }}
          </span>
          <span
            v-if="openCommandCount > 0"
            class="decision-strip__count decision-strip__count--primary"
          >
            未完成 {{ openCommandCount }}
          </span>
          <span class="decision-strip__count decision-strip__count--danger">
            失败 {{ summary.failed_session_count }}
          </span>
          <span class="decision-strip__count decision-strip__count--danger">
            离线 {{ summary.offline_device_count }}
          </span>
          <span class="decision-strip__count decision-strip__count--warning">
            等待 {{ summary.waiting_session_count }}
          </span>
          <span class="decision-strip__count decision-strip__count--primary">
            活跃 {{ summary.active_session_count }}
          </span>
        </span>
      </div>
      <div class="decision-strip__suggestion">{{ suggestion }}</div>
    </div>

    <RouterLink
      v-if="firstRuntimeHoldId"
      class="decision-strip__hold-entry"
      :to="{ name: 'RuntimeHoldDetail', params: { holdId: firstRuntimeHoldId } }"
    >
      进入 Hold
    </RouterLink>

    <el-tooltip
      placement="bottom-end"
      :show-after="300"
    >
      <template #content>
        <div class="decision-strip__tooltip">
          <div v-if="hotspotDevice">
            焦点设备: {{ hotspotDevice.device_name }} ({{
              hotspotDevice.error_code || hotspotDevice.device_status
            }})
          </div>
          <div v-if="mostFailedBusinessStage">高频失败业务阶段: {{ mostFailedBusinessStage }}</div>
          <div v-if="dominantActiveBusinessStage">
            主要等待业务阶段: {{ dominantActiveBusinessStage }}
          </div>
          <div>插件: {{ summary.plugin_key || '—' }}</div>
        </div>
      </template>
      <span class="decision-strip__more">...</span>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { STOPPED_RUNTIME_STATUS } from '@/constants/runtime-safety'
import type {
  RuntimeWorklineMonitorProjectionResponse,
  RuntimeWorklineSummary
} from '@/types/runtime'
import { pickDominantValue, resolveRuntimeProgressLabel } from '@/utils/runtime-display'
import { getWorklineRuntimeVerdict } from '@/utils/runtime-safety'
import type { RuntimeTone } from '@/utils/runtime-display'

const props = defineProps<{
  summary: RuntimeWorklineSummary
  projection?: RuntimeWorklineMonitorProjectionResponse | null
}>()

const runtimeVerdict = computed(() => getWorklineRuntimeVerdict(props.summary))
const stoppedWaitingForStart = computed(
  () => props.summary.runtime_status === STOPPED_RUNTIME_STATUS
)

const tone = computed<RuntimeTone>(() => {
  if (stoppedWaitingForStart.value) {
    return 'warning'
  }
  if (activeHoldCount.value > 0 || openIssueCount.value > 0) {
    return 'danger'
  }
  if (
    props.summary.failed_session_count > 0 ||
    props.summary.offline_device_count > 0 ||
    props.summary.error_device_count > 0
  ) {
    return 'danger'
  }
  if (props.summary.waiting_session_count > 0 || props.summary.maintenance_device_count > 0) {
    return 'warning'
  }
  if (props.summary.active_session_count > 0) {
    return 'primary'
  }
  return 'success'
})

const label = computed(() => {
  if (stoppedWaitingForStart.value) return runtimeVerdict.value.label
  if (tone.value === 'danger') return '存在阻塞'
  if (tone.value === 'warning') return '有等待风险'
  if (tone.value === 'primary') return '运行中'
  return '稳定'
})

const suggestion = computed(() => {
  if (stoppedWaitingForStart.value) {
    const message = props.summary.start_admission_message
    if (props.summary.start_admission_status === 'FAILED' && message) {
      return message
    }
    if (props.summary.start_admission_status === 'CHECKING') {
      return '正在检查设备 AUTO/IDLE，检查通过后才接收生产事件'
    }
    return '软件冻结已解除，现场硬件 START 后才接收生产事件'
  }
  if (activeHoldCount.value > 0) {
    return `${activeHoldCount.value} 个 Runtime Hold 待处置，先确认线体能否继续，再决定继续或退回 NG`
  }
  if (blockedOutboxCount.value > 0) {
    return `${blockedOutboxCount.value} 条出站命令已停靠，等待下游设备空闲后补发`
  }
  if (openCommandCount.value > 0) {
    return `${openCommandCount.value} 条设备命令未完成，按节点检查 ACK/RESULT`
  }
  if (props.summary.failed_session_count > 0) {
    return `${props.summary.failed_session_count} 条失败链路需要优先排障`
  }
  if (props.summary.offline_device_count > 0) {
    return `${props.summary.offline_device_count} 台设备离线，检查网络或维护状态`
  }
  if (props.summary.waiting_session_count > 0) {
    return `${props.summary.waiting_session_count} 条链路等待中，确认设备响应`
  }
  if (props.summary.active_session_count > 0) {
    return '链路正常推进中'
  }
  return '当前无作业活动'
})

const hotspotDevice = computed(() => {
  const devices = props.projection?.device_nodes ?? []
  return (
    devices.find(item => ['ERROR', 'OFFLINE'].includes(item.device_status)) ??
    devices.find(item => Boolean(item.error_code)) ??
    null
  )
})

const mostFailedBusinessStage = computed(() =>
  pickDominantValue(
    props.projection?.recent_failed_traces.items?.map(resolveRuntimeProgressLabel) ?? []
  )
)

const dominantActiveBusinessStage = computed(() =>
  pickDominantValue(props.projection?.active_sessions.items?.map(resolveRuntimeProgressLabel) ?? [])
)

const activeRuntimeHoldIds = computed(() => {
  const ids = new Set<number>()
  for (const device of props.projection?.device_nodes ?? []) {
    for (const holdId of device.active_runtime_hold_ids ?? []) {
      ids.add(holdId)
    }
  }
  return Array.from(ids)
})

const firstRuntimeHoldId = computed(() => activeRuntimeHoldIds.value[0] ?? null)
const activeHoldCount = computed(() => activeRuntimeHoldIds.value.length)
const openIssueCount = computed(() =>
  (props.projection?.device_nodes ?? []).reduce(
    (total, device) => total + (device.open_issue_count ?? 0),
    0
  )
)
const blockedOutboxCount = computed(() =>
  (props.projection?.device_nodes ?? []).reduce(
    (total, device) => total + (device.blocked_outbox_count ?? 0),
    0
  )
)
const openCommandCount = computed(() =>
  (props.projection?.device_nodes ?? []).reduce(
    (total, device) => total + (device.open_command_count ?? device.pending_command_count ?? 0),
    0
  )
)
</script>

<style scoped>
.decision-strip {
  display: flex;
  align-items: stretch;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid var(--runtime-border, rgb(var(--color-primary-rgb) / 0.12));
  background: var(--runtime-surface, rgb(var(--color-industrial-dark-surface-rgb) / 0.8));
}

.decision-strip__indicator {
  width: 4px;
  flex-shrink: 0;
}
.decision-strip--danger .decision-strip__indicator {
  background: var(--color-danger-light);
}
.decision-strip--warning .decision-strip__indicator {
  background: var(--color-warning);
}
.decision-strip--primary .decision-strip__indicator {
  background: var(--color-info);
}
.decision-strip--success .decision-strip__indicator {
  background: var(--color-success-light);
}

.decision-strip__body {
  flex: 1;
  min-width: 0;
  padding: 10px 14px;
}

.decision-strip__row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.decision-strip__label {
  color: var(--color-industrial-dark-text);
  font-size: 14px;
  font-weight: 700;
  flex-shrink: 0;
}

.decision-strip--danger .decision-strip__label {
  color: var(--color-danger-light);
}
.decision-strip--warning .decision-strip__label {
  color: var(--color-warning-light);
}

.decision-strip__counts {
  display: flex;
  gap: 12px;
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.decision-strip__count {
  white-space: nowrap;
}
.decision-strip__count--danger {
  color: var(--color-danger-light);
}
.decision-strip__count--warning {
  color: var(--color-warning-light);
}
.decision-strip__count--primary {
  color: var(--color-info-light);
}

.decision-strip__suggestion {
  margin-top: 4px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.4;
}

.decision-strip__more {
  display: flex;
  align-items: center;
  padding: 0 10px;
  color: var(--runtime-text-secondary);
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 2px;
  cursor: help;
  user-select: none;
}

.decision-strip__hold-entry {
  display: inline-flex;
  align-items: center;
  min-height: 44px;
  padding: 0 14px;
  border-left: 1px solid rgb(239, 68, 68, 0.22);
  color: var(--color-danger-light);
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;
}

.decision-strip__hold-entry:hover {
  background: rgb(239, 68, 68, 0.1);
}

.decision-strip__tooltip {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  line-height: 1.5;
}

@media (width <= 1279px) {
  .decision-strip__counts {
    gap: 8px;
    font-size: 11px;
  }
}
</style>
