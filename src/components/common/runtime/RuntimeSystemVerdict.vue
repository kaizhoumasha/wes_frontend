<template>
  <div
    role="status"
    aria-live="polite"
    class="runtime-verdict"
    :class="verdictClass"
  >
    <div
      v-if="loading"
      class="runtime-verdict__skeleton"
    >
      <div class="runtime-verdict__skeleton-bar" />
    </div>
    <template v-else-if="summary">
      <div class="runtime-verdict__indicator">
        <span class="runtime-verdict__dot" />
      </div>
      <div class="runtime-verdict__body">
        <div class="runtime-verdict__message">{{ verdictMessage }}</div>
        <div class="runtime-verdict__detail">{{ verdictDetail }}</div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface VerdictSummary {
  critical: number
  watch: number
  known: number
  totalSessions: number
  totalDevices: number
  runningSessions: number
}

const props = defineProps<{
  summary: VerdictSummary | null
  loading: boolean
}>()

const verdictClass = computed(() => {
  if (!props.summary) return 'runtime-verdict--neutral'
  if (props.summary.critical > 0) return 'runtime-verdict--critical'
  if (props.summary.watch > 0) return 'runtime-verdict--watch'
  return 'runtime-verdict--ok'
})

const verdictMessage = computed(() => {
  if (!props.summary) return ''
  const s = props.summary
  if (s.critical > 0) return `${s.critical} 个紧急异常`
  if (s.watch > 0) return `${s.watch} 个异常需关注`
  return '系统正常'
})

const verdictDetail = computed(() => {
  if (!props.summary) return ''
  const s = props.summary
  return `${s.runningSessions} 条链路运行中, ${s.totalDevices} 台设备在线`
})
</script>

<style scoped>
.runtime-verdict {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: 14px;
  border: 1px solid var(--runtime-border, rgb(245, 158, 11, 0.12));
  background: var(--runtime-surface, rgb(30, 41, 59, 0.8));
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
}

.runtime-verdict--ok {
  border-color: rgb(22, 163, 74, 0.28);
  background: rgb(22, 163, 74, 0.08);
}

.runtime-verdict--watch {
  border-color: rgb(234, 179, 8, 0.32);
  background: rgb(234, 179, 8, 0.1);
}

.runtime-verdict--critical {
  border-color: rgb(220, 38, 38, 0.32);
  background: rgb(220, 38, 38, 0.1);
}

.runtime-verdict__indicator {
  flex: 0 0 auto;
}

.runtime-verdict__dot {
  display: block;
  width: 12px;
  height: 12px;
  border-radius: 999px;
  background: var(--runtime-text-secondary, #94a3b8);
}

.runtime-verdict--ok .runtime-verdict__dot {
  background: #16a34a;
  box-shadow: 0 0 8px rgb(22, 163, 74, 0.5);
}

.runtime-verdict--watch .runtime-verdict__dot {
  background: #eab308;
  box-shadow: 0 0 8px rgb(234, 179, 8, 0.5);
}

.runtime-verdict--critical .runtime-verdict__dot {
  background: #dc2626;
  box-shadow: 0 0 8px rgb(220, 38, 38, 0.5);
}

.runtime-verdict__body {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.runtime-verdict__message {
  color: var(--runtime-text-primary, #f8fafc);
  font-size: 16px;
  font-weight: 700;
}

.runtime-verdict__detail {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 13px;
  line-height: 1.5;
}

.runtime-verdict__skeleton {
  width: 100%;
}

.runtime-verdict__skeleton-bar {
  height: 20px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgb(148, 163, 184, 0.12),
    rgb(148, 163, 184, 0.22),
    rgb(148, 163, 184, 0.12)
  );
  background-size: 200% 100%;
  animation: verdict-skeleton-shimmer 1.6s ease-in-out infinite;
}

@keyframes verdict-skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
