<template>
  <el-card
    shadow="never"
    class="trace-blocking-card"
  >
    <template #header>
      <div class="trace-blocking-card__header">
        <div>
          <div class="trace-blocking-card__eyebrow">现场处置</div>
          <div class="trace-blocking-card__title">阻塞点诊断卡</div>
        </div>
        <RuntimeStatusBadge
          :label="blockingPoint ? compactEnumLabel(blockingPoint.blocking_point) : '等待诊断'"
          :tone="blockingTone"
          size="small"
        />
      </div>
    </template>

    <div
      v-if="loading"
      class="trace-blocking-card__skeleton"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="trace-blocking-card__skeleton-row"
      />
    </div>

    <div
      v-else-if="blockingPoint"
      class="trace-blocking-card__body"
    >
      <!-- 发生了什么 -->
      <div class="trace-blocking-card__message">
        <span>{{ blockingPoint.diagnostic_card.title }}</span>
        <p>
          {{ blockingPoint.diagnostic_card.user_message || blockingPoint.diagnostic_card.summary }}
        </p>
      </div>

      <!-- 该做什么 -->
      <div class="trace-blocking-card__action">
        <span>建议动作</span>
        <strong>{{ blockingPoint.operator_action }}</strong>
      </div>

      <!-- 谁来处置 + 能否自动恢复 -->
      <div class="trace-blocking-card__facts">
        <div class="trace-blocking-card__fact">
          <span>问题归属</span>
          <strong>{{ ownerLabel }}</strong>
        </div>
        <div class="trace-blocking-card__fact">
          <span>恢复方式</span>
          <strong>{{ recoverabilityLabel }}</strong>
        </div>
      </div>

      <!-- 分步指引 -->
      <ol
        v-if="nextSteps.length"
        class="trace-blocking-card__steps"
      >
        <li
          v-for="step in nextSteps"
          :key="step"
        >
          {{ step }}
        </li>
      </ol>

      <!-- 技术信息（工程师参考） -->
      <details class="trace-blocking-card__tech">
        <summary>技术信息</summary>
        <div class="trace-blocking-card__tech-body">
          <div class="trace-blocking-card__tech-row">
            <span>Diagnostic Code</span>
            <strong>{{ blockingPoint.diagnostic_card.error_code }}</strong>
          </div>
          <div class="trace-blocking-card__tech-row">
            <span>Problem Class</span>
            <strong>{{ compactEnumLabel(blockingPoint.diagnostic_card.problem_class) }}</strong>
          </div>
        </div>
      </details>
    </div>

    <div
      v-else
      class="trace-blocking-card__empty"
    >
      当前 Trace 暂无阻塞点诊断卡。
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { TraceBlockingPointResponse } from '@/types/runtime'
import type { RuntimeTone } from '@/utils/runtime-display'
import { compactEnumLabel } from '@/utils/runtime-display'

const props = withDefaults(
  defineProps<{
    blockingPoint?: TraceBlockingPointResponse | null
    loading?: boolean
  }>(),
  {
    blockingPoint: null,
    loading: false
  }
)

const blockingTone = computed<RuntimeTone>(() => {
  const point = props.blockingPoint?.blocking_point?.toUpperCase()
  if (!point || point === 'NONE') return 'success'
  if (point === 'SESSION') return 'warning'
  return 'danger'
})

const nextSteps = computed(() => {
  return (props.blockingPoint?.diagnostic_card.next_steps ?? []).filter(Boolean).slice(0, 5)
})

const OWNER_LABELS: Record<string, string> = {
  DEVICE: '设备问题（联系设备维护）',
  INTEGRATION: '接入集成问题（联系技术）',
  WORKFLOW: '流程编排问题（联系技术）',
  PLUGIN: '业务插件问题（联系技术）',
  CONFIGURATION: '配置问题（联系运维）',
  PLATFORM: '平台底层问题（联系技术支持）',
  OPS: '运维操作（当前人员处理）',
  OPERATOR: '运维操作（当前人员处理）'
}

const RECOVERABILITY_LABELS: Record<string, string> = {
  AUTO_RETRYABLE: '系统自动重试中，请等待',
  MANUAL_RETRYABLE: '需人工触发重试',
  MANUAL_INTERVENTION_REQUIRED: '需现场人工介入处理',
  NON_RECOVERABLE: '当前流程不可恢复，需升级处理'
}

const ownerLabel = computed(() => {
  const raw = props.blockingPoint?.owner?.toUpperCase() ?? ''
  return OWNER_LABELS[raw] || compactEnumLabel(props.blockingPoint?.owner) || '—'
})

const recoverabilityLabel = computed(() => {
  const raw = props.blockingPoint?.recoverability?.toUpperCase() ?? ''
  return RECOVERABILITY_LABELS[raw] || compactEnumLabel(props.blockingPoint?.recoverability) || '—'
})
</script>

<style scoped>
.trace-blocking-card {
  border: 1px solid rgb(245, 158, 11, 0.18);
  border-radius: 16px;
  background: var(--runtime-surface);
}

.trace-blocking-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.trace-blocking-card__eyebrow,
.trace-blocking-card__fact span,
.trace-blocking-card__action span,
.trace-blocking-card__message span {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.trace-blocking-card__title {
  margin-top: 4px;
  color: var(--runtime-text-primary, #f8fafc);
  font-size: 16px;
  font-weight: 800;
}

.trace-blocking-card__body {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.trace-blocking-card__action {
  padding: 14px 16px;
  border: 1px solid rgb(245, 158, 11, 0.22);
  border-left: 3px solid rgb(245, 158, 11, 0.7);
  border-radius: 10px;
  background: rgb(245, 158, 11, 0.1);
}

.trace-blocking-card__action strong {
  display: block;
  margin-top: 8px;
  color: #fef3c7;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.7;
}

.trace-blocking-card__facts {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.trace-blocking-card__fact {
  padding: 12px;
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 10px;
  background: var(--runtime-surface-subtle);
}

.trace-blocking-card__fact strong {
  display: block;
  margin-top: 6px;
  color: var(--runtime-text-primary, #f8fafc);
  font-family: var(--font-mono);
  font-size: 12px;
  line-height: 1.5;
  overflow-wrap: anywhere;
}

.trace-blocking-card__message p {
  margin: 6px 0 0;
  color: var(--runtime-text-emphasis);
  font-size: 13px;
  line-height: 1.7;
}

.trace-blocking-card__steps {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 0;
  padding-left: 20px;
  color: var(--runtime-text-emphasis);
  font-size: 13px;
  line-height: 1.7;
}

.trace-blocking-card__empty {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 13px;
}

.trace-blocking-card__skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trace-blocking-card__skeleton-row {
  height: 36px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgb(148, 163, 184, 0.06),
    rgb(148, 163, 184, 0.14),
    rgb(148, 163, 184, 0.06)
  );
  background-size: 200% 100%;
  animation: tbc-shimmer 1.6s ease-in-out infinite;
}

@keyframes tbc-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.trace-blocking-card__tech {
  border-top: 1px solid rgb(148, 163, 184, 0.1);
  padding-top: 10px;
}

.trace-blocking-card__tech summary {
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  user-select: none;
  list-style: none;
}

.trace-blocking-card__tech summary::before {
  content: '▶  ';
  font-size: 9px;
}

.trace-blocking-card__tech[open] summary::before {
  content: '▼  ';
}

.trace-blocking-card__tech-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 10px;
}

.trace-blocking-card__tech-row {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.trace-blocking-card__tech-row span {
  flex-shrink: 0;
  color: #475569;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  width: 120px;
}

.trace-blocking-card__tech-row strong {
  color: #64748b;
  font-family: var(--font-mono);
  font-size: 12px;
}

@media (width <= 767px) {
  .trace-blocking-card__facts {
    grid-template-columns: 1fr;
  }
}
</style>
