<template>
  <div class="runtime-trace-list">
    <div
      v-if="loading"
      class="runtime-trace-list__skeleton"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="runtime-trace-list__skeleton-row"
      />
    </div>
    <template v-else>
      <div class="runtime-trace-list__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="runtime-trace-list__tab"
          :class="{ 'is-active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div
        v-if="displayTraces.length"
        class="runtime-trace-list__rows"
      >
        <button
          v-for="trace in displayTraces"
          :key="trace.session_id"
          type="button"
          class="runtime-trace-list__row"
          @click="emit('select', trace)"
        >
          <span class="runtime-trace-list__time">
            {{ formatRuntimeRelative(trace.last_ingress_at || trace.started_at) }}
          </span>
          <span class="runtime-trace-list__workline">{{ trace.workline_name || '—' }}</span>
          <span class="runtime-trace-list__barcode">
            {{
              displayTrace({
                trace_id: trace.trace_id,
                session_code: trace.session_code,
                session_id: trace.session_id
              })
            }}
          </span>
          <span class="runtime-trace-list__domain">
            {{ translateFailureDomain(trace.failure_domain) || '—' }}
          </span>
        </button>
      </div>
      <div
        v-else
        class="runtime-trace-list__empty"
      >
        暂无匹配的 Trace 记录
      </div>

      <button
        v-if="hasMore && displayTraces.length"
        type="button"
        class="runtime-trace-list__more"
        @click="emit('showMore')"
      >
        查看更多
      </button>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { RuntimeTraceListItem } from '@/types/runtime'
import { formatRuntimeRelative } from '@/utils/runtime-display'
import { displayTrace } from '@/utils/runtime-display-identity'
import { translateFailureDomain } from '@/utils/runtime-labels'

type TraceTab = 'all' | 'failed' | 'active'

const props = withDefaults(
  defineProps<{
    traces: RuntimeTraceListItem[]
    activeTraces?: RuntimeTraceListItem[]
    failedTraces?: RuntimeTraceListItem[]
    loading: boolean
    maxDisplay?: number
  }>(),
  {
    activeTraces: () => [],
    failedTraces: () => [],
    maxDisplay: 10
  }
)

const emit = defineEmits<{
  (e: 'select', trace: RuntimeTraceListItem): void
  (e: 'showMore'): void
}>()

const activeTab = ref<TraceTab>('all')

const tabs: { key: TraceTab; label: string }[] = [
  { key: 'all', label: '全部' },
  { key: 'failed', label: '仅失败' },
  { key: 'active', label: '仅活跃' }
]

function isFailed(trace: RuntimeTraceListItem): boolean {
  const status = (trace.status || '').toUpperCase()
  return ['FAILED', 'FAIL', 'TIMEOUT', 'ABORTED', 'ERROR'].includes(status)
}

function isActive(trace: RuntimeTraceListItem): boolean {
  const status = (trace.status || '').toUpperCase()
  return ['RUNNING', 'WAITING', 'WAITING_DEVICE_RESULT', 'WAITING_EXTERNAL', 'PROCESSING'].includes(
    status
  )
}

const filteredTraces = computed(() => {
  if (activeTab.value === 'failed') {
    return props.failedTraces.length ? props.failedTraces : props.traces.filter(isFailed)
  }
  if (activeTab.value === 'active') {
    return props.activeTraces.length ? props.activeTraces : props.traces.filter(isActive)
  }
  return props.traces
})

const displayTraces = computed(() => filteredTraces.value.slice(0, props.maxDisplay))

const hasMore = computed(() => filteredTraces.value.length > props.maxDisplay)
</script>

<style scoped>
.runtime-trace-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.runtime-trace-list__skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.runtime-trace-list__skeleton-row {
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgb(148, 163, 184, 0.06),
    rgb(148, 163, 184, 0.14),
    rgb(148, 163, 184, 0.06)
  );
  background-size: 200% 100%;
  animation: tl-shimmer 1.6s ease-in-out infinite;
}

@keyframes tl-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.runtime-trace-list__tabs {
  display: flex;
  gap: 4px;
}

.runtime-trace-list__tab {
  padding: 4px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.runtime-trace-list__tab:hover {
  background: rgb(148, 163, 184, 0.08);
  color: var(--runtime-text-primary, #f8fafc);
}

.runtime-trace-list__tab.is-active {
  border-color: var(--runtime-border-accent, rgb(245, 158, 11, 0.24));
  background: var(--runtime-surface-accent, rgb(245, 158, 11, 0.1));
  color: var(--runtime-text-primary, #f8fafc);
}

.runtime-trace-list__rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.runtime-trace-list__row {
  display: grid;
  grid-template-columns: 100px 1fr 110px 80px;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  text-align: left;
  cursor: pointer;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
}

.runtime-trace-list__row:hover {
  background: var(--runtime-surface-subtle, rgb(30, 41, 59, 0.6));
  border-color: var(--runtime-border, rgb(245, 158, 11, 0.16));
}

.runtime-trace-list__row:focus-visible {
  outline: 2px solid var(--runtime-border-accent, rgb(245, 158, 11, 0.5));
  outline-offset: 1px;
}

.runtime-trace-list__time,
.runtime-trace-list__workline,
.runtime-trace-list__barcode,
.runtime-trace-list__domain {
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.runtime-trace-list__time {
  color: var(--runtime-text-secondary, #94a3b8);
  font-family: var(--font-mono);
  font-size: 11px;
}

.runtime-trace-list__workline {
  color: var(--runtime-text-primary, #f8fafc);
  font-weight: 600;
}

.runtime-trace-list__barcode {
  color: var(--runtime-text-secondary, #cbd5e1);
  font-family: var(--font-mono);
}

.runtime-trace-list__domain {
  color: var(--runtime-tier-critical, #f87171);
  font-size: 11px;
  text-align: right;
}

.runtime-trace-list__more {
  padding: 6px 0;
  border: none;
  background: transparent;
  color: var(--runtime-tier-watch, rgb(245, 158, 11, 0.8));
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.15s ease;
}

.runtime-trace-list__more:hover {
  color: var(--runtime-tier-watch, #f59e0b);
}

.runtime-trace-list__empty {
  padding: 24px;
  border: 1px dashed var(--runtime-border, rgb(148, 163, 184, 0.28));
  border-radius: 14px;
  background: var(--runtime-surface-muted, rgb(15, 23, 42, 0.42));
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 14px;
  font-weight: 600;
  text-align: center;
}
</style>
