<template>
  <el-card
    shadow="never"
    class="runtime-panel"
  >
    <template #header>
      <div class="runtime-panel__header">
        <div>
          <div class="runtime-panel__title">会话面板</div>
          <div class="runtime-panel__subtitle">按状态分组的 4 列看板</div>
        </div>
      </div>
    </template>

    <div class="session-board">
      <div
        v-for="col in columns"
        :key="col.key"
        class="session-board__column"
      >
        <div
          class="session-board__column-header"
          :class="[`session-board__column-header--${col.key}`]"
        >
          <span class="session-board__column-title">{{ col.label }}</span>
          <span class="session-board__column-count">{{ col.items.length }}</span>
        </div>
        <div class="session-board__column-body">
          <button
            v-for="item in col.items"
            :key="item.session_id"
            type="button"
            class="session-board__item"
            :title="item.session_code"
            @click="emit('selectSession', item)"
          >
            <div class="session-board__item-top">
              <RuntimeStatusBadge
                :status="item.status"
                size="small"
              />
              <span class="session-board__item-time">
                {{ formatRuntimeElapsed(item.started_at) }}
              </span>
            </div>
            <div class="session-board__item-code">{{ sessionIdentity(item) }}</div>
            <div class="session-board__item-meta">
              {{ item.device_name || '—' }}
              <span v-if="sessionProgress(item) !== '—'">· {{ sessionProgress(item) }}</span>
            </div>
          </button>
          <div
            v-if="!col.items.length"
            class="session-board__empty"
          >
            暂无
          </div>
        </div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeTraceListItem } from '@/types/runtime'
import { displayCase } from '@/utils/runtime-display-identity'

const props = defineProps<{
  activeSessions: RuntimeTraceListItem[]
  recentFailedTraces: RuntimeTraceListItem[]
  recentCompletedTraces?: RuntimeTraceListItem[]
}>()

const emit = defineEmits<{
  selectSession: [session: RuntimeTraceListItem]
}>()

const _RUNNING = new Set(['NEW', 'RUNNING'])
const _WAITING = new Set(['WAITING_DEVICE_RESULT', 'WAITING_EXTERNAL', 'MANUAL_HOLD'])
const _FAILED = new Set(['FAILED'])
const _DONE = new Set(['COMPLETED', 'CANCELLED'])

const groupedSessions = computed(() => {
  const running: RuntimeTraceListItem[] = []
  const waiting: RuntimeTraceListItem[] = []
  const failed: RuntimeTraceListItem[] = []
  const done: RuntimeTraceListItem[] = []
  for (const s of props.activeSessions) {
    if (_RUNNING.has(s.status)) running.push(s)
    else if (_WAITING.has(s.status)) waiting.push(s)
    else if (_FAILED.has(s.status)) failed.push(s)
    else if (_DONE.has(s.status)) done.push(s)
  }
  return { running, waiting, failed, done }
})

const columns = computed(() => [
  { key: 'running', label: '运行中', items: groupedSessions.value.running },
  { key: 'waiting', label: '等待', items: groupedSessions.value.waiting },
  {
    key: 'failed',
    label: '失败',
    items: [...groupedSessions.value.failed, ...props.recentFailedTraces].slice(0, 10)
  },
  {
    key: 'done',
    label: '已完成',
    items: [...groupedSessions.value.done, ...(props.recentCompletedTraces ?? [])].slice(0, 10)
  }
])

import { formatRuntimeElapsed, resolveRuntimeProgressLabel } from '@/utils/runtime-display'

function sessionIdentity(item: RuntimeTraceListItem): string {
  return displayCase({
    barcode: item.barcode,
    session_code: item.session_code,
    business_key: item.business_key,
    session_id: item.session_id
  })
}

function sessionProgress(item: RuntimeTraceListItem): string {
  return resolveRuntimeProgressLabel(item)
}
</script>

<style scoped>
.session-board {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;
}

.session-board__column {
  display: flex;
  flex-direction: column;
  min-width: 0;
  border: 1px solid rgb(245, 158, 11, 0.08);
  border-radius: 10px;
  overflow: hidden;
}

.session-board__column-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-bottom: 1px solid rgb(245, 158, 11, 0.08);
}

.session-board__column-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.session-board__column-header--running .session-board__column-title {
  color: var(--runtime-badge-info-text);
}
.session-board__column-header--waiting .session-board__column-title {
  color: var(--runtime-badge-warning-text);
}
.session-board__column-header--failed .session-board__column-title {
  color: var(--runtime-badge-danger-text);
}
.session-board__column-header--done .session-board__column-title {
  color: var(--runtime-badge-success-text);
}

.session-board__column-count {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.session-board__column-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 8px;
  max-height: 360px;
  overflow-y: auto;
}

.session-board__item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: var(--runtime-surface-subtle);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease-out;
}

.session-board__item:hover {
  border-color: rgb(245, 158, 11, 0.28);
}

.session-board__item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.session-board__item-time {
  color: var(--runtime-text-muted);
  font-family: var(--font-mono);
  font-size: 10px;
}

.session-board__item-code {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-board__item-meta {
  color: var(--runtime-text-secondary);
  font-size: 11px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.session-board__empty {
  padding: 16px 0;
  color: var(--runtime-text-muted);
  font-size: 12px;
  text-align: center;
}

@media (width <= 1439px) and (width >= 1280px) {
  .session-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (width <= 1279px) {
  .session-board {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
