<template>
  <div class="trace-timeline">
    <div
      v-if="!sortedItems.length"
      class="trace-timeline__empty"
    >
      <strong>暂无过程记录</strong>
      <p>当前案件没有过程事件记录，系统已根据会话状态给出诊断结论。</p>
    </div>

    <div
      v-for="(group, gi) in groupedItems"
      v-else
      :key="gi"
      class="trace-timeline__group"
    >
      <!-- 设备段标识 -->
      <div class="trace-timeline__group-header">
        <span class="trace-timeline__group-device">{{ group.deviceLabel }}</span>
      </div>

      <div
        v-for="item in group.items"
        :key="item.id"
        class="trace-timeline__item"
        :class="itemClasses(item)"
      >
        <div class="trace-timeline__rail">
          <span class="trace-timeline__dot" />
          <span class="trace-timeline__line" />
        </div>

        <article class="trace-timeline__card">
          <div class="trace-timeline__card-header">
            <div class="trace-timeline__header-left">
              <span class="trace-timeline__seq">第 {{ item.seq_no }} 步</span>
              <span class="trace-timeline__time">
                {{ formatRuntimeDateTime(item.occurred_at) }}
              </span>
            </div>
            <div class="trace-timeline__labels">
              <span
                v-if="lastSuccessId === item.id"
                class="trace-timeline__marker trace-timeline__marker--success"
              >
                最后成功
              </span>
              <span
                v-if="firstFailureId === item.id"
                class="trace-timeline__marker trace-timeline__marker--danger"
              >
                首次失败
              </span>
              <span
                v-if="terminalId === item.id"
                class="trace-timeline__marker trace-timeline__marker--primary"
              >
                当前终态
              </span>
            </div>
          </div>

          <div class="trace-timeline__event">
            <div class="trace-timeline__title-row">
              <h4 class="trace-timeline__title">{{ eventTitle(item) }}</h4>
              <RuntimeStatusBadge
                :status="item.status"
                :label="statusLabel(item.status)"
                :tone="historicalTone(item)"
                size="small"
              />
            </div>
            <p class="trace-timeline__description">
              {{ eventDescription(item) }}
            </p>
          </div>

          <dl
            v-if="eventFacts(item).length"
            class="trace-timeline__facts"
          >
            <div
              v-for="fact in eventFacts(item)"
              :key="fact.label"
              class="trace-timeline__fact"
            >
              <dt>{{ fact.label }}</dt>
              <dd>{{ fact.value }}</dd>
            </div>
          </dl>

          <details class="trace-timeline__tech">
            <summary>技术细节</summary>
            <dl class="trace-timeline__tech-grid">
              <div>
                <dt>Action</dt>
                <dd>{{ item.action_type }}</dd>
              </div>
              <div>
                <dt>Stage</dt>
                <dd>{{ item.stage }}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{{ item.status }}</dd>
              </div>
              <div v-if="item.actor_code">
                <dt>Actor</dt>
                <dd>{{ item.actor_code }}</dd>
              </div>
              <div v-if="item.trace_id">
                <dt>Trace</dt>
                <dd>{{ item.trace_id }}</dd>
              </div>
              <div v-if="item.related_command_id">
                <dt>Command</dt>
                <dd>#{{ item.related_command_id }}</dd>
              </div>
              <div v-if="payloadText(item)">
                <dt>Payload</dt>
                <dd>
                  <pre>{{ payloadText(item) }}</pre>
                </dd>
              </div>
            </dl>
          </details>
        </article>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { TraceTimelineItem } from '@/types/runtime'
import {
  compactEnumLabel,
  isFailureStatus,
  resolveRuntimeTone,
  formatRuntimeDateTime,
  type RuntimeTone
} from '@/utils/runtime-display'
import {
  translateAction,
  translateFailureDomain,
  translateSessionStatus
} from '@/utils/runtime-labels'

const props = withDefaults(
  defineProps<{
    items?: TraceTimelineItem[]
  }>(),
  {
    items: () => []
  }
)

const sortedItems = computed(() =>
  [...props.items].sort((left, right) => left.seq_no - right.seq_no || left.id - right.id)
)

interface TimelineGroup {
  deviceCode: string | null
  deviceLabel: string
  items: TraceTimelineItem[]
}

const groupedItems = computed((): TimelineGroup[] => {
  const groups: TimelineGroup[] = []

  for (const item of sortedItems.value) {
    const last = groups[groups.length - 1]

    // 只有 COMMAND_SENT 且有目标设备 actor_code 时才开启新的设备段
    if (
      item.action_type === 'COMMAND_SENT' &&
      item.actor_code &&
      item.actor_code !== last?.deviceCode
    ) {
      groups.push({
        deviceCode: item.actor_code,
        deviceLabel: `设备 ${item.actor_code}`,
        items: [item]
      })
    } else if (last) {
      last.items.push(item)
    } else {
      groups.push({ deviceCode: null, deviceLabel: '系统处理', items: [item] })
    }
  }

  return groups
})

const terminalId = computed(() => {
  const lastItem = sortedItems.value[sortedItems.value.length - 1]
  return lastItem?.id ?? null
})

const firstFailureId = computed(() => {
  return (
    sortedItems.value.find(item => isFailureStatus(item.status) || Boolean(item.failure_domain))
      ?.id ?? null
  )
})

const lastSuccessId = computed(() => {
  const targetItems = firstFailureId.value
    ? sortedItems.value.filter(item => item.id !== firstFailureId.value)
    : sortedItems.value

  const reversed = [...targetItems].reverse()
  return (
    reversed.find(item => ['success', 'primary'].includes(resolveRuntimeTone(item.status)))?.id ??
    null
  )
})

function itemClasses(item: TraceTimelineItem) {
  const tone = resolveRuntimeTone(item.status)
  return {
    'is-terminal': terminalId.value === item.id,
    'is-first-failure': firstFailureId.value === item.id,
    'is-last-success': lastSuccessId.value === item.id,
    [`is-${tone}`]: true
  }
}

function historicalTone(item: TraceTimelineItem): RuntimeTone {
  const base = resolveRuntimeTone(item.status)
  // 历史中间步骤：warning(PENDING/WAITING) 不代表「当前仍在等待」，降级为 info 避免误读
  if (base === 'warning' && item.id !== terminalId.value && item.id !== firstFailureId.value) {
    return 'info'
  }
  return base
}

function transitionText(item: TraceTimelineItem) {
  if (item.from_status && item.to_status) {
    return `${translateSessionStatus(item.from_status)} → ${translateSessionStatus(item.to_status)}`
  }

  if (item.to_status) {
    return translateSessionStatus(item.to_status)
  }

  return '—'
}

function statusLabel(status?: string | null): string {
  return translateSessionStatus(status) || compactEnumLabel(status) || '—'
}

function eventTitle(item: TraceTimelineItem): string {
  const map: Record<string, string> = {
    SESSION_CREATED: '收到任务',
    SESSION_STARTED: '开始处理',
    SESSION_RESUMED: '恢复处理',
    DECISION_MADE: '系统完成决策',
    COMMAND_SENT: '下发设备动作',
    COMMAND_ACKED: '设备已确认',
    COMMAND_COMPLETED: '设备动作完成',
    COMMAND_FAILED: '设备动作失败',
    WAIT_STARTED: '等待设备回报',
    WAIT_RESUMED: '继续等待设备回报',
    WAIT_TIMEOUT: '等待超时',
    TIMER_TIMEOUT: '等待超时',
    EVENT_RECEIVED: '收到设备回报',
    EVENT_PROCESSED: '设备回报已处理',
    EVENT_FAILED: '设备回报处理失败',
    SESSION_COMPLETED: '流程完成',
    SESSION_FAILED: '流程终止',
    SESSION_CANCELLED: '流程取消',
    ERROR_OCCURRED: '处理异常',
    MANUAL_HOLD: '转入人工处理',
    MANUAL_OPERATION: '人工处理',
    MANUAL_CANCEL: '人工取消',
    MANUAL_RESUME: '恢复自动处理',
    INTERNAL_SIGNAL: '系统内部通知'
  }

  return (
    map[item.action_type] ?? translateAction(item.action_type) ?? actionTypeLabel(item.action_type)
  )
}

function eventDescription(item: TraceTimelineItem): string {
  if (isFailureStatus(item.status) && item.message) {
    return item.message
  }

  const actor = item.actor_code ? ` ${item.actor_code}` : ''

  const map: Record<string, string> = {
    SESSION_CREATED: '系统已建立案件会话，准备接收后续处理步骤。',
    SESSION_STARTED: '案件进入运行处理，系统开始推进流程。',
    SESSION_RESUMED: '案件从暂停状态恢复，系统继续推进流程。',
    DECISION_MADE: '系统已根据当前案件上下文选择下一步动作。',
    COMMAND_SENT: item.actor_code
      ? `已发送给 ${item.actor_code}，等待设备执行和回报。`
      : '已向目标设备下发动作，等待设备执行和回报。',
    COMMAND_ACKED: `设备${actor}已确认收到动作。`,
    COMMAND_COMPLETED: `设备${actor}动作已完成，系统继续推进后续流程。`,
    COMMAND_FAILED: item.message || `设备${actor}动作未完成，需要查看异常原因。`,
    WAIT_STARTED: item.actor_code
      ? `正在等待 ${item.actor_code} 回报执行结果。`
      : '正在等待设备回报执行结果。',
    WAIT_RESUMED: item.actor_code
      ? `继续等待 ${item.actor_code} 回报执行结果。`
      : '继续等待设备回报执行结果。',
    WAIT_TIMEOUT: item.message || '超过预期时间仍未收到回报，需要确认设备或链路状态。',
    TIMER_TIMEOUT: item.message || '超过预期时间仍未收到回报，需要确认设备或链路状态。',
    EVENT_RECEIVED: item.actor_code
      ? `已收到 ${item.actor_code} 的回报，系统开始处理。`
      : '已收到设备回报，系统开始处理。',
    EVENT_PROCESSED: '设备回报已纳入案件记录。',
    EVENT_FAILED: item.message || '设备回报未能正常处理，需要查看异常原因。',
    SESSION_COMPLETED: '全部已记录步骤结束，当前案件已完成。',
    SESSION_FAILED: item.message || '流程已停止，需要按诊断结论处理。',
    SESSION_CANCELLED: '流程已取消，后续动作不会继续执行。',
    ERROR_OCCURRED: item.message || '处理过程中出现异常，需要查看诊断结论。',
    MANUAL_HOLD: item.message || '系统已暂停自动推进，等待人工确认。',
    MANUAL_OPERATION: item.message || '该步骤由人工介入处理。',
    MANUAL_CANCEL: item.message || '人工取消了当前流程。',
    MANUAL_RESUME: item.message || '人工确认后，系统恢复自动推进。',
    INTERNAL_SIGNAL: item.message || '系统记录了一次内部状态通知。'
  }

  return (
    map[item.action_type] ??
    item.message ??
    `${translateAction(item.action_type) || '该步骤'}已记录。`
  )
}

function eventFacts(item: TraceTimelineItem): Array<{ label: string; value: string }> {
  const facts: Array<{ label: string; value: string }> = []

  if (item.from_status || item.to_status) {
    facts.push({ label: '状态变化', value: transitionText(item) })
  }

  if (item.failure_domain) {
    facts.push({ label: '异常类型', value: translateFailureDomain(item.failure_domain) })
  }

  if (item.actor_code && item.action_type !== 'COMMAND_SENT') {
    facts.push({ label: '相关设备', value: item.actor_code })
  }

  return facts
}

function payloadText(item: TraceTimelineItem): string {
  if (!item.payload_json || !Object.keys(item.payload_json).length) {
    return ''
  }

  return JSON.stringify(item.payload_json, null, 2)
}

function actionTypeLabel(type?: string | null): string {
  const map: Record<string, string> = {
    // 编排器 / 插件内部事件（实际记录的类型）
    DECISION_MADE: '插件决策',
    COMMAND_SENT: '下发命令',
    WAIT_STARTED: '等待设备响应',
    SESSION_FAILED: '流程终止',
    SESSION_COMPLETED: '流程完成',
    SESSION_CANCELLED: '流程取消',
    // 设备 / 外部触发类型（保留以防后续使用）
    DEVICE_EVENT: '设备主动上报',
    COMMAND_RESULT: '命令执行回调',
    EXTERNAL_HTTP: '外部系统回调',
    TIMER_TIMEOUT: '等待超时',
    MANUAL_OPERATION: '人工操作',
    MANUAL_CANCEL: '人工取消',
    MANUAL_RESUME: '人工恢复',
    MANUAL_HOLD: '人工暂停',
    INTERNAL_SIGNAL: '内部信号'
  }
  return map[type ?? ''] || compactEnumLabel(type) || '—'
}
</script>

<style scoped>
.trace-timeline {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.trace-timeline__empty {
  padding: 22px;
  border: 1px dashed rgb(var(--color-industrial-dark-text-secondary-rgb) / 0.22);
  border-radius: 8px;
  background: rgb(var(--color-industrial-dark-bg-rgb) / 0.46);
}

.trace-timeline__empty strong {
  display: block;
  color: var(--runtime-text-primary);
  font-size: 15px;
}

.trace-timeline__empty p {
  margin: 8px 0 0;
  color: var(--runtime-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.trace-timeline__group {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: 6px;
}

.trace-timeline__group + .trace-timeline__group {
  padding-top: 10px;
}

.trace-timeline__group-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 4px 0;
}

.trace-timeline__group-header::before,
.trace-timeline__group-header::after {
  content: '';
  flex: 1;
  height: 1px;
  background: rgb(var(--color-industrial-dark-text-secondary-rgb) / 0.12);
}

.trace-timeline__group-device {
  padding: 3px 12px;
  border: 1px solid rgb(var(--color-industrial-dark-text-secondary-rgb) / 0.15);
  border-radius: 999px;
  background: rgb(var(--color-industrial-dark-bg-rgb) / 0.8);
  color: var(--runtime-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
  white-space: nowrap;
}

.trace-timeline__item {
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr);
  gap: 14px;
}

.trace-timeline__rail {
  position: relative;
  display: flex;
  justify-content: center;
}

.trace-timeline__dot {
  position: relative;
  z-index: 1;
  width: 12px;
  height: 12px;
  margin-top: 22px;
  border-radius: 999px;
  background: var(--color-industrial-dark-text-muted);
  box-shadow: 0 0 0 4px var(--runtime-dot-ring);
}

.trace-timeline__line {
  position: absolute;
  top: 0;
  bottom: -14px;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: var(--runtime-rail);
}

.trace-timeline__item:last-child .trace-timeline__line {
  display: none;
}

.trace-timeline__card {
  padding: 16px;
  border: 1px solid rgb(var(--color-primary-rgb) / 0.12);
  border-radius: 8px;
  background: var(--runtime-surface-strong);
}

.trace-timeline__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.trace-timeline__header-left {
  display: flex;
  align-items: center;
  gap: 10px;
}

.trace-timeline__seq {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0;
}

.trace-timeline__time {
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.trace-timeline__event {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trace-timeline__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.trace-timeline__title {
  margin: 0;
  color: var(--runtime-text-primary);
  font-size: 16px;
  line-height: 1.35;
}

.trace-timeline__labels {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.trace-timeline__marker {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0;
}

.trace-timeline__marker--success {
  background: var(--runtime-badge-success-bg);
  color: var(--runtime-badge-success-text);
}

.trace-timeline__marker--danger {
  background: var(--runtime-badge-danger-bg);
  color: var(--runtime-badge-danger-text);
}

.trace-timeline__marker--primary {
  background: var(--runtime-badge-info-bg);
  color: var(--runtime-badge-info-text);
}

.trace-timeline__description {
  margin: 0;
  color: var(--runtime-text-secondary);
  font-size: 13px;
  line-height: 1.65;
}

.trace-timeline__facts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 16px;
  margin: 14px 0 0;
}

.trace-timeline__fact {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.trace-timeline__fact dt {
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.trace-timeline__fact dd {
  margin: 0;
  color: var(--runtime-text-primary);
  font-size: 12px;
  font-weight: 600;
}

.trace-timeline__tech {
  margin-top: 14px;
  border-top: 1px solid rgb(var(--color-industrial-dark-text-secondary-rgb) / 0.1);
  padding-top: 10px;
}

.trace-timeline__tech summary {
  width: max-content;
  cursor: pointer;
  color: var(--runtime-text-muted);
  font-size: 12px;
}

.trace-timeline__tech-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 16px;
  margin: 10px 0 0;
}

.trace-timeline__tech-grid div {
  min-width: 0;
}

.trace-timeline__tech-grid dt {
  color: var(--runtime-text-muted);
  font-size: 11px;
}

.trace-timeline__tech-grid dd {
  margin: 2px 0 0;
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  overflow-wrap: anywhere;
}

.trace-timeline__tech-grid pre {
  max-height: 180px;
  margin: 0;
  overflow: auto;
  color: inherit;
  font: inherit;
  white-space: pre-wrap;
}

.trace-timeline__item.is-primary .trace-timeline__dot {
  background: var(--color-info);
}

.trace-timeline__item.is-success .trace-timeline__dot {
  background: var(--color-success);
}

.trace-timeline__item.is-warning .trace-timeline__dot {
  background: var(--color-warning);
}

.trace-timeline__item.is-danger .trace-timeline__dot {
  background: var(--color-danger);
}

.trace-timeline__item.is-terminal .trace-timeline__card {
  box-shadow: inset 0 0 0 1px rgb(var(--color-info-rgb) / 0.28);
}

.trace-timeline__item.is-first-failure .trace-timeline__card {
  border-color: var(--runtime-border-danger);
  border-left: 3px solid var(--runtime-border-danger);
  background: var(--runtime-surface-danger);
}

.trace-timeline__item.is-first-failure .trace-timeline__title {
  color: var(--runtime-badge-danger-text);
  font-size: 20px;
}

.trace-timeline__item.is-last-success .trace-timeline__card {
  border-color: rgb(var(--color-success-rgb) / 0.22);
}

@media (width <= 1279px) {
  .trace-timeline__card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
