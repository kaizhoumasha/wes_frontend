<template>
  <el-card
    shadow="never"
    class="trace-case-hero"
  >
    <div class="trace-case-hero__top">
      <div class="trace-case-hero__identity">
        <div class="trace-case-hero__eyebrow-row runtime-hero__eyebrow-row">
          <div class="trace-case-hero__eyebrow">{{ heroEyebrow }}</div>
          <span class="trace-case-hero__code runtime-hero__code">{{ heroSubCode }}</span>
        </div>
        <div class="trace-case-hero__title-row runtime-hero__title-row">
          <h2 class="trace-case-hero__title">{{ heroTitle }}</h2>
          <RuntimeStatusBadge
            :status="detail.summary.session_status || detail.session?.status"
            pulse
          />
        </div>
        <div
          v-if="pluginState"
          class="trace-case-hero__step-progress"
        >
          <span class="trace-case-hero__step-label">业务阶段</span>
          <span class="trace-case-hero__step-value">{{ compactEnumLabel(pluginState) }}</span>
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
        <strong>
          {{ detail.summary.current_wait_type || detail.session?.current_wait_type || '—' }}
        </strong>
      </div>
      <div class="trace-case-hero__fact runtime-hero__fact">
        <span>最后动作</span>
        <strong>{{ compactEnumLabel(detail.summary.latest_timeline_action) }}</strong>
      </div>
      <div class="trace-case-hero__fact runtime-hero__fact">
        <span>失败域 / 失败码</span>
        <strong>{{ failureText }}</strong>
      </div>
      <div class="trace-case-hero__fact runtime-hero__fact">
        <span>工作线 / 设备</span>
        <strong>{{ worklineDeviceText }}</strong>
      </div>
      <div class="trace-case-hero__fact runtime-hero__fact">
        <span>Trace / Request</span>
        <strong>{{ anchorText }}</strong>
      </div>
    </div>

    <div class="trace-case-hero__counts runtime-hero__counts">
      <div
        v-for="item in counts"
        :key="item.label"
        class="trace-case-hero__count-card runtime-hero__count-card"
      >
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

import {
  displaySession,
  displayTrace,
  displayWorkline,
  displayDevice
} from '@/utils/runtime-display-identity'

const props = defineProps<{
  detail: TraceDetailResponse
  worklineName?: string | null
  deviceName?: string | null
}>()

const sessionCode = computed(() =>
  displaySession({
    session_code: props.detail.session?.session_code,
    session_id: props.detail.trace.session_id
  })
)
const traceCode = computed(() =>
  displayTrace({
    trace_id: props.detail.trace.trace_id,
    session_code: props.detail.session?.session_code,
    session_id: props.detail.trace.session_id
  })
)
const barcode = computed(() => props.detail.session?.barcode ?? null)
const heroEyebrow = computed(() => (barcode.value ? '物料条码' : 'Trace 摘要'))
const heroTitle = computed(() => barcode.value || sessionCode.value)
const heroSubCode = computed(() => (barcode.value ? sessionCode.value : traceCode.value))
const pluginState = computed(
  () => props.detail.summary.plugin_state || props.detail.session?.plugin_state || null
)

const headline = computed(() => {
  return (
    props.detail.summary.latest_timeline_message ||
    props.detail.session?.failure_message ||
    '沿时间轴查看最后成功节点与第一处异常证据。'
  )
})

const lifecycleDuration = computed(() => {
  return formatRuntimeElapsed(props.detail.session?.started_at, props.detail.session?.ended_at)
})

const failureText = computed(() => {
  const parts = [props.detail.session?.failure_domain, props.detail.session?.failure_code].filter(
    Boolean
  )
  return parts.length ? parts.join(' / ') : '—'
})

const worklineDeviceText = computed(() => {
  const line = displayWorkline({
    line_name: props.worklineName,
    line_code: null,
    workline_id: props.detail.trace.workline_id
  })
  const device = displayDevice({
    device_name: props.deviceName,
    device_code: props.detail.trace.device_code,
    device_id: props.detail.trace.device_id
  })
  return (
    [line !== '未知工作线' ? line : null, device !== '未知设备' ? device : null]
      .filter(Boolean)
      .join(' · ') || '—'
  )
})

const anchorText = computed(() => {
  return (
    [props.detail.trace.trace_id, props.detail.trace.request_id].filter(Boolean).join(' · ') || '—'
  )
})

const counts = computed(() => [
  { label: 'Timeline', value: formatRuntimeCount(props.detail.summary.timelines) },
  { label: 'Callback', value: formatRuntimeCount(props.detail.summary.callback_logs) },
  { label: 'Inbox', value: formatRuntimeCount(props.detail.summary.inboxes) },
  { label: 'Command', value: formatRuntimeCount(props.detail.summary.commands) },
  { label: 'Outbox', value: formatRuntimeCount(props.detail.summary.outboxes) },
  { label: 'Attempt', value: formatRuntimeCount(props.detail.dispatch_attempts?.length ?? 0) },
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.trace-case-hero__counts {
  grid-template-columns: repeat(7, minmax(0, 1fr));
  opacity: 0.55;
}

@media (width <= 1279px) {
  .trace-case-hero__title {
    font-size: 22px;
  }

  .trace-case-hero__facts,
  .trace-case-hero__counts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
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
.trace-case-hero__step-progress {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-top: 14px;
  padding: 6px 14px 6px 10px;
  border: 1px solid rgb(59, 130, 246, 0.22);
  border-radius: 999px;
  background: rgb(59, 130, 246, 0.08);
}

.trace-case-hero__step-label {
  color: #64748b;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
}

.trace-case-hero__step-value {
  color: #93c5fd;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
}
</style>
