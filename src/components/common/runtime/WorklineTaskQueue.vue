<template>
  <el-card
    shadow="never"
    class="runtime-panel"
  >
    <template #header>
      <div class="runtime-panel__header">
        <div>
          <div class="runtime-panel__title">运行队列</div>
          <div class="runtime-panel__subtitle">按状态分组的会话列表</div>
        </div>
      </div>
    </template>

    <div class="workline-task-queue">
      <section
        v-if="running.length"
        class="workline-task-queue__group"
      >
        <h4 class="workline-task-queue__group-title workline-task-queue__group-title--running">
          进行中 ({{ running.length }})
        </h4>
        <div class="workline-task-queue__list">
          <button
            v-for="item in running"
            :key="item.session_id"
            type="button"
            class="workline-task-queue__item"
            @click="emit('selectSession', item)"
          >
            <RuntimeStatusBadge
              :status="item.status"
              size="small"
            />
            <span class="workline-task-queue__item-code">{{ item.session_code }}</span>
            <span class="workline-task-queue__item-device">{{ item.device_name || '—' }}</span>
            <span class="workline-task-queue__item-time">{{ formatElapsed(item.started_at) }}</span>
          </button>
        </div>
      </section>

      <section
        v-if="waiting.length"
        class="workline-task-queue__group"
      >
        <h4 class="workline-task-queue__group-title workline-task-queue__group-title--waiting">
          等待中 ({{ waiting.length }})
        </h4>
        <div class="workline-task-queue__list">
          <button
            v-for="item in waiting"
            :key="item.session_id"
            type="button"
            class="workline-task-queue__item"
            @click="emit('selectSession', item)"
          >
            <RuntimeStatusBadge
              :status="item.status"
              size="small"
            />
            <span class="workline-task-queue__item-code">{{ item.session_code }}</span>
            <span class="workline-task-queue__item-device">{{ item.device_name || '—' }}</span>
            <span class="workline-task-queue__item-time">{{ formatElapsed(item.started_at) }}</span>
          </button>
        </div>
      </section>

      <section
        v-if="failed.length"
        class="workline-task-queue__group"
      >
        <h4 class="workline-task-queue__group-title workline-task-queue__group-title--failed">
          异常 ({{ failed.length }})
        </h4>
        <div class="workline-task-queue__list">
          <button
            v-for="item in failed"
            :key="item.session_id"
            type="button"
            class="workline-task-queue__item"
            @click="emit('selectSession', item)"
          >
            <RuntimeStatusBadge
              :status="item.status"
              size="small"
            />
            <span class="workline-task-queue__item-code">{{ item.session_code }}</span>
            <span class="workline-task-queue__item-device">{{ item.device_name || '—' }}</span>
            <span class="workline-task-queue__item-step">{{ item.plugin_state || '—' }}</span>
          </button>
        </div>
      </section>

      <div
        v-if="!running.length && !waiting.length && !failed.length"
        class="workline-task-queue__empty"
      >
        暂无活跃会话
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeTraceListItem } from '@/types/runtime'

const props = defineProps<{
  activeSessions: RuntimeTraceListItem[]
  recentFailedTraces: RuntimeTraceListItem[]
}>()

const emit = defineEmits<{
  selectSession: [session: RuntimeTraceListItem]
}>()

const _RUNNING_STATUSES = new Set(['NEW', 'RUNNING'])
const _WAITING_STATUSES = new Set(['WAITING_DEVICE_RESULT', 'WAITING_EXTERNAL'])
const _FAILED_STATUSES = new Set(['FAILED', 'MANUAL_HOLD', 'CANCELLED'])

const running = computed(() => props.activeSessions.filter(s => _RUNNING_STATUSES.has(s.status)))
const waiting = computed(() => props.activeSessions.filter(s => _WAITING_STATUSES.has(s.status)))
const failed = computed(() =>
  [
    ...props.activeSessions.filter(s => _FAILED_STATUSES.has(s.status)),
    ...props.recentFailedTraces
  ].slice(0, 10)
)

function formatElapsed(start?: string | null): string {
  if (!start) return '--'
  const startDate = new Date(start)
  if (Number.isNaN(startDate.getTime())) return '--'
  const diff = Date.now() - startDate.getTime()
  if (diff < 0) return '--'
  const seconds = Math.floor(diff / 1000)
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`
  const hours = Math.floor(minutes / 60)
  return `${hours}h ${minutes % 60}m`
}
</script>

<style scoped>
.workline-task-queue {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.workline-task-queue__group-title {
  margin: 0;
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.workline-task-queue__group-title--running {
  color: rgb(59, 130, 246);
}

.workline-task-queue__group-title--waiting {
  color: rgb(234, 179, 8);
}

.workline-task-queue__group-title--failed {
  color: rgb(220, 38, 38);
}

.workline-task-queue__list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-top: 8px;
}

.workline-task-queue__item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgb(245, 158, 11, 0.08);
  border-radius: 8px;
  background: rgb(30, 41, 59, 0.5);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.15s ease-out;
}

.workline-task-queue__item:hover {
  border-color: rgb(245, 158, 11, 0.28);
}

.workline-task-queue__item-code {
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
}

.workline-task-queue__item-device {
  color: #94a3b8;
  font-size: 12px;
}

.workline-task-queue__item-time {
  margin-left: auto;
  color: #94a3b8;
  font-family: var(--font-mono);
  font-size: 11px;
}

.workline-task-queue__item-step {
  margin-left: auto;
  color: #dc2626;
  font-family: var(--font-mono);
  font-size: 11px;
}

.workline-task-queue__empty {
  padding: 24px;
  color: #64748b;
  font-size: 13px;
  text-align: center;
}
</style>
