<template>
  <div class="runtime-case-queue">
    <div
      v-if="loading"
      class="runtime-case-queue__skeleton"
    >
      <div
        v-for="i in 4"
        :key="i"
        class="runtime-case-queue__skeleton-row"
      />
    </div>
    <template v-else>
      <div class="runtime-case-queue__tabs">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          type="button"
          class="runtime-case-queue__tab"
          :class="{ 'is-active': activeTab === tab.key }"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
        </button>
      </div>

      <div
        v-if="displayTraces.length"
        class="runtime-case-queue__rows"
      >
        <button
          v-for="trace in displayTraces"
          :key="trace.session_id"
          type="button"
          class="runtime-case-queue__row"
          @click="emit('select', trace)"
        >
          <span class="runtime-case-queue__time">
            {{ formatRuntimeRelative(trace.last_ingress_at || trace.started_at) }}
          </span>
          <span class="runtime-case-queue__workline">{{ trace.workline_name || '—' }}</span>
          <span class="runtime-case-queue__barcode">
            {{
              displayCase({
                barcode: trace.barcode,
                session_code: trace.session_code,
                business_key: trace.business_key,
                session_id: trace.session_id
              })
            }}
          </span>
          <span class="runtime-case-queue__domain">
            {{ translateFailureDomain(trace.failure_domain) || trace.current_wait_type || '—' }}
          </span>
        </button>
      </div>
      <div
        v-else
        class="runtime-case-queue__empty"
      >
        暂无匹配的运行案件
      </div>

      <button
        v-if="hasMore && displayTraces.length"
        type="button"
        class="runtime-case-queue__more"
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
import { displayCase } from '@/utils/runtime-display-identity'
import { translateFailureDomain } from '@/utils/runtime-labels'

type CaseTab = 'all' | 'failed' | 'active'

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

const activeTab = ref<CaseTab>('all')

const tabs: { key: CaseTab; label: string }[] = [
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
.runtime-case-queue {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.runtime-case-queue__skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.runtime-case-queue__skeleton-row {
  height: 32px;
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    rgb(148, 163, 184, 0.06),
    rgb(148, 163, 184, 0.14),
    rgb(148, 163, 184, 0.06)
  );
  background-size: 200% 100%;
  animation: cq-shimmer 1.6s ease-in-out infinite;
}

@keyframes cq-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.runtime-case-queue__tabs {
  display: flex;
  gap: 4px;
}

.runtime-case-queue__tab {
  padding: 4px 12px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    color 0.15s ease;
}

.runtime-case-queue__tab:hover {
  background: rgb(148, 163, 184, 0.08);
  color: var(--runtime-text-primary);
}

.runtime-case-queue__tab.is-active {
  border-color: var(--runtime-border-accent, rgb(var(--color-primary-rgb) / 0.24));
  background: var(--runtime-surface-accent, rgb(var(--color-primary-rgb) / 0.1));
  color: var(--runtime-text-primary);
}

.runtime-case-queue__rows {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.runtime-case-queue__row {
  display: grid;
  grid-template-columns: 100px 1fr 110px 80px;
  gap: 8px;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: var(--runtime-text-primary);
  font-size: 13px;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.runtime-case-queue__row:hover {
  border-color: var(--runtime-border-accent, rgb(var(--color-primary-rgb) / 0.24));
  background: rgb(var(--color-primary-rgb) / 0.06);
}

.runtime-case-queue__time,
.runtime-case-queue__workline,
.runtime-case-queue__domain {
  overflow: hidden;
  color: var(--runtime-text-secondary);
  white-space: nowrap;
  text-overflow: ellipsis;
}

.runtime-case-queue__barcode {
  overflow: hidden;
  font-weight: 700;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.runtime-case-queue__empty {
  padding: 16px;
  border: 1px dashed var(--runtime-border-subtle, rgb(148, 163, 184, 0.18));
  border-radius: 8px;
  color: var(--runtime-text-secondary);
  font-size: 13px;
  text-align: center;
}

.runtime-case-queue__more {
  align-self: flex-start;
  padding: 6px 10px;
  border: 1px solid var(--runtime-border-subtle, rgb(148, 163, 184, 0.18));
  border-radius: 6px;
  background: transparent;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  cursor: pointer;
}

@media (width <= 900px) {
  .runtime-case-queue__row {
    grid-template-columns: 90px 1fr;
  }

  .runtime-case-queue__barcode {
    grid-column: 1 / -1;
  }

  .runtime-case-queue__domain {
    display: none;
  }
}
</style>
