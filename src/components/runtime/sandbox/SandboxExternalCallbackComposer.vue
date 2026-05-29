<template>
  <div class="sandbox-external-callback-composer">
    <el-alert
      v-if="disabled"
      type="error"
      :closable="false"
      show-icon
    >
      <template #title>软件急停冻结</template>
      <template #default>{{ disabledReasonResolved }}</template>
    </el-alert>

    <el-card
      shadow="never"
      class="sandbox-external-callback-composer__detail"
    >
      <template #header>
        <div class="sandbox-external-callback-composer__detail-header">
          <span class="sandbox-external-callback-composer__detail-title">外部回调明细</span>
        </div>
      </template>
      <div class="sandbox-external-callback-composer__detail-content">
        <div class="sandbox-external-callback-composer__detail-row">
          <span class="sandbox-external-callback-composer__detail-label">目标系统:</span>
          <span class="sandbox-external-callback-composer__detail-value">
            {{ outbox?.target_code }}
          </span>
        </div>
        <div class="sandbox-external-callback-composer__detail-row">
          <span class="sandbox-external-callback-composer__detail-label">回调类型:</span>
          <span class="sandbox-external-callback-composer__detail-value">
            {{ resolvedCallbackType || '-' }}
          </span>
        </div>
        <div class="sandbox-external-callback-composer__detail-row">
          <span class="sandbox-external-callback-composer__detail-label">Dispatch Key:</span>
          <span class="sandbox-external-callback-composer__detail-value mono">
            {{ outbox?.dispatch_key }}
          </span>
        </div>
        <div class="sandbox-external-callback-composer__detail-row">
          <span class="sandbox-external-callback-composer__detail-label">Outbox Payload:</span>
          <pre class="sandbox-external-callback-composer__detail-payload">{{
            outboxPayloadPreview
          }}</pre>
        </div>
      </div>
    </el-card>

    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <el-form-item
        label="回调类型"
        prop="callback_type"
      >
        <el-input
          v-model="form.callback_type"
          placeholder="如 WMS_RACK_ARRIVED"
          :disabled="disabled"
        />
      </el-form-item>

      <el-form-item
        label="回调数据 (payload)"
        prop="payload"
      >
        <el-input
          :model-value="payloadJson"
          type="textarea"
          :rows="8"
          placeholder="JSON 格式的回调数据"
          :class="{ 'is-error': payloadError }"
          :disabled="disabled"
          @update:model-value="handlePayloadChange"
        />
        <div
          v-if="payloadError"
          class="sandbox-external-callback-composer__payload-error"
        >
          {{ payloadError }}
        </div>
      </el-form-item>

      <el-form-item>
        <el-button
          type="primary"
          :loading="submitting"
          :disabled="disabled || submitting"
          @click="handleSubmit"
        >
          模拟外部回调
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
import type { SandboxPendingOutbox } from '@/types/runtime'
import { SAFETY_LOCKED_REASON } from '@/constants/runtime-safety'
import { getErrorMessage } from '@/utils/string'
import {
  buildSandboxExternalCallbackPayload,
  resolveSandboxExternalCallbackType
} from '@/utils/sandbox-outbox'

const props = defineProps<{
  outbox: SandboxPendingOutbox | null
  disabled?: boolean
  disabledReason?: string
}>()

const disabled = computed(() => props.disabled ?? false)
const disabledReasonResolved = computed(() => props.disabledReason || SAFETY_LOCKED_REASON)

const emit = defineEmits<{
  submitted: [outbox: SandboxPendingOutbox]
}>()

const formRef = ref<FormInstance>()
const submitting = ref(false)
const payloadError = ref<string | null>(null)

const form = ref({
  callback_type: '',
  payload: {} as Record<string, unknown>
})

const payloadJson = ref('')
const resolvedCallbackType = computed(() => resolveSandboxExternalCallbackType(props.outbox))
const outboxPayloadPreview = computed(() =>
  JSON.stringify(props.outbox?.payload_json || {}, null, 2)
)

const rules: FormRules = {
  callback_type: [{ required: true, message: '请输入回调类型', trigger: 'blur' }]
}

function resetForm() {
  form.value.callback_type = resolvedCallbackType.value || ''
  form.value.payload = buildSandboxExternalCallbackPayload(props.outbox)
  payloadJson.value = JSON.stringify(form.value.payload, null, 2)
  payloadError.value = null
}

function handlePayloadChange(value: string) {
  payloadJson.value = value
  try {
    const parsed = JSON.parse(value || '{}')
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      payloadError.value = '回调数据必须是 JSON Object'
      return
    }
    form.value.payload = parsed as Record<string, unknown>
    payloadError.value = null
  } catch {
    payloadError.value = 'JSON 格式不正确'
  }
}

async function handleSubmit() {
  if (submitting.value) return
  if (disabled.value) {
    ElMessage.warning(disabledReasonResolved.value)
    return
  }
  if (payloadError.value) {
    ElMessage.error(payloadError.value)
    return
  }
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !props.outbox) return
  if (!props.outbox.dispatch_key) {
    ElMessage.error('缺少 dispatch_key')
    return
  }

  submitting.value = true
  try {
    const eventSuffix = `${Date.now()}-${props.outbox.id}`
    await runtimeApiMethods
      .sandboxExternalCallback({
        dispatch_key: props.outbox.dispatch_key,
        callback_type: form.value.callback_type,
        payload: form.value.payload,
        source_system: 'WMS',
        source_event_id: `sandbox:${form.value.callback_type}:${eventSuffix}`,
        request_id: `sandbox:external:${eventSuffix}`
      })
      .send()
    ElMessage.success('外部回调已发送，正在等待编排处理...')
    emit('submitted', props.outbox)
  } catch (e: unknown) {
    ElMessage.error(getErrorMessage(e, '外部回调失败'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  resetForm()
})

watch(
  () => props.outbox,
  () => {
    resetForm()
  },
  { immediate: true }
)
</script>

<style scoped>
.sandbox-external-callback-composer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sandbox-external-callback-composer__detail {
  background: var(--runtime-surface-subtle);
}

.sandbox-external-callback-composer__detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sandbox-external-callback-composer__detail-title {
  color: var(--runtime-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.sandbox-external-callback-composer__detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sandbox-external-callback-composer__detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.sandbox-external-callback-composer__detail-label {
  flex-shrink: 0;
  width: 100px;
  color: var(--runtime-text-secondary);
  font-size: 13px;
}

.sandbox-external-callback-composer__detail-value {
  flex: 1;
  color: var(--runtime-text-primary);
  font-size: 13px;
  word-break: break-all;
}

.sandbox-external-callback-composer__detail-value.mono {
  font-family: var(--runtime-font-mono);
}

.sandbox-external-callback-composer__detail-payload {
  flex: 1;
  max-height: 200px;
  padding: 12px;
  overflow: auto;
  color: var(--runtime-text-secondary);
  font-family: var(--runtime-font-mono);
  font-size: 12px;
  background: var(--runtime-surface);
  border-radius: 6px;
}

.sandbox-external-callback-composer__payload-error {
  margin-top: 4px;
  color: var(--el-color-danger);
  font-size: 12px;
}
</style>
