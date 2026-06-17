<template>
  <div class="runtime-signal-strip">
    <article
      v-for="card in coreKpis"
      :key="card.key"
      class="runtime-signal-card"
      :class="`runtime-signal-card--${card.tone}`"
    >
      <span class="runtime-signal-card__label">{{ card.label }}</span>
      <div class="runtime-signal-card__row">
        <span class="runtime-signal-card__value">{{ card.value }}</span>
        <span
          v-if="card.trend != null"
          class="runtime-signal-card__trend"
          :class="`runtime-signal-card__trend--${card.trendDirection}`"
        >
          {{ card.trend > 0 ? '↑' : '↓' }}
        </span>
      </div>
    </article>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RuntimeStatCard } from '@/types/runtime'

interface CoreKpi {
  key: string
  label: string
  value: number
  tone: 'danger' | 'warning'
  trend?: number
  trendDirection: 'up' | 'down'
}

const props = defineProps<{
  cards: RuntimeStatCard[]
}>()

function statValue(key: string): number {
  return props.cards.find(c => c.key === key)?.value ?? 0
}

const coreKpis = computed<CoreKpi[]>(() => {
  const failed = statValue('failed_sessions')
  const abnormal = statValue('abnormal_devices')
  const backlog = statValue('inbox_backlog') + statValue('outbox_backlog')

  return [
    {
      key: 'failed_sessions',
      label: '失败链路',
      value: failed,
      tone: 'danger',
      trend: failed > 0 ? failed : undefined,
      trendDirection: failed > 0 ? 'up' : 'down'
    },
    {
      key: 'abnormal_devices',
      label: '异常设备',
      value: abnormal,
      tone: 'danger',
      trend: abnormal > 0 ? abnormal : undefined,
      trendDirection: abnormal > 0 ? 'up' : 'down'
    },
    {
      key: 'system_backlog',
      label: '系统积压',
      value: backlog,
      tone: 'warning',
      trend: backlog > 0 ? backlog : undefined,
      trendDirection: backlog > 0 ? 'up' : 'down'
    }
  ]
})
</script>

<style scoped>
.runtime-signal-strip {
  display: grid;
  gap: 16px;
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.runtime-signal-card {
  position: relative;
  overflow: hidden;
  padding: 20px;
  border: 1px solid var(--runtime-border, rgb(var(--color-primary-rgb) / 0.16));
  border-radius: 16px;
  background: var(--runtime-surface, rgb(var(--color-industrial-dark-surface-rgb) / 0.8));
  box-shadow: var(
    --runtime-shadow,
    inset 0 1px 0 rgb(var(--color-industrial-light-surface-rgb) / 0.03)
  );
}

.runtime-signal-card::before {
  content: '';
  position: absolute;
  inset: 0 auto auto 0;
  width: 100%;
  height: 3px;
}

.runtime-signal-card--danger::before {
  background: var(--runtime-tier-critical);
}

.runtime-signal-card--warning::before {
  background: var(--runtime-tier-watch);
}

.runtime-signal-card__label {
  display: block;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.runtime-signal-card__row {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-top: 14px;
}

.runtime-signal-card__value {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 24px;
  font-weight: 700;
  line-height: 1;
}

.runtime-signal-card__trend {
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 700;
}

.runtime-signal-card__trend--up {
  color: var(--runtime-tier-critical);
}

.runtime-signal-card__trend--down {
  color: var(--color-success);
}

@media (width <= 1279px) {
  .runtime-signal-strip {
    grid-template-columns: 1fr;
  }
}
</style>
