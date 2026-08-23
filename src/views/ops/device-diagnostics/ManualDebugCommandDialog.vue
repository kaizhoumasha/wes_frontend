<script setup lang="ts">
import { nextTick, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import type { DebugPreflightResult } from '@/api/modules/device'
import { useManualDebugCommand } from './useManualDebugCommand'

const command = useManualDebugCommand()
const {
  isOpen,
  state,
  form,
  isPreflighting,
  preflightDevices,
  selectedPreflightDevice,
  availableTaskTypes,
  previewSnapshot,
  confirmRealAction,
  createdCommand,
  commandDetail
} = command
const uiError = ref('')
let launcher: HTMLElement | null = null

function open(candidateDeviceCode?: string, launcherElement?: HTMLElement): void {
  launcher = launcherElement ?? null
  uiError.value = ''
  command.open(candidateDeviceCode)
}

function close(): void {
  if (state.value === 'SUBMITTING') return
  command.close()
  const focusTarget = launcher
  launcher = null
  void nextTick(() => focusTarget?.focus())
}

async function handlePreflight(): Promise<void> {
  uiError.value = ''
  try {
    await command.preflight()
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

function handlePreview(): void {
  uiError.value = ''
  try {
    command.preview()
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

async function handleSubmit(): Promise<void> {
  uiError.value = ''
  try {
    await command.submit()
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

function formatDeviceOption(item: DebugPreflightResult['devices'][number]): string {
  const name = item.device.device_name ? ` · ${item.device.device_name}` : ''
  const runtimeState = `${item.state.mode} / ${item.state.status}`
  const rejection = item.rejection_code ? ` · ${item.rejection_code}` : ''
  return `${item.device.device_code}${name} · ${runtimeState}${rejection}`
}

defineExpose({ open, close, command })
</script>

<template>
  <StandardDialog
    :model-value="isOpen"
    title="现场联调下发"
    title-icon="warning"
    size="xl"
    :closable="state !== 'SUBMITTING'"
    :close-on-click-modal="false"
    :show-footer="true"
    @update:model-value="value => !value && close()"
  >
    <el-alert
      title="这会创建真实设备命令。WES 创建命令不代表 ECS 已接纳，也不代表设备已完成。"
      type="warning"
      :closable="false"
      show-icon
    />

    <el-alert
      v-if="uiError"
      class="dialog-error"
      :title="uiError"
      type="error"
      :closable="false"
      show-icon
    />

    <el-form
      label-position="top"
      class="debug-form"
    >
      <el-form-item label="ECS SERVER URL">
        <div class="endpoint-row">
          <el-input
            v-model="form.endpointBaseUrl"
            placeholder="http://10.24.209.26:8080"
            :disabled="state === 'SUBMITTING' || state === 'TRACKING'"
          />
          <AppButton
            :loading="isPreflighting"
            :disabled="
              !form.endpointBaseUrl.trim() || state === 'SUBMITTING' || state === 'TRACKING'
            "
            @click="handlePreflight"
          >
            枚举设备
          </AppButton>
        </div>
      </el-form-item>

      <div class="form-grid">
        <el-form-item label="设备">
          <el-select
            v-model="form.deviceCode"
            placeholder="先枚举 ECS 设备"
            :disabled="state === 'SUBMITTING' || state === 'TRACKING'"
          >
            <el-option
              v-for="item in preflightDevices"
              :key="item.device.device_code"
              :label="formatDeviceOption(item)"
              :value="item.device.device_code"
              :disabled="!item.admissible"
            />
          </el-select>
          <span
            v-if="selectedPreflightDevice?.rejection_code"
            class="field-hint is-error"
          >
            {{ selectedPreflightDevice.rejection_code }}
          </span>
        </el-form-item>

        <el-form-item label="TASK TYPE">
          <el-select
            v-model="form.taskType"
            placeholder="选择设备支持的 task_type"
            :disabled="state === 'SUBMITTING' || state === 'TRACKING'"
          >
            <el-option
              v-for="taskType in availableTaskTypes"
              :key="taskType"
              :label="taskType"
              :value="taskType"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="TIMEOUT (MS)">
          <el-input-number
            v-model="form.timeout"
            :min="1"
            :max="2147483647"
            :disabled="state === 'SUBMITTING' || state === 'TRACKING'"
            controls-position="right"
          />
        </el-form-item>
      </div>

      <el-form-item label="PARAMS（JSON OBJECT）">
        <el-input
          v-model="form.paramsText"
          type="textarea"
          :rows="6"
          :disabled="state === 'SUBMITTING' || state === 'TRACKING'"
        />
      </el-form-item>

      <el-form-item label="执行原因（1–500 字符）">
        <el-input
          v-model="form.reason"
          type="textarea"
          :rows="2"
          maxlength="500"
          show-word-limit
          :disabled="state === 'SUBMITTING' || state === 'TRACKING'"
        />
      </el-form-item>
    </el-form>

    <section
      v-if="previewSnapshot"
      class="preview-panel"
    >
      <h3>不可变请求预览</h3>
      <pre>{{ JSON.stringify(previewSnapshot, null, 2) }}</pre>
      <el-checkbox v-model="confirmRealAction">我确认将按以上内容创建真实设备命令</el-checkbox>
    </section>

    <section
      v-if="createdCommand"
      class="lifecycle-panel"
    >
      <h3>持久化命令生命周期</h3>
      <p>WES 已创建命令，当前状态 {{ createdCommand.status }}；不代表 ECS 已接纳或设备已完成。</p>
      <dl v-if="commandDetail">
        <dt>command_code</dt>
        <dd>{{ commandDetail.command_code }}</dd>
        <dt>status</dt>
        <dd>{{ commandDetail.status }}</dd>
        <dt>attempt</dt>
        <dd>{{ commandDetail.attempt_count }}</dd>
        <dt>ACK</dt>
        <dd>{{ commandDetail.ack_received_at ?? '未收到' }}</dd>
        <dt>callback</dt>
        <dd>{{ commandDetail.callback?.result ?? '未收到' }}</dd>
        <dt>failure</dt>
        <dd>{{ commandDetail.failure_code ?? '—' }}</dd>
        <dt>reconciliation</dt>
        <dd>{{ commandDetail.reconciliation_reason ?? '—' }}</dd>
        <dt>completed_at</dt>
        <dd>{{ commandDetail.completed_at ?? '—' }}</dd>
      </dl>
      <el-alert
        v-if="commandDetail?.status === 'RECONCILING'"
        title="交付结果不确定，正在对账；禁止盲目重发。"
        type="warning"
        :closable="false"
      />
    </section>

    <template #footer>
      <div class="dialog-actions">
        <AppButton
          :disabled="state === 'SUBMITTING'"
          @click="close"
        >
          关闭
        </AppButton>
        <AppButton
          v-if="state === 'EDITING'"
          type="primary"
          @click="handlePreview"
        >
          生成不可变预览
        </AppButton>
        <AppButton
          v-else-if="state === 'PREVIEW' || state === 'SUBMITTING'"
          type="danger"
          :loading="state === 'SUBMITTING'"
          :disabled="!confirmRealAction"
          @click="handleSubmit"
        >
          确认创建真实设备命令
        </AppButton>
      </div>
    </template>
  </StandardDialog>
</template>

<style scoped>
.dialog-error,
.debug-form,
.preview-panel,
.lifecycle-panel {
  margin-top: 16px;
}

.endpoint-row,
.dialog-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.endpoint-row :deep(.el-input) {
  flex: 1;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.field-hint {
  display: block;
  margin-top: 4px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

.field-hint.is-error {
  color: var(--el-color-danger);
}

.preview-panel,
.lifecycle-panel {
  padding: 16px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.preview-panel h3,
.lifecycle-panel h3 {
  margin: 0 0 12px;
  font-size: 16px;
}

.preview-panel pre {
  overflow: auto;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.lifecycle-panel dl {
  display: grid;
  grid-template-columns: minmax(120px, auto) 1fr;
  gap: 8px 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
}

.lifecycle-panel dt,
.lifecycle-panel dd {
  margin: 0;
}

.dialog-actions {
  justify-content: flex-end;
  width: 100%;
}

@media (width < 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }

  .endpoint-row {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
