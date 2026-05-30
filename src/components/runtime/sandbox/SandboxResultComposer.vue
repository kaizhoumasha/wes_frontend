<template>
  <div class="sandbox-result-composer">
    <el-alert
      v-if="disabled"
      type="error"
      :closable="false"
      show-icon
    >
      <template #title>软件急停冻结</template>
      <template #default>{{ disabledReasonResolved }}</template>
    </el-alert>

    <!-- 状态提示 -->
    <div
      v-if="outbox?.status === 'SENT'"
      class="sandbox-result-composer__status-hint"
    >
      <el-alert
        type="warning"
        :closable="false"
        show-icon
      >
        <template #title>
          <span>此命令尚未 ACK</span>
        </template>
        <template #default>
          <span>
            请先在 Pending Outbox 列表中点击 "ACK" 按钮，确认设备已收到命令后再模拟 Result。
          </span>
        </template>
      </el-alert>
    </div>

    <!-- 指令明细 -->
    <el-card
      shadow="never"
      class="sandbox-result-composer__detail"
    >
      <template #header>
        <div class="sandbox-result-composer__detail-header">
          <span class="sandbox-result-composer__detail-title">指令明细</span>
        </div>
      </template>
      <div class="sandbox-result-composer__detail-content">
        <div class="sandbox-result-composer__detail-row">
          <span class="sandbox-result-composer__detail-label">命令类型:</span>
          <span class="sandbox-result-composer__detail-value">{{ commandType }}</span>
        </div>
        <div class="sandbox-result-composer__detail-row">
          <span class="sandbox-result-composer__detail-label">目标设备:</span>
          <span class="sandbox-result-composer__detail-value">{{ outbox?.target_code }}</span>
        </div>
        <div class="sandbox-result-composer__detail-row">
          <span class="sandbox-result-composer__detail-label">命令编码:</span>
          <span class="sandbox-result-composer__detail-value mono">{{ commandCode }}</span>
        </div>
        <div class="sandbox-result-composer__detail-row">
          <span class="sandbox-result-composer__detail-label">下发参数:</span>
          <pre class="sandbox-result-composer__detail-payload">{{ commandPayloadPreview }}</pre>
        </div>
      </div>
    </el-card>

    <!-- Result 模拟表单 -->
    <el-form
      ref="formRef"
      :model="form"
      :rules="rules"
      label-position="top"
      @submit.prevent="handleSubmit"
    >
      <el-form-item
        label="结果状态"
        prop="result"
      >
        <el-select
          v-model="form.result"
          placeholder="选择结果状态"
          :disabled="disabled"
          style="width: 100%"
          @change="handleResultChange"
        >
          <el-option
            label="SUCCESS - 成功"
            value="SUCCESS"
          />
          <el-option
            label="FAILED - 失败"
            value="FAILED"
          />
        </el-select>
      </el-form-item>

      <el-form-item
        v-if="form.result === 'FAILED'"
        label="错误码"
        prop="error_code"
      >
        <el-input
          v-model="form.error_code"
          placeholder="如: DEVICE_FAULT, PICK_FAILED"
          :disabled="disabled"
        />
      </el-form-item>

      <el-form-item
        v-if="form.result === 'FAILED'"
        label="错误信息"
        prop="error_detail"
      >
        <el-input
          v-model="form.error_detail"
          placeholder="错误描述"
          :disabled="disabled"
        />
      </el-form-item>

      <el-form-item
        label="返回数据 (data)"
        prop="payload"
      >
        <el-input
          v-model="payloadJson"
          type="textarea"
          :rows="6"
          placeholder="JSON 格式的返回数据"
          :class="{ 'is-error': payloadError }"
          :disabled="disabled"
        />
        <div
          v-if="payloadError"
          class="sandbox-result-composer__payload-error"
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
          模拟设备返回 Result
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

// 从 outbox 中提取指令信息
const commandCode = computed(() => {
  // dispatch_key 格式: "device-command:CMD-xxx"
  const key = props.outbox?.dispatch_key || ''
  return key.split(':')[1] || key || ''
})

type PayloadRecord = Record<string, unknown>

function asPayloadRecord(value: unknown): PayloadRecord {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as PayloadRecord) : {}
}

function resolveCommandType(payload: unknown): string {
  const payloadRecord = asPayloadRecord(payload)
  const taskType = payloadRecord.task_type
  if (typeof taskType === 'string' && taskType) return taskType

  const commandTypeValue = payloadRecord.command_type
  if (typeof commandTypeValue === 'string' && commandTypeValue) return commandTypeValue

  return 'UNKNOWN'
}

const commandType = computed(() => resolveCommandType(props.outbox?.payload_json))

const commandPayloadPreview = computed(() => {
  const payload = props.outbox?.payload_json || {}
  return JSON.stringify(payload, null, 2)
})

const form = ref({
  result: '' as 'SUCCESS' | 'FAILED' | '',
  payload: {} as Record<string, unknown>,
  error_code: '',
  error_detail: ''
})

const payloadJson = ref('')

function updatePayloadJson() {
  payloadJson.value = JSON.stringify(form.value.payload, null, 2)
  payloadError.value = null
}

const rules: FormRules = {
  result: [{ required: true, message: '请选择结果状态', trigger: 'change' }]
}

function handleResultChange(result: 'SUCCESS' | 'FAILED') {
  const cmdType = commandType.value
  if (result === 'SUCCESS') {
    // 根据命令类型生成合理的成功返回数据
    form.value.payload = generateSuccessPayload(cmdType)
    form.value.error_code = ''
    form.value.error_detail = ''
  } else {
    form.value.payload = {}
    form.value.error_code = 'DEVICE_FAULT'
    form.value.error_detail = '模拟设备故障'
  }
  updatePayloadJson()
}

function generateSuccessPayload(cmdType: string): Record<string, unknown> {
  const basePayload = props.outbox?.payload_json || {}
  // 从 params 或直接 payload 中获取 pkg_id / PkgID
  const params = asPayloadRecord(basePayload.params)
  const sixInOne = asPayloadRecord(params.six_in_one)
  const pkgId =
    params.pkg_id || params.PkgID || sixInOne.PkgID || basePayload.PkgID || basePayload.pkg_id

  switch (cmdType) {
    case 'PICK_AND_PUT':
      return {
        // 必须包含 PkgID 用于业务路由
        PkgID: pkgId,
        from_location:
          params.from_location ||
          params.source_location ||
          basePayload.from_location ||
          basePayload.source_location ||
          'INPUT',
        to_location:
          params.to_location ||
          params.target_location ||
          basePayload.to_location ||
          basePayload.target_location ||
          'PIPELINE-IN-01',
        // PICK_AND_PUT 成功回调承载粗分机测量值，WES 校验后再决定前进或 NG。
        reel_diameter: basePayload.reel_diameter ?? '7.0',
        reel_thickness: basePayload.reel_thickness ?? '2.5',
        measurement_result: 'OK'
      }

    case 'MOVE_FORWARD':
      return {}

    default:
      // 通用成功返回：复制指令参数并添加结果状态
      return {
        ...basePayload,
        ...params,
        PkgID: pkgId,
        result: 'SUCCESS',
        completed_at: new Date().toISOString()
      }
  }
}

async function handleSubmit() {
  if (submitting.value) return
  if (disabled.value) {
    ElMessage.warning(disabledReasonResolved.value)
    return
  }
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid || !props.outbox || !form.value.result) return

  submitting.value = true
  try {
    await runtimeApiMethods
      .sandboxResult({
        command_code: commandCode.value,
        device_code: props.outbox.target_code || '',
        result: form.value.result,
        payload: form.value.payload,
        error_detail: form.value.result === 'FAILED' ? form.value.error_detail : undefined
      })
      .send()
    ElMessage.success('Result 已发送，正在等待编排处理...')
    emit('submitted', props.outbox)
  } catch (e: unknown) {
    console.error('发送 Result 失败:', e)
    ElMessage.error(getErrorMessage(e, '发送失败'))
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  updatePayloadJson()
})

watch(
  () => props.outbox,
  () => {
    form.value.result = ''
    form.value.payload = {}
    form.value.error_code = ''
    form.value.error_detail = ''
    updatePayloadJson()
  },
  { immediate: true }
)
</script>

<style scoped>
.sandbox-result-composer {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.sandbox-result-composer__status-hint {
  margin-bottom: 8px;
}

.sandbox-result-composer__detail {
  background: var(--runtime-surface-subtle);
}

.sandbox-result-composer__detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sandbox-result-composer__detail-title {
  color: var(--runtime-text-primary);
  font-size: 14px;
  font-weight: 600;
}

.sandbox-result-composer__detail-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sandbox-result-composer__detail-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.sandbox-result-composer__detail-label {
  color: var(--runtime-text-secondary);
  font-size: 12px;
  min-width: 80px;
}

.sandbox-result-composer__detail-value {
  color: var(--runtime-text-primary);
  font-size: 13px;
}

.sandbox-result-composer__detail-value.mono {
  font-family: var(--font-mono);
  font-size: 11px;
}

.sandbox-result-composer__detail-payload {
  margin: 0;
  padding: 8px;
  border-radius: 6px;
  background: var(--runtime-code-bg);
  color: var(--runtime-text-emphasis);
  font-size: 11px;
  font-family: var(--font-mono);
  overflow-x: auto;
  max-height: 150px;
}

.sandbox-result-composer__payload-error {
  color: #ef4444;
  font-size: 12px;
  margin-top: 4px;
}

:deep(.el-textarea.is-error .el-textarea__inner) {
  border-color: #ef4444;
}
</style>
