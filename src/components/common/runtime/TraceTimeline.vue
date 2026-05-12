<template>
  <div class="trace-timeline">
    <div
      v-for="(group, gi) in groupedItems"
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
          <!-- 头部：序号 + 时间 + 系统标记 -->
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

          <!-- 触发来源：是什么事件进入了 Inbox -->
          <div class="trace-timeline__trigger">
            <span class="trace-timeline__trigger-tag">{{ actionTypeLabel(item.action_type) }}</span>
            <!-- 只对 COMMAND_SENT 显示目标设备码，其他事件的 actor 是内部组件，对操作员无意义 -->
            <span
              v-if="item.action_type === 'COMMAND_SENT' && item.actor_code"
              class="trace-timeline__trigger-actor"
            >
              {{ item.actor_code }}
            </span>
          </div>

          <!-- 插件决策：到了哪个阶段，状态如何迁移 -->
          <div class="trace-timeline__decision">
            <div class="trace-timeline__title-row">
              <h4 class="trace-timeline__title">{{ translateStage(item.stage) }}</h4>
              <RuntimeStatusBadge
                :status="item.status"
                :tone="historicalTone(item)"
                size="small"
              />
            </div>
            <div
              v-if="item.from_status || item.to_status"
              class="trace-timeline__transition"
            >
              {{ transitionText(item) }}
            </div>
          </div>

          <!-- 补充说明 -->
          <p
            v-if="item.message"
            class="trace-timeline__message"
          >
            {{ item.message }}
          </p>
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
import { translateStage, translateSessionStatus } from '@/utils/runtime-labels'

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
      groups.push({ deviceCode: item.actor_code, deviceLabel: item.actor_code, items: [item] })
    } else if (last) {
      last.items.push(item)
    } else {
      // COMMAND_SENT 之前的初始系统处理步骤
      groups.push({ deviceCode: null, deviceLabel: '系统初始化', items: [item] })
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
  background: rgb(148, 163, 184, 0.12);
}

.trace-timeline__group-device {
  padding: 3px 12px;
  border: 1px solid rgb(148, 163, 184, 0.15);
  border-radius: 999px;
  background: rgb(15, 23, 42, 0.8);
  color: #64748b;
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
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
  background: #64748b;
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
  padding: 18px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 16px;
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
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.trace-timeline__time {
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.trace-timeline__trigger {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
  flex-wrap: wrap;
}

.trace-timeline__trigger-tag {
  display: inline-flex;
  align-items: center;
  padding: 3px 10px;
  border: 1px solid var(--runtime-border);
  border-radius: 999px;
  background: var(--runtime-surface);
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-weight: 600;
}

.trace-timeline__trigger-actor {
  color: var(--runtime-text-emphasis);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
}

.trace-timeline__decision {
  display: flex;
  flex-direction: column;
  gap: 6px;
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
  font-size: 18px;
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
  letter-spacing: 0.08em;
  text-transform: uppercase;
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

.trace-timeline__transition {
  color: var(--runtime-text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
}

.trace-timeline__message {
  margin-top: 14px;
  color: var(--runtime-text-primary);
  font-size: 13px;
  line-height: 1.7;
}

.trace-timeline__item.is-primary .trace-timeline__dot {
  background: #3b82f6;
}

.trace-timeline__item.is-success .trace-timeline__dot {
  background: #16a34a;
}

.trace-timeline__item.is-warning .trace-timeline__dot {
  background: #eab308;
}

.trace-timeline__item.is-danger .trace-timeline__dot {
  background: #dc2626;
}

.trace-timeline__item.is-terminal .trace-timeline__card {
  box-shadow: inset 0 0 0 1px rgb(59, 130, 246, 0.28);
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
  border-color: rgb(22, 163, 74, 0.22);
}

@media (width <= 1279px) {
  .trace-timeline__card-header {
    flex-direction: column;
    align-items: flex-start;
  }
}
</style>
