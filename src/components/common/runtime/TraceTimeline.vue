<template>
  <div class="trace-timeline">
    <div v-for="item in sortedItems" :key="item.id" class="trace-timeline__item" :class="itemClasses(item)">
      <div class="trace-timeline__rail">
        <span class="trace-timeline__dot" />
        <span class="trace-timeline__line" />
      </div>

      <article class="trace-timeline__card">
        <div class="trace-timeline__card-top">
          <div>
            <div class="trace-timeline__time">{{ formatRuntimeDateTime(item.occurred_at) }}</div>
            <div class="trace-timeline__title-row">
              <h4 class="trace-timeline__title">{{ compactEnumLabel(item.stage) }}</h4>
              <RuntimeStatusBadge :status="item.status" size="small" />
            </div>
          </div>

          <div class="trace-timeline__labels">
            <span v-if="lastSuccessId === item.id" class="trace-timeline__marker trace-timeline__marker--success">最后成功</span>
            <span v-if="firstFailureId === item.id" class="trace-timeline__marker trace-timeline__marker--danger">首次失败</span>
            <span v-if="terminalId === item.id" class="trace-timeline__marker trace-timeline__marker--primary">当前终态</span>
          </div>
        </div>

        <div class="trace-timeline__summary">
          <div class="trace-timeline__summary-item">
            <span>动作</span>
            <strong>{{ compactEnumLabel(item.action_type) }}</strong>
          </div>
          <div class="trace-timeline__summary-item">
            <span>Actor</span>
            <strong>{{ [compactEnumLabel(item.actor_type), item.actor_code].filter(Boolean).join(' · ') || '—' }}</strong>
          </div>
          <div class="trace-timeline__summary-item">
            <span>状态转移</span>
            <strong>{{ transitionText(item) }}</strong>
          </div>
        </div>

        <p v-if="item.message" class="trace-timeline__message">{{ item.message }}</p>
        <p v-else class="trace-timeline__message trace-timeline__message--muted">暂无额外消息，继续查看证据面板。</p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { TraceTimelineItem } from '@/types/runtime'
import { compactEnumLabel, isFailureStatus, resolveRuntimeTone, formatRuntimeDateTime } from '@/utils/runtime-display'

const props = withDefaults(
  defineProps<{
    items?: TraceTimelineItem[]
  }>(),
  {
    items: () => []
  }
)

const sortedItems = computed(() => [...props.items].sort((left, right) => left.seq_no - right.seq_no || left.id - right.id))

const terminalId = computed(() => {
  const lastItem = sortedItems.value[sortedItems.value.length - 1]
  return lastItem?.id ?? null
})

const firstFailureId = computed(() => {
  return sortedItems.value.find(item => isFailureStatus(item.status) || Boolean(item.failure_domain))?.id ?? null
})

const lastSuccessId = computed(() => {
  const targetItems = firstFailureId.value
    ? sortedItems.value.filter(item => item.id !== firstFailureId.value)
    : sortedItems.value

  const reversed = [...targetItems].reverse()
  return reversed.find(item => ['success', 'primary'].includes(resolveRuntimeTone(item.status)))?.id ?? null
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

function transitionText(item: TraceTimelineItem) {
  if (item.from_status && item.to_status) {
    return `${compactEnumLabel(item.from_status)} → ${compactEnumLabel(item.to_status)}`
  }

  if (item.to_status) {
    return compactEnumLabel(item.to_status)
  }

  return '—'
}
</script>

<style scoped>
.trace-timeline {
  display: flex;
  flex-direction: column;
  gap: 14px;
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
  box-shadow: 0 0 0 4px rgb(15, 23, 42, 0.96);
}

.trace-timeline__line {
  position: absolute;
  top: 0;
  bottom: -14px;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: rgb(148, 163, 184, 0.16);
}

.trace-timeline__item:last-child .trace-timeline__line {
  display: none;
}

.trace-timeline__card {
  padding: 18px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 16px;
  background: rgb(30, 41, 59, 0.92);
}

.trace-timeline__card-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.trace-timeline__time,
.trace-timeline__summary-item span {
  color: #94a3b8;
  font-size: 12px;
}

.trace-timeline__title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.trace-timeline__title {
  margin: 0;
  color: #f8fafc;
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
  background: rgb(22, 163, 74, 0.14);
  color: #4ade80;
}

.trace-timeline__marker--danger {
  background: rgb(220, 38, 38, 0.14);
  color: #f87171;
}

.trace-timeline__marker--primary {
  background: rgb(59, 130, 246, 0.14);
  color: #60a5fa;
}

.trace-timeline__summary {
  display: grid;
  gap: 12px;
  margin-top: 14px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.trace-timeline__summary-item strong {
  display: block;
  margin-top: 6px;
  color: #e2e8f0;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.5;
}

.trace-timeline__message {
  margin-top: 14px;
  color: #f8fafc;
  line-height: 1.7;
}

.trace-timeline__message--muted {
  color: #94a3b8;
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
  border-color: rgb(220, 38, 38, 0.28);
  background: rgb(127, 29, 29, 0.14);
}

.trace-timeline__item.is-last-success .trace-timeline__card {
  border-color: rgb(22, 163, 74, 0.22);
}

@media (width <= 1279px) {
  .trace-timeline__card-top,
  .trace-timeline__summary {
    grid-template-columns: 1fr;
  }

  .trace-timeline__card-top {
    flex-direction: column;
  }
}
</style>
