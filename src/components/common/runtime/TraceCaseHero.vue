<template>
  <el-card shadow="never" class="trace-case-hero">
    <div class="trace-case-hero__top">
      <div class="trace-case-hero__identity">
        <div class="trace-case-hero__eyebrow-row">
          <div class="trace-case-hero__eyebrow">案件摘要</div>
          <span class="trace-case-hero__code runtime-hero__code">Session #{{ detail.trace.session_id ?? '—' }}</span>
        </div>
        <div class="trace-case-hero__title-row">
          <h2 class="trace-case-hero__title">{{ sessionCode }}</h2>
          <RuntimeStatusBadge :status="detail.summary.session_status || detail.session?.status" pulse />
        </div>
        <p class="trace-case-hero__headline">{{ headline }}</p>
      </div>
    </div>

    <div class="trace-case-hero__facts runtime-hero__facts">
      <div class="trace-case-hero__fact runtime-hero__fact">
        <span>链路历时</span>
        <strong>{{ lifecycleDuration }}</strong>
      </div>
      <div class="trace-case-hero__fact runtime-hero__fact">
        <span>等待类型</span>
        <strong>{{ detail.summary.current_wait_type || detail.session?.current_wait_type || '—' }}</strong>
      </div>
      <div class="trace-case-hero__fact runtime-hero__fact">
        <span>最后动作</span>
        <strong>{{ compactEnumLabel(detail.summary.latest_timeline_action) }}</strong>
      </div>
      <div class="trace-case-hero__fact runtime-hero__fact">
        <span>当前 Step</span>
        <strong>{{ detail.summary.step_code || detail.session?.step_code || '—' }}</strong>
      </div>
      <div class="trace-case-hero__fact runtime-hero__fact">
        <span>失败域 / 失败码</span>
        <strong>{{ failureText }}</strong>
      </div>
      <div class="trace-case-hero__fact runtime-hero__fact">
        <span>工作线 / 设备</span>
        <strong>{{ worklineDeviceText }}</strong>
      </div>
      <div class="trace-case-hero__fact trace-case-hero__fact--wide runtime-hero__fact">
        <span>Request / Correlation</span>
        <strong>{{ anchorText }}</strong>
      </div>
    </div>

    <div class="trace-case-hero__counts runtime-hero__counts">
      <div v-for="item in counts" :key="item.label" class="trace-case-hero__count-card runtime-hero__count-card">
        <span>{{ item.label }}</span>
        <strong>{{ item.value }}</strong>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { TraceDetailResponse } from '@/types/runtime'
import { compactEnumLabel, formatRuntimeCount, formatRuntimeElapsed } from '@/utils/runtime-display'

const props = defineProps<{
  detail: TraceDetailResponse
  worklineName?: string | null
  deviceName?: string | null
}>()

const sessionCode = computed(() => props.detail.session?.session_code || `SES-${props.detail.trace.session_id ?? '—'}`)

const headline = computed(() => {
  return props.detail.summary.latest_timeline_message || props.detail.session?.failure_message || '沿时间轴查看最后成功节点与第一处异常证据。'
})

const lifecycleDuration = computed(() => {
  return formatRuntimeElapsed(props.detail.session?.started_at, props.detail.session?.ended_at)
})

const failureText = computed(() => {
  const parts = [props.detail.session?.failure_domain, props.detail.session?.failure_code].filter(Boolean)
  return parts.length ? parts.join(' / ') : '—'
})

const worklineDeviceText = computed(() => {
  const line = props.worklineName || (props.detail.trace.workline_id ? `工作线 #${props.detail.trace.workline_id}` : null)
  const device = props.deviceName || props.detail.trace.device_code || (props.detail.trace.device_id ? `设备 #${props.detail.trace.device_id}` : null)
  return [line, device].filter(Boolean).join(' · ') || '—'
})

const anchorText = computed(() => {
  return [props.detail.trace.request_id, props.detail.trace.correlation_id].filter(Boolean).join(' · ') || '—'
})

const counts = computed(() => [
  { label: 'Timeline', value: formatRuntimeCount(props.detail.summary.timelines) },
  { label: 'Callback', value: formatRuntimeCount(props.detail.summary.callback_logs) },
  { label: 'Inbox', value: formatRuntimeCount(props.detail.summary.inboxes) },
  { label: 'Command', value: formatRuntimeCount(props.detail.summary.commands) },
  { label: 'Outbox', value: formatRuntimeCount(props.detail.summary.outboxes) },
  { label: 'Diagnostics', value: formatRuntimeCount(props.detail.summary.diagnostics) }
])
</script>

<style scoped>
.trace-case-hero {
  overflow: hidden;
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 16px;
  background:
    radial-gradient(circle at top right, rgb(245, 158, 11, 0.12), transparent 32%),
    linear-gradient(180deg, rgb(30, 41, 59, 0.96), rgb(15, 23, 42, 0.94));
}

.trace-case-hero :deep(.el-card__body) {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 18px;
}

.trace-case-hero__top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.trace-case-hero__identity {
  min-width: 0;
}

.trace-case-hero__eyebrow-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.trace-case-hero__eyebrow,
.trace-case-hero__metric-label,
.trace-case-hero__fact span,
.trace-case-hero__count-card span {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.trace-case-hero__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
  flex-wrap: wrap;
}

.trace-case-hero__title {
  margin: 0;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 24px;
  line-height: 1.2;
}

.trace-case-hero__headline {
  max-width: 880px;
  margin: 8px 0 0;
  color: #e2e8f0;
  font-size: 13px;
  line-height: 1.6;
}

.trace-case-hero__fact strong,
.trace-case-hero__count-card strong {
  display: block;
  margin-top: 6px;
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 13px;
  line-height: 1.45;
  overflow-wrap: anywhere;
}

.trace-case-hero__facts {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.trace-case-hero__fact--wide {
  grid-column: span 2;
}

.trace-case-hero__counts {
  grid-template-columns: repeat(6, minmax(0, 1fr));
}

@media (width <= 1279px) {
  .trace-case-hero__title {
    font-size: 22px;
  }

  .trace-case-hero__facts,
  .trace-case-hero__counts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .trace-case-hero__fact--wide {
    grid-column: auto;
  }
}

@media (width <= 767px) {
  .trace-case-hero :deep(.el-card__body) {
    padding: 16px;
  }

  .trace-case-hero__facts,
  .trace-case-hero__counts {
    grid-template-columns: 1fr;
  }
}
</style>
