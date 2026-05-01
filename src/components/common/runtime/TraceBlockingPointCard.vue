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
      <div class="trace-blocking-card__action">
        <span>建议动作</span>
        <strong>{{ blockingPoint.operator_action }}</strong>
      </div>

      <div class="trace-blocking-card__facts">
        <div class="trace-blocking-card__fact">
          <span>Owner</span>
          <strong>{{ compactEnumLabel(blockingPoint.owner) }}</strong>
        </div>
        <div class="trace-blocking-card__fact">
          <span>Recoverability</span>
          <strong>{{ compactEnumLabel(blockingPoint.recoverability) }}</strong>
        </div>
        <div class="trace-blocking-card__fact">
          <span>Diagnostic Code</span>
          <strong>{{ blockingPoint.diagnostic_card.error_code }}</strong>
        </div>
        <div class="trace-blocking-card__fact">
          <span>Problem Class</span>
          <strong>{{ compactEnumLabel(blockingPoint.diagnostic_card.problem_class) }}</strong>
        </div>
      </div>

      <div class="trace-blocking-card__message">
        <span>{{ blockingPoint.diagnostic_card.title }}</span>
        <p>
          {{ blockingPoint.diagnostic_card.user_message || blockingPoint.diagnostic_card.summary }}
        </p>
      </div>

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
  const fromResponse = props.blockingPoint?.next_steps ?? []
  const fromCard = props.blockingPoint?.diagnostic_card.next_steps ?? []
  return [...fromResponse, ...fromCard].filter(Boolean).slice(0, 5)
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
  padding: 14px;
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 10px;
  background: rgb(245, 158, 11, 0.08);
}

.trace-blocking-card__action strong {
  display: block;
  margin-top: 6px;
  color: var(--runtime-text-primary, #f8fafc);
  font-size: 14px;
  line-height: 1.7;
}

.trace-blocking-card__facts {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(4, minmax(0, 1fr));
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

@media (width <= 1023px) {
  .trace-blocking-card__facts {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 767px) {
  .trace-blocking-card__facts {
    grid-template-columns: 1fr;
  }
}
</style>
