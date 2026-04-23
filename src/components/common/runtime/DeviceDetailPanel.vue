<template>
  <div class="device-detail-panel">
    <button type="button" class="device-detail-panel__close" @click="emit('close')">
      <el-icon :size="14"><Close /></el-icon>
      <span>收起设备详情</span>
    </button>

    <div v-if="loading" class="device-detail-panel__skeleton" />

    <div v-else-if="error" class="device-detail-panel__error">
      <span class="device-detail-panel__error-text">{{ error }}</span>
      <el-button plain size="small" @click="loadDetail">重试</el-button>
    </div>

    <template v-else-if="detail">
      <DeviceHealthHero :summary="detail.summary" class="device-detail-panel__hero" />

      <section class="device-detail-panel__section">
        <button
          type="button"
          class="device-detail-panel__section-toggle"
          @click="activityExpanded = !activityExpanded"
        >
          <h3 class="device-detail-panel__section-title">最近行为</h3>
          <el-icon :size="12"><ArrowUp v-if="activityExpanded" /><ArrowDown v-else /></el-icon>
        </button>

        <div v-if="activityExpanded" class="device-detail-panel__section-body">
          <div v-if="activityFeed.length" class="device-detail-panel__activity-list">
            <div v-for="item in activityFeed" :key="item.key" class="device-detail-panel__activity-item">
              <span class="device-detail-panel__activity-time">{{ item.timeLabel }}</span>
              <span class="device-detail-panel__activity-action">{{ item.title }}</span>
              <span class="device-detail-panel__activity-msg">{{ item.message }}</span>
            </div>
          </div>
          <span v-else class="device-detail-panel__empty-hint">暂无行为记录</span>
        </div>
      </section>

      <section class="device-detail-panel__section">
        <button
          type="button"
          class="device-detail-panel__section-toggle"
          @click="failureExpanded = !failureExpanded"
        >
          <h3 class="device-detail-panel__section-title">异常模式</h3>
          <el-icon :size="12"><ArrowUp v-if="failureExpanded" /><ArrowDown v-else /></el-icon>
        </button>

        <div v-if="failureExpanded" class="device-detail-panel__section-body">
          <div v-if="failurePatterns.length" class="device-detail-panel__pattern-list">
            <div v-for="pattern in failurePatterns" :key="pattern.title" class="device-detail-panel__pattern-item">
              <span class="device-detail-panel__pattern-label">{{ pattern.title }}</span>
              <strong class="device-detail-panel__pattern-value">{{ pattern.value }}</strong>
              <span class="device-detail-panel__pattern-hint">{{ pattern.hint }}</span>
            </div>
          </div>
          <span v-else class="device-detail-panel__empty-hint">暂无明显异常模式</span>
        </div>
      </section>

      <section class="device-detail-panel__section">
        <h3 class="device-detail-panel__section-title">关联 Trace</h3>

        <div v-if="relatedTraces.length" class="device-detail-panel__trace-list">
          <button
            v-for="item in relatedTraces"
            :key="item.session_id"
            type="button"
            class="device-detail-panel__trace-item"
            @click="emit('openTrace', item.session_id)"
          >
            <RuntimeStatusBadge :status="item.status" size="small" />
            <span class="device-detail-panel__trace-code">{{ item.session_code }}</span>
            <span class="device-detail-panel__trace-time">{{ formatRuntimeElapsed(item.started_at) }}</span>
            <span class="device-detail-panel__trace-domain">{{ translateFailureDomain(item.failure_domain) }}</span>
          </button>
        </div>
        <span v-else class="device-detail-panel__empty-hint">无关联 Trace</span>
      </section>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { ArrowDown, ArrowUp, Close } from '@element-plus/icons-vue'
import DeviceHealthHero from '@/components/common/runtime/DeviceHealthHero.vue'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import { runtimeApiMethods } from '@/api/modules/runtime'
import type { RuntimeDeviceDetailResponse, TraceCallbackLogItem, TraceCommandItem } from '@/types/runtime'
import {
  compactEnumLabel,
  formatRuntimeDateTime,
  formatRuntimeDurationMs,
  pickDominantValue
} from '@/utils/runtime-display'
import { translateAction, translateFailureDomain } from '@/utils/runtime-labels'

interface Props {
  deviceId: number
  worklineId: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'openTrace', sessionId: number): void
}>()

const loading = ref(false)
const error = ref<string | null>(null)
const detail = ref<RuntimeDeviceDetailResponse | null>(null)
const activityExpanded = ref(true)
const failureExpanded = ref(false)

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

const activityFeed = computed(() => {
  if (!detail.value) return []

  const commandItems = detail.value.recent_commands.map(command => buildCommandActivity(command))
  const callbackItems = detail.value.recent_callbacks.map(callback => buildCallbackActivity(callback))

  return [...commandItems, ...callbackItems]
    .sort((left, right) => right.sortTime - left.sortTime)
    .slice(0, 10)
})

const failurePatterns = computed(() => {
  if (!detail.value) return []

  const callbackFailures = detail.value.recent_callbacks.filter(
    item => item.failure_stage || item.response_status >= 400
  )
  const failedCommands = detail.value.recent_commands.filter(
    item => ['FAILED', 'CANCELLED', 'TIMEOUT'].includes(item.status)
  )

  const frequentFailureStage = pickDominantValue(
    callbackFailures.map(item => item.failure_stage || item.ingress_outcome || `HTTP ${item.response_status}`)
  )
  const frequentCommandStatus = pickDominantValue(failedCommands.map(item => item.status))
  const frequentTaskType = pickDominantValue(detail.value.recent_commands.map(item => item.task_type))

  const patterns: { title: string; value: string; hint: string }[] = []

  if (frequentFailureStage) {
    patterns.push({
      title: '回调失败热点',
      value: frequentFailureStage,
      hint: callbackFailures.length ? `${callbackFailures.length} 次可疑回调失败` : '暂无明显热点'
    })
  }

  if (frequentCommandStatus) {
    patterns.push({
      title: '命令失败状态',
      value: frequentCommandStatus,
      hint: failedCommands.length ? `失败命令 ${failedCommands.length} 条` : '命令执行稳定'
    })
  }

  if (frequentTaskType) {
    patterns.push({
      title: '高频任务类型',
      value: frequentTaskType,
      hint: '判断设备主要承载的任务类型'
    })
  }

  return patterns.slice(0, 3)
})

const relatedTraces = computed(() => {
  if (!detail.value) return []
  return detail.value.active_sessions.slice(0, 5)
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
    if (!controller.signal.aborted) {
      loading.value = false
    }
  }
}

function formatRuntimeElapsed(start?: string | null): string {
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
.device-detail-panel {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  border: 1px solid rgb(245, 158, 11, 0.12);
  border-radius: 14px;
  background: transparent;
}

.device-detail-panel__close {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  color: #94a3b8;
  font-size: 12px;
  cursor: pointer;
  transition: color 0.15s ease-out;
}

.device-detail-panel__close:hover {
  color: #f8fafc;
}

.device-detail-panel__skeleton {
  height: 300px;
  border-radius: 10px;
  background: linear-gradient(
    90deg,
    rgb(30, 41, 59, 0.5) 25%,
    rgb(30, 41, 59, 0.7) 50%,
    rgb(30, 41, 59, 0.5) 75%
  );
  background-size: 200% 100%;
  animation: device-panel-shimmer 1.5s ease-in-out infinite;
}

@keyframes device-panel-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.device-detail-panel__error {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px 0;
}

.device-detail-panel__error-text {
  color: #dc2626;
  font-size: 13px;
}

.device-detail-panel__hero {
  max-height: 80px;
  overflow: hidden;
}

.device-detail-panel__hero :deep(.el-card__body) {
  padding: 12px 14px;
  gap: 8px;
}

.device-detail-panel__hero :deep(.device-health-hero__facts) {
  display: none;
}

.device-detail-panel__hero :deep(.device-health-hero__title) {
  font-size: 18px;
}

.device-detail-panel__section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.device-detail-panel__section-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
}

.device-detail-panel__section-title {
  margin: 0;
  color: #94a3b8;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.device-detail-panel__section-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-detail-panel__activity-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.device-detail-panel__activity-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 6px 0;
  border-bottom: 1px solid rgb(245, 158, 11, 0.06);
}

.device-detail-panel__activity-item:last-child {
  border-bottom: none;
}

.device-detail-panel__activity-time {
  color: #94a3b8;
  font-size: 11px;
}

.device-detail-panel__activity-action {
  color: #f8fafc;
  font-size: 14px;
  font-weight: 600;
}

.device-detail-panel__activity-msg {
  color: #94a3b8;
  font-size: 12px;
}

.device-detail-panel__pattern-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-detail-panel__pattern-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 8px 10px;
  border: 1px solid rgb(245, 158, 11, 0.08);
  border-radius: 8px;
  background: rgb(30, 41, 59, 0.5);
}

.device-detail-panel__pattern-label {
  color: #94a3b8;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.device-detail-panel__pattern-value {
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 14px;
}

.device-detail-panel__pattern-hint {
  color: #94a3b8;
  font-size: 12px;
}

.device-detail-panel__trace-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.device-detail-panel__trace-item {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  padding: 6px 8px;
  border: 1px solid rgb(245, 158, 11, 0.08);
  border-radius: 8px;
  background: rgb(30, 41, 59, 0.5);
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s ease-out,
    background 0.15s ease-out;
}

.device-detail-panel__trace-item:hover {
  border-color: rgb(245, 158, 11, 0.28);
  background: rgb(30, 41, 59, 0.7);
}

.device-detail-panel__trace-code {
  color: #f8fafc;
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
}

.device-detail-panel__trace-time {
  color: #94a3b8;
  font-size: 12px;
}

.device-detail-panel__trace-domain {
  margin-left: auto;
  color: #94a3b8;
  font-size: 11px;
}

.device-detail-panel__empty-hint {
  color: #64748b;
  font-size: 12px;
}
</style>
