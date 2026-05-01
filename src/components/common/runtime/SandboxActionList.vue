<template>
  <div class="sandbox-action-list">
    <!-- Pending section -->
    <div class="sandbox-action-list__header">
      <span class="sandbox-action-list__title">待操作命令</span>
      <span class="sandbox-action-list__count">{{ items.length }}</span>
    </div>

    <div
      v-if="items.length"
      class="sandbox-action-list__items"
    >
      <div
        v-for="item in items"
        :key="item.id"
        class="sandbox-action-list__item"
      >
        <div class="sandbox-action-list__item-info">
          <RuntimeStatusBadge
            :status="item.status ?? 'NEW'"
            size="small"
          />
          <span class="sandbox-action-list__item-key">{{ commandLabel(item) }}</span>
          <span class="sandbox-action-list__item-target">→ {{ item.target_code || '—' }}</span>
        </div>
        <div class="sandbox-action-list__item-action">
          <el-button
            v-if="item.status === 'NEW' || item.status === 'DISPATCHING'"
            size="small"
            type="primary"
            plain
            :loading="loading === item.id"
            @click="emit('trigger', item)"
          >
            触发编排
          </el-button>
          <el-button
            v-else-if="item.status === 'SENT'"
            size="small"
            type="warning"
            plain
            :loading="loading === item.id"
            @click="emit('ack', item)"
          >
            模拟 ACK
          </el-button>
          <el-button
            v-else-if="item.status === 'ACKED'"
            size="small"
            type="success"
            plain
            :loading="loading === item.id"
            @click="emit('result', item)"
          >
            模拟 Result
          </el-button>
          <el-button
            v-else-if="item.status === 'FAILED'"
            size="small"
            type="danger"
            plain
            :loading="loading === item.id"
            @click="emit('retry', item)"
          >
            重试
          </el-button>
        </div>
      </div>
    </div>

    <div
      v-else
      class="sandbox-action-list__empty"
    >
      无待操作命令
    </div>

    <!-- Completed section -->
    <template v-if="completedItemsResolved.length">
      <div class="sandbox-action-list__divider" />
      <div class="sandbox-action-list__header">
        <span class="sandbox-action-list__title">已完成</span>
        <span class="sandbox-action-list__count">{{ completedItemsResolved.length }}</span>
      </div>
      <div class="sandbox-action-list__completed">
        <div
          v-for="sessionGroup in completedItemsResolved"
          :key="`completed-${sessionGroup.session.id}`"
          class="sandbox-action-list__completed-session"
        >
          <div
            class="sandbox-action-list__completed-session-header"
            @click="toggleSession(sessionGroup.session.id)"
          >
            <svg
              class="sandbox-action-list__completed-chevron"
              :class="{
                'sandbox-action-list__completed-chevron--open': expandedSessions.has(
                  sessionGroup.session.id
                )
              }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z"
                clip-rule="evenodd"
              />
            </svg>
            <RuntimeStatusBadge
              :status="sessionGroup.session.status"
              size="small"
            />
            <span class="sandbox-action-list__completed-session-event">
              {{ sessionGroup.session.event_type || '—' }}
            </span>
            <span class="sandbox-action-list__completed-session-step">
              {{ sessionGroup.session.step_code || '—' }}
            </span>
            <span class="sandbox-action-list__completed-session-code">
              {{ sessionGroup.session.session_code }}
            </span>
            <span class="sandbox-action-list__completed-session-count">
              {{ sessionGroup.outbox_items.length }} 条命令
            </span>
          </div>
          <div
            v-if="expandedSessions.has(sessionGroup.session.id)"
            class="sandbox-action-list__completed-session-body"
          >
            <div
              v-if="sessionGroup.session.event_payload"
              class="sandbox-action-list__completed-session-payload"
            >
              <pre class="sandbox-action-list__payload-json">{{
                formatPayload(sessionGroup.session.event_payload)
              }}</pre>
            </div>
            <div class="sandbox-action-list__completed-items">
              <div
                v-for="item in sessionGroup.outbox_items"
                :key="`outbox-${item.id}`"
                class="sandbox-action-list__completed-item"
              >
                <span class="sandbox-action-list__completed-item-key">
                  {{ commandLabel(item) }}
                </span>
                <span class="sandbox-action-list__completed-item-target">
                  → {{ item.target_code || '—' }}
                </span>
                <RuntimeStatusBadge
                  :status="item.status ?? 'ACKED'"
                  size="small"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import type { SandboxCompletedSession, SandboxPendingOutbox } from '@/types/runtime'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'

const props = defineProps<{
  items: SandboxPendingOutbox[]
  completedItems?: SandboxCompletedSession[]
  loading?: number | null
}>()

const expandedSessions = ref<Set<number>>(new Set())

function toggleSession(sessionId: number) {
  const set = expandedSessions.value
  if (set.has(sessionId)) {
    set.delete(sessionId)
  } else {
    set.add(sessionId)
  }
  expandedSessions.value = new Set(set)
}

const completedItemsResolved = computed(() => props.completedItems ?? [])

const emit = defineEmits<{
  trigger: [item: SandboxPendingOutbox]
  ack: [item: SandboxPendingOutbox]
  result: [item: SandboxPendingOutbox]
  retry: [item: SandboxPendingOutbox]
}>()

import { displayCommand } from '@/utils/runtime-display-identity'

function commandLabel(item: SandboxPendingOutbox): string {
  return displayCommand({
    command_code: null,
    dispatch_key: item.dispatch_key
  })
}

function formatPayload(payload: Record<string, unknown>): string {
  return JSON.stringify(payload, null, 2)
}
</script>

<style scoped>
.sandbox-action-list__header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.sandbox-action-list__title {
  color: var(--runtime-text-secondary, #94a3b8);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.sandbox-action-list__count {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.sandbox-action-list__items {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.sandbox-action-list__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid rgb(245, 158, 11, 0.08);
  border-radius: 8px;
  background: var(--runtime-surface-subtle);
}

.sandbox-action-list__item-info {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.sandbox-action-list__item-key {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sandbox-action-list__item-target {
  color: var(--runtime-text-secondary);
  font-size: 12px;
  flex-shrink: 0;
}

.sandbox-action-list__item-action {
  flex-shrink: 0;
}

.sandbox-action-list__empty {
  padding: 16px;
  color: var(--runtime-text-muted);
  font-size: 12px;
  text-align: center;
}

.sandbox-action-list__divider {
  margin: 16px 0;
  border-top: 1px solid rgb(245, 158, 11, 0.1);
}

.sandbox-action-list__completed {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sandbox-action-list__completed-session {
  padding: 10px;
  border-radius: 8px;
  background: var(--runtime-surface-subtle);
  border: 1px solid var(--runtime-border-neutral);
}

.sandbox-action-list__completed-session-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 0;
  cursor: pointer;
  user-select: none;
}

.sandbox-action-list__completed-chevron {
  width: 16px;
  height: 16px;
  color: var(--runtime-text-muted);
  flex-shrink: 0;
  transition: transform 0.2s ease;
}

.sandbox-action-list__completed-chevron--open {
  transform: rotate(90deg);
}

.sandbox-action-list__completed-session-step {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.sandbox-action-list__completed-session-event {
  color: var(--runtime-badge-info-text);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.sandbox-action-list__completed-session-code {
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
}

.sandbox-action-list__completed-session-count {
  color: var(--runtime-text-muted);
  font-size: 11px;
  margin-left: auto;
}

.sandbox-action-list__completed-session-payload {
  margin-top: 10px;
  margin-bottom: 8px;
  padding: 8px 10px;
  border-radius: 6px;
  background: var(--runtime-surface-subtle);
  border: 1px solid var(--runtime-border-neutral);
}

.sandbox-action-list__completed-session-body {
  margin-top: 10px;
}

.sandbox-action-list__payload-json {
  margin: 0;
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 11px;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-all;
  max-height: 200px;
  overflow-y: auto;
}

.sandbox-action-list__completed-items {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.sandbox-action-list__completed-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
  border-radius: 6px;
  background: var(--runtime-surface-subtle);
  opacity: 0.7;
}

.sandbox-action-list__completed-item-key {
  color: var(--runtime-text-secondary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.sandbox-action-list__completed-item-target {
  color: var(--runtime-text-muted);
  font-size: 12px;
  flex-shrink: 0;
}
</style>
