<template>
  <div class="trace-related-sidebar">
    <div class="trace-related-sidebar__header">
      <div class="trace-related-sidebar__title">关联案件</div>
      <div class="trace-related-sidebar__subtitle">同工作线 / 设备的相邻 Trace</div>
    </div>

    <div
      v-if="loading"
      class="trace-related-sidebar__skeleton"
    >
      <div
        v-for="i in 3"
        :key="i"
        class="trace-related-sidebar__skeleton-row"
      />
    </div>

    <template v-else>
      <div
        v-if="traces.length"
        class="trace-related-sidebar__list"
      >
        <button
          v-for="item in traces"
          :key="item.session_id"
          type="button"
          class="trace-related-sidebar__item"
          :class="{ 'is-current': item.session_id === currentTraceId }"
          @click="emit('select', item)"
        >
          <div class="trace-related-sidebar__item-top">
            <RuntimeStatusBadge
              :status="item.status"
              size="small"
            />
            <span class="trace-related-sidebar__item-time">
              {{ formatRuntimeRelative(item.last_ingress_at || item.started_at) }}
            </span>
          </div>
          <div class="trace-related-sidebar__item-code">
            {{
              displayTrace({
                trace_id: item.trace_id,
                session_code: item.session_code,
                session_id: item.session_id
              })
            }}
          </div>
          <div class="trace-related-sidebar__item-meta">
            {{
              displayWorkline({
                line_name: item.workline_name,
                line_code: null,
                workline_id: item.workline_id
              })
            }}
            &middot;
            {{
              displayDevice({
                device_name: item.device_name,
                device_code: item.device_code,
                device_id: item.device_id
              })
            }}
          </div>
          <div class="trace-related-sidebar__item-hint">
            {{ item.plugin_state || '--' }} &middot;
            {{ item.failure_domain || item.latest_timeline_message || '等待更多证据' }}
          </div>
        </button>
      </div>

      <div
        v-else
        class="trace-related-sidebar__empty"
      >
        <span>没有找到关联案件</span>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import { displayDevice, displayTrace, displayWorkline } from '@/utils/runtime-display-identity'
import type { RuntimeTraceListItem } from '@/types/runtime'
import { formatRuntimeRelative } from '@/utils/runtime-display'

const props = defineProps<{
  currentTraceId: number | null
  worklineId: number | null
  deviceId: number | null
  failureDomain: string | null
}>()

const emit = defineEmits<{
  (e: 'select', trace: RuntimeTraceListItem): void
}>()

const loading = ref(false)
const relatedTraces = ref<RuntimeTraceListItem[]>([])

const traces = computed(() => {
  return relatedTraces.value.filter(item => item.session_id !== props.currentTraceId)
})

watch(
  () => [props.worklineId, props.deviceId, props.currentTraceId] as const,
  async ([worklineId, deviceId]) => {
    if (!worklineId && !deviceId) {
      relatedTraces.value = []
      return
    }

    loading.value = true
    try {
      const payload: { workline_id?: number; device_id?: number; limit: number; offset: number } = {
        limit: 10,
        offset: 0
      }
      if (worklineId) {
        payload.workline_id = worklineId
      }
      if (deviceId) {
        payload.device_id = deviceId
      }

      const response = await runtimeApiMethods.queryTraces(payload).send()
      relatedTraces.value = response.items
    } catch {
      relatedTraces.value = []
    } finally {
      loading.value = false
    }
  },
  { immediate: true }
)
</script>

<style scoped>
.trace-related-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.trace-related-sidebar__header {
  padding-bottom: 8px;
  border-bottom: 1px solid rgb(148, 163, 184, 0.12);
}

.trace-related-sidebar__title {
  color: var(--runtime-text-primary, #f8fafc);
  font-size: 14px;
  font-weight: 700;
}

.trace-related-sidebar__subtitle {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 12px;
  line-height: 1.5;
}

.trace-related-sidebar__skeleton {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trace-related-sidebar__skeleton-row {
  height: 64px;
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgb(148, 163, 184, 0.06),
    rgb(148, 163, 184, 0.12),
    rgb(148, 163, 184, 0.06)
  );
  background-size: 200% 100%;
  animation: trs-shimmer 1.6s ease-in-out infinite;
}

@keyframes trs-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

.trace-related-sidebar__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.trace-related-sidebar__item {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
  padding: 12px;
  border: 1px solid var(--runtime-border-neutral);
  border-radius: 10px;
  background: var(--runtime-surface-subtle);
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.trace-related-sidebar__item:hover {
  border-color: rgb(245, 158, 11, 0.24);
  background: var(--runtime-surface);
}

.trace-related-sidebar__item:focus-visible {
  outline: 2px solid rgb(245, 158, 11, 0.5);
  outline-offset: 1px;
}

.trace-related-sidebar__item.is-current {
  border-color: rgb(245, 158, 11, 0.36);
  background: rgb(245, 158, 11, 0.08);
}

.trace-related-sidebar__item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.trace-related-sidebar__item-time {
  color: var(--runtime-text-secondary, #94a3b8);
  font-family: var(--font-mono);
  font-size: 11px;
}

.trace-related-sidebar__item-code {
  color: var(--runtime-text-primary, #f8fafc);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 700;
}

.trace-related-sidebar__item-meta {
  color: var(--runtime-text-emphasis);
  font-size: 12px;
  line-height: 1.5;
}

.trace-related-sidebar__item-hint {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 11px;
  line-height: 1.5;
}

.trace-related-sidebar__empty {
  padding: 24px 12px;
  border: 1px dashed var(--runtime-border-neutral);
  border-radius: 12px;
  background: var(--runtime-surface-subtle);
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 13px;
  text-align: center;
}
</style>
