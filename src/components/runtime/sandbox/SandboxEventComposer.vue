<template>
  <div class="sandbox-event-composer">
    <!-- Device Info Card -->
    <el-alert
      v-if="disabled"
      type="error"
      :closable="false"
      show-icon
      class="sandbox-event-composer__safety-lock"
    >
      <template #title>软件急停冻结</template>
      <template #default>{{ disabledReasonResolved }}</template>
    </el-alert>

    <div class="sandbox-event-composer__device-card">
      <div class="sandbox-event-composer__device-icon">
        <svg
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
        </svg>
      </div>
      <div class="sandbox-event-composer__device-info">
        <span class="sandbox-event-composer__device-name">{{ deviceDisplay.name }}</span>
        <span class="sandbox-event-composer__device-meta">
          {{ deviceDisplay.role }} · {{ deviceDisplay.code }}
        </span>
      </div>
      <el-tag
        v-if="deviceDisplay.status"
        :type="deviceStatusType"
        size="small"
      >
        {{ deviceDisplay.status }}
      </el-tag>
    </div>

    <!-- Quick Actions -->
    <div class="sandbox-event-composer__quick-actions">
      <span class="sandbox-event-composer__section-label">快捷 Event</span>
      <div class="sandbox-event-composer__quick-btns">
        <el-button
          v-for="tpl in quickEvents"
          :key="tpl.event_type"
          size="small"
          plain
          :disabled="disabled"
          :title="disabled ? disabledReasonResolved : undefined"
          @click="handleQuickEvent(tpl.event_type)"
        >
          {{ tpl.label }}
        </el-button>
      </div>
    </div>

    <el-divider />

    <!-- Full Form -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <el-form-item
        label="Event 类型"
        prop="event_type"
      >
        <el-select
          v-model="form.event_type"
          placeholder="选择事件类型"
          :disabled="disabled"
          style="width: 100%"
          @change="handleEventTypeChange"
        >
          <el-option
            v-for="tpl in eventTemplates"
            :key="tpl.event_type"
            :label="tpl.label"
            :value="tpl.event_type"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Trace ID">
        <el-input
          v-model="form.trace_id"
          placeholder="自动生成或手动输入"
        >
          <template #append>
            <el-button @click="generateTraceId">
              <svg
                viewBox="0 0 20 20"
                fill="currentColor"
                class="sandbox-event-composer__btn-icon"
              >
                <path
                  fill-rule="evenodd"
                  d="M15.312 11.424a5.5 5.5 0 01-9.201 2.466l-.312-.311h2.433a.75.75 0 000-1.5H3.989a.75.75 0 00-.75.75v4.242a.75.75 0 001.5 0v-2.43l.31.31a7 7 0 0011.712-3.138.75.75 0 00-1.449-.39zm1.23-3.723a.75.75 0 00.219-.53V2.929a.75.75 0 00-1.5 0V5.36l-.31-.31A7 7 0 003.239 8.188a.75.75 0 101.448.389A5.5 5.5 0 0113.89 6.11l.311.31h-2.432a.75.75 0 000 1.5h4.243a.75.75 0 00.53-.219z"
                  clip-rule="evenodd"
                />
              </svg>
            </el-button>
          </template>
        </el-input>
      </el-form-item>

      <el-form-item
        label="Payload"
        prop="payload"
      >
        <el-input
          :model-value="payloadJson"
          type="textarea"
          :rows="5"
          placeholder="JSON payload"
          :class="{ 'is-error': payloadError }"
          @update:model-value="handlePayloadChange"
        />
        <div
          v-if="payloadError"
          class="sandbox-event-composer__payload-error"
        >
          {{ payloadError }}
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="disabled"
          class="sandbox-event-composer__submit-btn"
          @click="handleSubmit"
        >
          <svg
            v-if="!submitting"
            viewBox="0 0 20 20"
            fill="currentColor"
            class="sandbox-event-composer__btn-icon"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
              clip-rule="evenodd"
            />
          </svg>
          发送 Event
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { runtimeApiMethods } from '@/api/modules/runtime'
import type { SandboxEventTemplate } from '@/types/runtime'
import { RESERVED_SAFETY_EVENT_TYPES, SAFETY_LOCKED_REASON } from '@/constants/runtime-safety'
import { getErrorMessage } from '@/utils/string'

const props = defineProps<{
  worklineId: number
  deviceId?: number | null
  deviceName?: string
  deviceCode?: string
  deviceRole?: string
  deviceStatus?: string
  disabled?: boolean
  disabledReason?: string
}>()

const disabled = computed(() => props.disabled ?? false)
const disabledReasonResolved = computed(() => props.disabledReason || SAFETY_LOCKED_REASON)

// 设备信息
const deviceDisplay = computed(() => ({
  name: props.deviceName || (props.deviceId ? `设备 #${props.deviceId}` : '未选择'),
  code: props.deviceCode || '-',
  role: props.deviceRole || '-',
  status: props.deviceStatus || ''
}))

const deviceStatusType = computed(() => {
  const statusMap: Record<string, 'success' | 'warning' | 'danger' | 'info'> = {
    IDLE: 'success',
    RUNNING: 'warning',
    ERROR: 'danger',
    OFFLINE: 'info'
  }
  return statusMap[deviceDisplay.value.status] || 'info'
})

// 快捷Event（前4个）
const quickEvents = computed(() => eventTemplates.value.slice(0, 4))

function handleQuickEvent(eventType: string) {
  if (disabled.value) {
    ElMessage.warning(disabledReasonResolved.value)
    return
  }
  form.value.event_type = eventType
  handleEventTypeChange(eventType)
}

const emit = defineEmits<{
  submitted: []
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const eventTemplates = ref<SandboxEventTemplate[]>([])

const form = ref({
  device_id: props.deviceId ?? (null as number | null),
  event_type: '',
  trace_id: '',
  payload: {} as Record<string, unknown>
})

const payloadJson = ref('')
const payloadError = ref<string | null>(null)

function updatePayloadJson() {
  payloadJson.value = JSON.stringify(form.value.payload, null, 2)
  payloadError.value = null
}

function handlePayloadChange(val: string) {
  try {
    form.value.payload = JSON.parse(val) || {}
    payloadError.value = null
  } catch {
    payloadError.value = 'JSON 格式错误'
  }
  // 同步更新显示，避免光标跳动（仅在解析成功时）
  if (!payloadError.value) {
    payloadJson.value = val
  }
}

const rules: FormRules = {
  event_type: [{ required: true, message: '请选择事件类型', trigger: 'change' }]
}

async function loadTemplates() {
  try {
    const templates = await runtimeApiMethods
      .sandboxTemplates(props.worklineId, props.deviceId ?? undefined)
      .send()
    eventTemplates.value = (templates.event_templates ?? []).filter(
      tpl => !RESERVED_SAFETY_EVENT_TYPES.has(tpl.event_type)
    )
  } catch {
    eventTemplates.value = []
  }
}

function generateTraceId() {
  form.value.trace_id = `sandbox:${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`
}

function handleEventTypeChange(eventType: string) {
  const tpl = eventTemplates.value.find(t => t.event_type === eventType)
  if (tpl?.payload_template) {
    form.value.payload = { ...tpl.payload_template }
  } else {
    form.value.payload = {}
  }
  updatePayloadJson()
}

async function handleSubmit() {
  if (disabled.value) {
    ElMessage.warning(disabledReasonResolved.value)
    return
  }
  // 先检查设备是否已选择
  if (form.value.device_id === null) {
    ElMessage.warning('请先从上方拓扑选择设备')
    return
  }

  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return

  if (RESERVED_SAFETY_EVENT_TYPES.has(form.value.event_type)) {
    ElMessage.warning('该事件是平台保留事件，不能通过普通 sandbox Event 发送。')
    return
  }

  submitting.value = true
  try {
    await runtimeApiMethods
      .sandboxEvent({
        workline_id: props.worklineId,
        device_id: form.value.device_id,
        event_type: form.value.event_type,
        trace_id: form.value.trace_id || undefined,
        payload: form.value.payload
      })
      .send()
    ElMessage.success('Event 发送成功')
    emit('submitted')
    // 重置表单
    generateTraceId()
    form.value.payload = {}
    form.value.event_type = ''
    updatePayloadJson()
  } catch (e: unknown) {
    console.error('发送 Event 失败:', e)
    ElMessage.error(getErrorMessage(e, '发送失败，请检查控制台'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  updatePayloadJson()
  void loadTemplates()
  if (!form.value.trace_id) {
    generateTraceId()
  }
})

watch(
  () => props.worklineId,
  () => {
    void loadTemplates()
  }
)

watch(
  () => props.deviceId,
  newDeviceId => {
    form.value.device_id = newDeviceId ?? null
    form.value.event_type = '' // 切换设备后清除 Event 类型选择
    void loadTemplates()
  }
)
</script>

<style scoped>
.sandbox-event-composer {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.sandbox-event-composer__safety-lock {
  margin-bottom: 12px;
}

/* Device Card */
.sandbox-event-composer__device-card {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px;
  border-radius: 12px;
  background: rgb(245, 158, 11, 0.08);
  border: 1px solid rgb(245, 158, 11, 0.2);
}

.sandbox-event-composer__device-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: rgb(245, 158, 11, 0.15);
}

.sandbox-event-composer__device-icon svg {
  width: 22px;
  height: 22px;
  color: #f59e0b;
}

.sandbox-event-composer__device-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.sandbox-event-composer__device-name {
  color: var(--runtime-text-primary);
  font-size: 16px;
  font-weight: 600;
}

.sandbox-event-composer__device-meta {
  color: var(--runtime-text-muted);
  font-size: 12px;
  font-family: var(--font-mono);
}

/* Quick Actions */
.sandbox-event-composer__quick-actions {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 16px;
}

.sandbox-event-composer__section-label {
  color: var(--runtime-text-secondary);
  font-size: 12px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.sandbox-event-composer__quick-btns {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

/* Form - takes remaining space */
.sandbox-event-composer :deep(.el-form) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.sandbox-event-composer :deep(.el-form-item) {
  margin-bottom: 16px;
}

.sandbox-event-composer :deep(.el-form-item:last-of-type) {
  margin-top: auto;
  margin-bottom: 0;
}

/* Payload textarea - larger */
.sandbox-event-composer :deep(.el-textarea__inner) {
  min-height: 200px;
  font-family: var(--font-mono);
  font-size: 13px;
}

/* Submit Button - fixed at bottom */
.sandbox-event-composer__submit-btn {
  width: 100%;
  height: 48px;
  font-size: 15px;
  font-weight: 600;
}

.sandbox-event-composer__btn-icon {
  width: 16px;
  height: 16px;
  margin-right: 8px;
}

/* Payload Error */
.sandbox-event-composer__payload-error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

:deep(.el-textarea.is-error .el-textarea__inner) {
  border-color: #ef4444;
}

:deep(.el-divider) {
  margin: 12px 0;
}
</style>
