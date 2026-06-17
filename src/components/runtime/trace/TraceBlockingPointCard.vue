<template>
  <el-card
    shadow="never"
    class="trace-blocking-card"
  >
    <template #header>
      <div class="trace-blocking-card__header">
        <div>
          <div class="trace-blocking-card__eyebrow">{{ diagnosisView.card.headerEyebrow }}</div>
          <div class="trace-blocking-card__title">{{ diagnosisView.card.headerTitle }}</div>
        </div>
        <RuntimeStatusBadge
          :label="diagnosisView.card.badgeLabel"
          :tone="diagnosisView.card.badgeTone"
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
      v-else
      class="trace-blocking-card__body"
    >
      <!-- 发生了什么 -->
      <div class="trace-blocking-card__message">
        <span>{{ diagnosisView.card.title }}</span>
        <p>
          {{ diagnosisView.card.message }}
        </p>
      </div>

      <!-- 该做什么 -->
      <div class="trace-blocking-card__action">
        <span>建议动作</span>
        <strong>{{ diagnosisView.card.operatorAction }}</strong>
      </div>

      <!-- 谁来处置 + 能否自动恢复 -->
      <div class="trace-blocking-card__facts">
        <div class="trace-blocking-card__fact">
          <span>问题归属</span>
          <strong>{{ ownerLabel }}</strong>
        </div>
        <div class="trace-blocking-card__fact">
          <span>恢复方式</span>
          <strong>{{ diagnosisView.card.recoverabilityLabel }}</strong>
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
      <details
        v-if="diagnosisView.card.showTechnicalInfo"
        class="trace-blocking-card__tech"
      >
        <summary>技术信息</summary>
        <div class="trace-blocking-card__tech-body">
          <div class="trace-blocking-card__tech-row">
            <span>Diagnostic Code</span>
            <strong>{{ diagnosisView.card.errorCode }}</strong>
          </div>
          <div class="trace-blocking-card__tech-row">
            <span>Problem Class</span>
            <strong>{{ diagnosisView.card.problemClass }}</strong>
          </div>
        </div>
      </details>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type {
  DiagnosisVerdict,
  TraceBlockingPointResponse,
  TraceDetailResponse
} from '@/types/runtime'
import { buildRuntimeDiagnosisVerdict } from '@/utils/runtime-diagnosis-verdict'

const props = withDefaults(
  defineProps<{
    blockingPoint?: TraceBlockingPointResponse | null
    detail?: TraceDetailResponse | null
    diagnosisVerdict?: DiagnosisVerdict | null
    loading?: boolean
  }>(),
  {
    blockingPoint: null,
    detail: null,
    diagnosisVerdict: null,
    loading: false
  }
)

const diagnosisView = computed(() =>
  buildRuntimeDiagnosisVerdict({
    detail: props.detail ?? emptyDetail(),
    verdict: props.diagnosisVerdict ?? props.detail?.diagnosis_verdict ?? null,
    blockingPoint: props.blockingPoint
  })
)

const ownerLabel = computed(() => {
  return diagnosisView.value.card.ownerLabel
})

const nextSteps = computed(() => {
  return diagnosisView.value.card.nextSteps
})

function emptyDetail(): TraceDetailResponse {
  return {
    trace: {},
    summary: {
      callback_logs: 0,
      inboxes: 0,
      commands: 0,
      outboxes: 0,
      timelines: 0,
      diagnostics: 0
    },
    sessions: [],
    callback_logs: [],
    inboxes: [],
    commands: [],
    outboxes: [],
    dispatch_attempts: [],
    timelines: [],
    diagnostics: [],
    diagnosis_verdict: {
      state: 'unknown',
      severity: 'warning',
      title: '后端诊断缺失',
      summary: 'Trace 响应缺少 diagnosis_verdict，无法展示后端诊断结论。',
      requires_operator_action: false,
      primary_action: '刷新 Trace 或检查后端契约',
      blocking_point: 'unknown',
      owner: 'system',
      evidence_health: {
        level: 'missing',
        summary: '后端诊断契约缺失',
        missing: ['diagnosis_verdict'],
        items: []
      }
    }
  }
}
</script>

<style scoped>
.trace-blocking-card {
  border: 1px solid rgb(var(--color-primary-rgb) / 0.18);
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
  color: var(--runtime-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.trace-blocking-card__title {
  margin-top: 4px;
  color: var(--runtime-text-primary);
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
  border: 1px solid rgb(var(--color-primary-rgb) / 0.22);
  border-left: 3px solid rgb(var(--color-primary-rgb) / 0.7);
  border-radius: 10px;
  background: rgb(var(--color-primary-rgb) / 0.1);
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
  color: var(--runtime-text-primary);
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
  color: var(--runtime-text-secondary);
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
    rgb(var(--color-industrial-dark-text-secondary-rgb, 148 163 184) / 0.06),
    rgb(var(--color-industrial-dark-text-secondary-rgb, 148 163 184) / 0.14),
    rgb(var(--color-industrial-dark-text-secondary-rgb, 148 163 184) / 0.06)
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
  border-top: 1px solid rgb(var(--color-industrial-dark-text-secondary-rgb, 148 163 184) / 0.1);
  padding-top: 10px;
}

.trace-blocking-card__tech summary {
  color: var(--color-industrial-light-text-secondary);
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
  color: var(--color-industrial-light-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  width: 120px;
}

.trace-blocking-card__tech-row strong {
  color: var(--color-industrial-dark-text-muted);
  font-family: var(--font-mono);
  font-size: 12px;
}

@media (width <= 767px) {
  .trace-blocking-card__facts {
    grid-template-columns: 1fr;
  }
}
</style>
