<template>
  <section
    class="workline-reconciliation-form"
    role="alert"
    aria-live="assertive"
  >
    <div class="workline-reconciliation-form__status-bar" />
    <div class="workline-reconciliation-form__body">
      <div class="workline-reconciliation-form__main">
        <RuntimeStatusBadge
          label="运行时对账中"
          tone="warning"
          size="small"
        />
        <h2 class="workline-reconciliation-form__title">运行时对账中</h2>
        <p class="workline-reconciliation-form__copy">
          已暂停该 WorkLine 的后续派发；需人工确认现场状态后解除隔离。
        </p>
        <p class="workline-reconciliation-form__meta">
          <span>{{ ownerSessionLabel }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ reasonLabel }}</span>
          <span aria-hidden="true">·</span>
          <span>{{ occurredAtLabel }}</span>
        </p>
        <p
          v-if="deviceCommandLabel !== '—' || lateEvidenceLabel"
          class="workline-reconciliation-form__meta workline-reconciliation-form__meta--secondary"
        >
          <span>{{ deviceCommandLabel }}</span>
          <span aria-hidden="true">·</span>
          <span>迟到证据 {{ lateEvidenceLabel }}</span>
        </p>
      </div>

      <div class="workline-reconciliation-form__form">
        <el-radio-group
          v-model="resolution"
          size="small"
        >
          <el-radio-button
            label="COMPLETED"
            value="COMPLETED"
            data-test="resolution-completed"
          >
            现场已完成
          </el-radio-button>
          <el-radio-button
            label="FAILED"
            value="FAILED"
            data-test="resolution-failed"
          >
            现场失败
          </el-radio-button>
          <el-radio-button
            label="CANCELLED"
            value="CANCELLED"
            data-test="resolution-cancelled"
          >
            取消流程
          </el-radio-button>
        </el-radio-group>

        <el-checkbox-group
          v-model="checkedKeys"
          class="workline-reconciliation-form__checks"
        >
          <el-checkbox
            v-for="item in requiredChecks"
            :key="item.key"
            :value="item.key"
            :label="item.key"
          >
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>

        <el-input
          v-model="operatorNote"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 4 }"
          maxlength="1000"
          show-word-limit
          placeholder="填写现场确认说明"
          data-test="operator-note"
        />

        <el-input
          v-if="resolution === 'COMPLETED'"
          v-model="resultPayloadText"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 5 }"
          :placeholder="resultPayloadPlaceholder"
          data-test="result-payload"
        />
      </div>

      <div class="workline-reconciliation-form__actions">
        <el-button
          plain
          :loading="loading"
          data-test="refresh-evidence"
          @click="emit('refresh')"
        >
          刷新证据
        </el-button>
        <el-button
          type="primary"
          :loading="resolving"
          :disabled="submitDisabled"
          :title="submitDisabledReason"
          data-test="submit-resolve"
          @click="submitResolve"
        >
          解除隔离 / 恢复派发
        </el-button>
        <p
          v-if="submitDisabledReason && !resolving"
          class="workline-reconciliation-form__disabled-reason"
        >
          {{ submitDisabledReason }}
        </p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import RuntimeStatusBadge from '@/components/common/runtime/RuntimeStatusBadge.vue'
import type { RuntimeMonitorReconciliationCandidate, RuntimeWorklineSummary } from '@/types/runtime'
import { formatRuntimeDateTime } from '@/utils/runtime-display'

type Resolution = 'COMPLETED' | 'FAILED' | 'CANCELLED'

interface CheckItem {
  key: string
  label: string
}

const CALLBACK_TIMEOUT_CHECKS: CheckItem[] = [
  { key: 'device_inspected', label: '已检查设备状态' },
  { key: 'physical_state_confirmed', label: '已确认现场物理状态' },
  { key: 'inventory_or_position_reconciled', label: '已核对库存/位置状态' },
  { key: 'late_callback_reviewed', label: '已检查迟到 callback 证据' }
]

const DISPATCH_ACK_CHECKS: CheckItem[] = [
  { key: 'device_reachable_checked', label: '已确认设备通信可达' },
  { key: 'command_code_checked', label: '已核对命令编码与现场动作' },
  { key: 'physical_state_confirmed', label: '已确认现场物理状态' }
]

const REASON_LABELS: Record<string, string> = {
  CALLBACK_DEADLINE_EXPIRED: 'Callback deadline expired',
  COMMAND_ACK_EXHAUSTED: 'Command ACK exhausted',
  OUTBOX_DISPATCH_FAILED: 'Outbox dispatch failed'
}

const props = defineProps<{
  summary: RuntimeWorklineSummary
  candidate?: RuntimeMonitorReconciliationCandidate | null
  loading?: boolean
  resolving?: boolean
  canResolve?: boolean
}>()

const emit = defineEmits<{
  refresh: []
  resolve: [
    payload: {
      sessionId: number
      resolution: Resolution
      checks: Record<string, boolean>
      operatorNote: string
      resultPayload: Record<string, unknown> | null
    }
  ]
}>()

const resolution = ref<Resolution>('FAILED')
const checkedKeys = ref<string[]>([])
const operatorNote = ref('')
const resultPayloadText = ref('')
const resultPayloadPlaceholder = '可选业务结果 JSON，例如 {"confirmed_by":"operator"}'

const reason = computed(() => props.candidate?.reason ?? props.summary.stopped_reason ?? null)

const requiredChecks = computed(() => {
  if (reason.value === 'COMMAND_ACK_EXHAUSTED' || reason.value === 'OUTBOX_DISPATCH_FAILED') {
    return DISPATCH_ACK_CHECKS
  }
  return CALLBACK_TIMEOUT_CHECKS
})

watch(
  requiredChecks,
  items => {
    const allowed = new Set(items.map(item => item.key))
    checkedKeys.value = checkedKeys.value.filter(key => allowed.has(key))
  },
  { immediate: true }
)

const ownerSessionLabel = computed(() => {
  if (props.candidate) return `${props.candidate.session_code} (#${props.candidate.session_id})`
  return props.loading ? '加载中' : '未找到 pending session'
})

const reasonLabel = computed(() => {
  if (!reason.value) return props.loading ? '加载中' : '等待对账证据'
  return REASON_LABELS[reason.value] ?? reason.value
})

const occurredAtLabel = computed(() => {
  const occurredAt = props.candidate?.occurred_at ?? props.summary.stopped_at
  return occurredAt ? formatRuntimeDateTime(occurredAt) : '—'
})

const deviceCommandLabel = computed(() => {
  const parts = [
    props.candidate?.device_id ? `Device #${props.candidate.device_id}` : null,
    props.candidate?.command_id ? `Command #${props.candidate.command_id}` : null
  ].filter(Boolean)
  return parts.length ? parts.join(' / ') : '—'
})

const lateEvidenceLabel = computed(() =>
  props.candidate?.late_evidence_received ? '已收到' : '未收到'
)

const allChecksConfirmed = computed(() =>
  requiredChecks.value.every(item => checkedKeys.value.includes(item.key))
)

const submitDisabledReason = computed(() => {
  if (!props.canResolve) return '需要 biz:workline:resolve-reconciliation 权限'
  if (!props.candidate?.session_id) return '等待 pending reconciliation session 证据'
  if (!allChecksConfirmed.value) return '需要确认全部 checklist'
  if (!operatorNote.value.trim()) return '需要填写现场确认说明'
  return undefined
})

const submitDisabled = computed(() => props.resolving || Boolean(submitDisabledReason.value))

function buildChecks(): Record<string, boolean> {
  return Object.fromEntries(
    requiredChecks.value.map(item => [item.key, checkedKeys.value.includes(item.key)])
  )
}

function parseResultPayload(): Record<string, unknown> | null {
  if (resolution.value !== 'COMPLETED') return null
  const text = resultPayloadText.value.trim()
  if (!text) return {}
  try {
    const parsed = JSON.parse(text) as unknown
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>
    }
  } catch {
    // fall through to the validation error below
  }
  ElMessage.error('业务结果必须是 JSON 对象')
  return null
}

function submitResolve() {
  if (submitDisabled.value || !props.candidate?.session_id) return
  const resultPayload = parseResultPayload()
  if (resolution.value === 'COMPLETED' && resultPayload === null) return
  emit('resolve', {
    sessionId: props.candidate.session_id,
    resolution: resolution.value,
    checks: buildChecks(),
    operatorNote: operatorNote.value.trim(),
    resultPayload
  })
}
</script>

<style scoped>
.workline-reconciliation-form {
  display: flex;
  overflow: hidden;
  border: 1px solid rgb(var(--color-primary-rgb) / 0.36);
  border-radius: 8px;
  background: var(--runtime-surface, #111827);
}

.workline-reconciliation-form__status-bar {
  width: 4px;
  flex: 0 0 auto;
  background: var(--color-primary);
}

.workline-reconciliation-form__body {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(280px, 1.1fr) auto;
  gap: 16px;
  width: 100%;
  padding: 16px;
  align-items: start;
}

.workline-reconciliation-form__main,
.workline-reconciliation-form__form,
.workline-reconciliation-form__actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  min-width: 0;
}

.workline-reconciliation-form__title {
  margin: 0;
  color: var(--runtime-text-primary);
  font-size: 18px;
  font-weight: 700;
}

.workline-reconciliation-form__copy {
  margin: 0;
  color: var(--runtime-text-secondary);
  font-size: 13px;
  line-height: 1.6;
}

.workline-reconciliation-form__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  color: var(--runtime-text-secondary);
  font-size: 12px;
  line-height: 1.5;
}

.workline-reconciliation-form__meta--secondary {
  color: var(--runtime-text-muted);
}

.workline-reconciliation-form__checks {
  display: grid;
  gap: 4px;
}

.workline-reconciliation-form__actions {
  min-width: 180px;
}

.workline-reconciliation-form__disabled-reason {
  margin: 0;
  color: var(--runtime-text-secondary);
  font-size: 11px;
  line-height: 1.5;
}

@media (width <= 1180px) {
  .workline-reconciliation-form__body {
    grid-template-columns: 1fr;
  }

  .workline-reconciliation-form__actions {
    min-width: 0;
  }
}
</style>
