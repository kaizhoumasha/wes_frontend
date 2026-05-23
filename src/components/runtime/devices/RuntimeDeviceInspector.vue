<template>
  <div class="runtime-device-inspector">
    <button
      v-if="showHeader"
      type="button"
      class="runtime-device-inspector__close"
      @click="emit('close')"
    >
      <el-icon :size="14"><Close /></el-icon>
      <span>收起设备详情</span>
    </button>

    <div
      v-if="loading"
      class="runtime-device-inspector__skeleton"
    />

    <div
      v-else-if="error"
      class="runtime-device-inspector__error"
    >
      <span class="runtime-device-inspector__error-text">{{ error }}</span>
      <el-button
        plain
        size="small"
        @click="loadDetail"
      >
        重试
      </el-button>
    </div>

    <template v-else-if="detail">
      <!-- 设备身份头部 -->
      <div class="runtime-device-inspector__identity">
        <div class="runtime-device-inspector__identity-header">
          <RuntimeStatusBadge
            :status="detail.summary.device_status"
            pulse
          />
          <h2 class="runtime-device-inspector__device-name">
            {{ detail.summary.device_name }}
          </h2>
        </div>
        <div class="runtime-device-inspector__identity-meta">
          <span class="runtime-device-inspector__device-code">
            {{ detail.summary.device_code }}
          </span>
          <span class="runtime-device-inspector__meta-sep">·</span>
          <span class="runtime-device-inspector__device-role">
            {{ detail.summary.device_role }} #{{ detail.summary.role_index }}
          </span>
          <span class="runtime-device-inspector__meta-sep">·</span>
          <span class="runtime-device-inspector__workline-name">
            {{ detail.summary.workline_name || '工作线' }}
          </span>
        </div>
      </div>

      <!-- 异常警报区 -->
      <div
        v-if="showAlert"
        class="runtime-device-inspector__alert"
        :class="{
          'is-error': detail.summary.error_code,
          'is-maintenance': detail.summary.maintenance_mode
        }"
      >
        <el-icon
          :size="16"
          class="runtime-device-inspector__alert-icon"
        >
          <WarningFilled v-if="detail.summary.error_code" />
          <Tools v-else-if="detail.summary.maintenance_mode" />
        </el-icon>
        <div class="runtime-device-inspector__alert-content">
          <strong v-if="detail.summary.error_code">
            设备错误: {{ detail.summary.error_code }}
          </strong>
          <strong v-else-if="detail.summary.maintenance_mode">维护模式已启用</strong>
        </div>
      </div>

      <!-- 关键指标卡片 -->
      <div class="runtime-device-inspector__metrics">
        <div class="runtime-device-inspector__metric">
          <span class="runtime-device-inspector__metric-label">未完成命令</span>
          <strong class="runtime-device-inspector__metric-value">
            {{ openCommandCount }}
          </strong>
        </div>
        <div class="runtime-device-inspector__metric">
          <span class="runtime-device-inspector__metric-label">异常 Hold</span>
          <strong class="runtime-device-inspector__metric-value">
            {{ activeRuntimeHoldIds.length }}
          </strong>
        </div>
        <div class="runtime-device-inspector__metric">
          <span class="runtime-device-inspector__metric-label">当前命令</span>
          <strong
            class="runtime-device-inspector__metric-value"
            :class="{ 'is-empty': !detail.summary.current_command_id }"
          >
            {{ detail.summary.current_command_id || '—' }}
          </strong>
        </div>
        <div class="runtime-device-inspector__metric">
          <span class="runtime-device-inspector__metric-label">最近心跳</span>
          <strong class="runtime-device-inspector__metric-value">
            {{ formatRuntimeDateTime(detail.summary.last_heartbeat_at) }}
          </strong>
        </div>
        <div class="runtime-device-inspector__metric">
          <span class="runtime-device-inspector__metric-label">最近回调</span>
          <strong
            class="runtime-device-inspector__metric-value"
            :class="{ 'is-empty': !detail.summary.recent_callback_at }"
          >
            {{
              detail.summary.recent_callback_at
                ? formatRuntimeDateTime(detail.summary.recent_callback_at)
                : '—'
            }}
          </strong>
        </div>
      </div>

      <section class="runtime-device-inspector__section">
        <div class="runtime-device-inspector__section-header">
          <h3 class="runtime-device-inspector__section-title">未完成命令</h3>
        </div>
        <div
          v-if="openCommandCount > 0 || detail.summary.current_command_id"
          class="runtime-device-inspector__command-card"
        >
          <span>当前命令</span>
          <strong>{{ detail.summary.current_command_id || '等待 ACK / RESULT' }}</strong>
        </div>
        <span
          v-else
          class="runtime-device-inspector__empty-hint"
        >
          无未完成命令
        </span>
      </section>

      <section class="runtime-device-inspector__section">
        <div class="runtime-device-inspector__section-header">
          <h3 class="runtime-device-inspector__section-title">
            异常 Runtime Hold
            <span
              v-if="activeRuntimeHoldIds.length"
              class="runtime-device-inspector__section-count"
            >
              {{ activeRuntimeHoldIds.length }}
            </span>
          </h3>
        </div>
        <div
          v-if="activeRuntimeHoldIds.length"
          class="runtime-device-inspector__hold-list"
        >
          <RouterLink
            v-for="holdId in activeRuntimeHoldIds"
            :key="holdId"
            class="runtime-device-inspector__hold-card"
            :to="{ name: 'RuntimeHoldDetail', params: { holdId } }"
          >
            Runtime Hold #{{ holdId }}
          </RouterLink>
        </div>
        <span
          v-else
          class="runtime-device-inspector__empty-hint"
        >
          无异常 Hold
        </span>
      </section>

      <section class="runtime-device-inspector__section">
        <div class="runtime-device-inspector__section-header">
          <h3 class="runtime-device-inspector__section-title">
            历史命令
            <span
              v-if="detail.recent_commands.length"
              class="runtime-device-inspector__section-count"
            >
              {{ detail.recent_commands.length }}
            </span>
          </h3>
        </div>
        <div
          v-if="detail.recent_commands.length"
          class="runtime-device-inspector__history-command-list"
        >
          <div
            v-for="command in detail.recent_commands.slice(0, 5)"
            :key="command.id"
            class="runtime-device-inspector__history-command"
          >
            <RuntimeStatusBadge
              :status="command.status"
              size="small"
            />
            <span>{{ command.command_code }}</span>
          </div>
        </div>
        <span
          v-else
          class="runtime-device-inspector__empty-hint"
        >
          无历史命令
        </span>
      </section>

      <!-- 关联会话 -->
      <section class="runtime-device-inspector__section">
        <div class="runtime-device-inspector__section-header">
          <h3 class="runtime-device-inspector__section-title">
            关联会话
            <span
              v-if="detail.active_sessions.length"
              class="runtime-device-inspector__section-count"
            >
              {{ detail.active_sessions.length }}
            </span>
          </h3>
        </div>

        <div
          v-if="detail.active_sessions.length"
          class="runtime-device-inspector__session-list"
        >
          <button
            v-for="item in detail.active_sessions.slice(0, 5)"
            :key="item.session_id"
            type="button"
            class="runtime-device-inspector__session-card"
            @click="emit('selectSession', item)"
          >
            <div class="runtime-device-inspector__session-main">
              <RuntimeStatusBadge
                :status="item.status"
                size="small"
              />
              <span class="runtime-device-inspector__session-code">
                {{ item.trace_id || item.session_code }}
              </span>
            </div>
            <span class="runtime-device-inspector__session-time">
              {{ formatRuntimeElapsed(item.started_at) }}
            </span>
          </button>
        </div>
        <span
          v-else
          class="runtime-device-inspector__empty-hint"
        >
          无关联会话
        </span>
      </section>

      <!-- 最近行为（默认折叠） -->
      <section class="runtime-device-inspector__section">
        <button
          type="button"
          class="runtime-device-inspector__section-toggle"
          @click="activityExpanded = !activityExpanded"
        >
          <div class="runtime-device-inspector__section-header">
            <h3 class="runtime-device-inspector__section-title">
              最近行为
              <span
                v-if="activityFeed.length"
                class="runtime-device-inspector__section-count"
              >
                {{ activityFeed.length }}
              </span>
            </h3>
          </div>
          <el-icon :size="12">
            <ArrowUp v-if="activityExpanded" />
            <ArrowDown v-else />
          </el-icon>
        </button>

        <div
          v-if="activityExpanded"
          class="runtime-device-inspector__section-body"
        >
          <div
            v-if="activityFeed.length"
            class="runtime-device-inspector__activity-timeline"
          >
            <div
              v-for="(item, index) in activityFeed"
              :key="item.key"
              class="runtime-device-inspector__timeline-item"
              :class="{ 'is-last': index === activityFeed.length - 1 }"
            >
              <div class="runtime-device-inspector__timeline-marker">
                <span class="runtime-device-inspector__timeline-dot" />
                <span
                  v-if="index !== activityFeed.length - 1"
                  class="runtime-device-inspector__timeline-line"
                />
              </div>
              <div class="runtime-device-inspector__timeline-content">
                <div class="runtime-device-inspector__timeline-header">
                  <span class="runtime-device-inspector__timeline-time">{{ item.timeLabel }}</span>
                  <span class="runtime-device-inspector__timeline-action">{{ item.title }}</span>
                </div>
                <span class="runtime-device-inspector__timeline-msg">{{ item.message }}</span>
              </div>
            </div>
          </div>
          <span
            v-else
            class="runtime-device-inspector__empty-hint"
          >
            暂无行为记录
          </span>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
import { ArrowDown, ArrowUp, Close, Tools, WarningFilled } from '@element-plus/icons-vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import type {
  RuntimeDeviceDetailResponse,
  RuntimeTraceListItem,
  TraceCallbackLogItem,
  TraceCommandItem,
  WorklineMode
} from '@/types/runtime'
import {
  compactEnumLabel,
  formatRuntimeDateTime,
  formatRuntimeDurationMs
} from '@/utils/runtime-display'
import { translateAction } from '@/utils/runtime-labels'

interface Props {
  deviceId: number
  worklineId: number
  mode?: WorklineMode
  showHeader?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'live',
  showHeader: true
})

const emit = defineEmits<{
  close: []
  selectSession: [session: RuntimeTraceListItem]
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const detail = ref<RuntimeDeviceDetailResponse | null>(null)
const activityExpanded = ref(false) // 默认折叠

let abortController: AbortController | null = null

onBeforeUnmount(() => {
  abortController?.abort()
})

watch(
  () => props.deviceId,
  () => {
    loadDetail()
  },
  { immediate: true }
)

const showAlert = computed(() => {
  if (!detail.value) return false
  return Boolean(detail.value.summary.error_code) || detail.value.summary.maintenance_mode
})

const openCommandCount = computed(
  () => detail.value?.summary.open_command_count ?? detail.value?.summary.pending_command_count ?? 0
)

const activeRuntimeHoldIds = computed(() => detail.value?.summary.active_runtime_hold_ids ?? [])

const activityFeed = computed(() => {
  if (!detail.value) return []
  const commandItems = detail.value.recent_commands.map(buildCommandActivity)
  const callbackItems = detail.value.recent_callbacks.map(buildCallbackActivity)
  return [...commandItems, ...callbackItems]
    .sort((left, right) => right.sortTime - left.sortTime)
    .slice(0, 10)
})

function toEpoch(value?: string | null) {
  if (!value) return 0
  try {
    return new Date(value).getTime()
  } catch {
    return 0
  }
}

function buildCommandActivity(command: TraceCommandItem) {
  const time = command.completed_at || command.ack_received_at || command.sent_at
  return {
    key: `command-${command.id}`,
    sortTime: toEpoch(time),
    timeLabel: time ? formatRuntimeDateTime(time) : '--',
    title: translateAction(command.task_type),
    message: `${command.command_code} · ${formatRuntimeDurationMs(command.duration_ms)}`
  }
}

function buildCallbackActivity(callback: TraceCallbackLogItem) {
  const time = callback.updated_at || callback.created_at
  return {
    key: `callback-${callback.id}`,
    sortTime: toEpoch(time),
    timeLabel: formatRuntimeDateTime(time),
    title: translateAction(callback.callback_type),
    message: compactEnumLabel(callback.ingress_outcome) || `HTTP ${callback.response_status}`
  }
}

async function loadDetail() {
  abortController?.abort()
  const controller = new AbortController()
  abortController = controller
  loading.value = true
  error.value = null
  detail.value = null
  try {
    detail.value = await runtimeApiMethods.deviceDetail(props.deviceId, props.worklineId).send()
  } catch (err: unknown) {
    if (controller.signal.aborted) return
    error.value = err instanceof Error ? err.message : '加载设备详情失败'
  } finally {
    if (!controller.signal.aborted) loading.value = false
  }
}

import { formatRuntimeElapsed } from '@/utils/runtime-display'
</script>

<style scoped>
.runtime-device-inspector {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  gap: 16px;
  background: transparent;
}

/* 关闭按钮 */
.runtime-device-inspector__close {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s ease-out;
}

.runtime-device-inspector__close:hover {
  color: var(--runtime-text-primary);
}

/* 加载骨架 */
.runtime-device-inspector__skeleton {
  height: 300px;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    var(--runtime-surface-subtle) 25%,
    var(--runtime-surface) 50%,
    var(--runtime-surface-subtle) 75%
  );
  background-size: 200% 100%;
  animation: inspector-shimmer 1.5s ease-in-out infinite;
}

@keyframes inspector-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}

/* 错误提示 */
.runtime-device-inspector__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 0;
}

.runtime-device-inspector__error-text {
  color: #dc2626;
  font-size: 13px;
}

/* 设备身份信息头部 */
.runtime-device-inspector__identity {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  border: 1px solid rgb(245, 158, 11, 0.16);
  border-radius: 12px;
  background: var(--runtime-hero-bg);
}

.runtime-device-inspector__identity-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.runtime-device-inspector__device-name {
  margin: 0;
  color: var(--runtime-text-primary);
  font-size: 20px;
  font-weight: 700;
  line-height: 1.3;
}

.runtime-device-inspector__identity-meta {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 4px 8px;
  color: var(--runtime-text-secondary);
  font-size: 12px;
}

.runtime-device-inspector__device-code {
  color: var(--runtime-text-emphasis);
  font-family: var(--font-mono);
  font-weight: 600;
}

.runtime-device-inspector__meta-sep {
  color: var(--runtime-text-muted);
}

.runtime-device-inspector__device-role {
  color: var(--runtime-text-secondary);
}

.runtime-device-inspector__workline-name {
  color: var(--runtime-text-muted);
}

/* 异常警报区 */
.runtime-device-inspector__alert {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 10px;
  background: var(--runtime-surface);
  border: 1px solid;
}

.runtime-device-inspector__alert.is-error {
  border-color: var(--runtime-border-danger);
  background: var(--runtime-surface-danger);
}

.runtime-device-inspector__alert.is-maintenance {
  border-color: var(--runtime-border-warning);
  background: var(--runtime-surface-warning);
}

.runtime-device-inspector__alert-icon {
  flex-shrink: 0;
}

.runtime-device-inspector__alert.is-error .runtime-device-inspector__alert-icon {
  color: #ef4444;
}

.runtime-device-inspector__alert.is-maintenance .runtime-device-inspector__alert-icon {
  color: rgb(245, 158, 11);
}

.runtime-device-inspector__alert-content strong {
  color: var(--runtime-text-primary);
  font-size: 13px;
  font-weight: 600;
}

/* 关键指标网格 */
.runtime-device-inspector__metrics {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.runtime-device-inspector__metric {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px;
  border: 1px solid rgb(245, 158, 11, 0.1);
  border-radius: 10px;
  background: var(--runtime-surface-subtle);
}

.runtime-device-inspector__metric-label {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.runtime-device-inspector__metric-value {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
}

.runtime-device-inspector__metric-value.is-empty {
  color: var(--runtime-text-muted);
}

/* 分区通用样式 */
.runtime-device-inspector__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.runtime-device-inspector__section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.runtime-device-inspector__section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.runtime-device-inspector__section-title {
  margin: 0;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: flex;
  align-items: center;
  gap: 8px;
}

.runtime-device-inspector__section-count {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: rgb(245, 158, 11, 0.2);
  color: rgb(245, 158, 11);
  font-size: 10px;
  font-weight: 700;
}

.runtime-device-inspector__section-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* 关联会话卡片 */
.runtime-device-inspector__session-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.runtime-device-inspector__command-card,
.runtime-device-inspector__hold-card,
.runtime-device-inspector__history-command {
  display: flex;
  align-items: center;
  gap: 10px;
  min-height: 44px;
  padding: 10px 12px;
  border: 1px solid rgb(245, 158, 11, 0.1);
  border-radius: 8px;
  background: var(--runtime-surface-subtle);
}

.runtime-device-inspector__command-card {
  justify-content: space-between;
}

.runtime-device-inspector__command-card span {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.runtime-device-inspector__command-card strong {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
}

.runtime-device-inspector__hold-list,
.runtime-device-inspector__history-command-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.runtime-device-inspector__hold-card {
  border-color: rgb(239, 68, 68, 0.28);
  background: rgb(239, 68, 68, 0.1);
  color: #fecaca;
  font-size: 13px;
  font-weight: 800;
  text-decoration: none;
}

.runtime-device-inspector__hold-card:hover {
  background: rgb(239, 68, 68, 0.16);
}

.runtime-device-inspector__history-command {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 12px;
  font-weight: 600;
}

.runtime-device-inspector__session-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 1px solid rgb(245, 158, 11, 0.1);
  border-radius: 10px;
  background: var(--runtime-surface-subtle);
  cursor: pointer;
  text-align: left;
  transition: all 0.15s ease-out;
}

.runtime-device-inspector__session-card:hover {
  border-color: rgb(245, 158, 11, 0.25);
  background: var(--runtime-surface);
  transform: translateX(2px);
}

.runtime-device-inspector__session-main {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.runtime-device-inspector__session-code {
  color: var(--runtime-text-primary);
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.runtime-device-inspector__session-time {
  flex-shrink: 0;
  color: var(--runtime-text-muted);
  font-size: 12px;
  font-family: var(--font-mono);
}

/* 时间线样式 */
.runtime-device-inspector__activity-timeline {
  display: flex;
  flex-direction: column;
  padding-left: 4px;
}

.runtime-device-inspector__timeline-item {
  display: flex;
  gap: 12px;
  padding: 8px 0;
}

.runtime-device-inspector__timeline-item.is-last {
  padding-bottom: 0;
}

.runtime-device-inspector__timeline-marker {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  width: 16px;
  padding-top: 4px;
}

.runtime-device-inspector__timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgb(245, 158, 11, 0.6);
  box-shadow: 0 0 0 3px rgb(245, 158, 11, 0.15);
}

.runtime-device-inspector__timeline-line {
  flex: 1;
  width: 1px;
  min-height: 20px;
  margin: 4px 0;
  background: linear-gradient(180deg, rgb(245, 158, 11, 0.3) 0%, rgb(245, 158, 11, 0.1) 100%);
}

.runtime-device-inspector__timeline-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-bottom: 12px;
  flex: 1;
}

.runtime-device-inspector__timeline-item.is-last .runtime-device-inspector__timeline-content {
  padding-bottom: 0;
}

.runtime-device-inspector__timeline-header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.runtime-device-inspector__timeline-time {
  color: var(--runtime-text-muted);
  font-size: 11px;
  font-family: var(--font-mono);
  flex-shrink: 0;
}

.runtime-device-inspector__timeline-action {
  color: var(--runtime-text-primary);
  font-size: 13px;
  font-weight: 600;
}

.runtime-device-inspector__timeline-msg {
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

/* 空状态 */
.runtime-device-inspector__empty-hint {
  color: var(--runtime-text-muted);
  font-size: 12px;
  padding: 8px 0;
}

/* 响应式 */
@media (width <= 1279px) {
  .runtime-device-inspector__identity {
    padding: 14px;
  }

  .runtime-device-inspector__device-name {
    font-size: 18px;
  }

  .runtime-device-inspector__metrics {
    grid-template-columns: 1fr;
  }
}
</style>
