<script setup lang="ts">
import { nextTick, reactive, ref, watch } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import type { DebugTasksInput } from '@/api/modules/transport'
import { createUuid7 } from '@/utils/uuid7'
import { buildTransportDebugTask, type TransportDebugTaskKind } from './useTransportDebugTask'

const props = defineProps<{ submitting: boolean }>()
const emit = defineEmits<{ submit: [input: DebugTasksInput] }>()
const isOpen = ref(false)
const uiError = ref('')
const preview = ref<DebugTasksInput | null>(null)
const confirmed = ref(false)
const form = reactive({
  kind: 'RACK_MOVE' as TransportDebugTaskKind,
  stationId: 'STATION-DEBUG',
  dataText: defaultData('RACK_MOVE')
})
let launcher: HTMLElement | null = null

watch(
  () => [form.kind, form.stationId, form.dataText],
  () => {
    preview.value = null
    confirmed.value = false
  },
  { flush: 'sync' }
)

watch(
  () => form.kind,
  kind => {
    form.dataText = defaultData(kind)
  },
  { flush: 'sync' }
)

function open(launcherElement?: HTMLElement): void {
  launcher = launcherElement ?? null
  uiError.value = ''
  preview.value = null
  confirmed.value = false
  isOpen.value = true
}

function close(): void {
  if (props.submitting) return
  isOpen.value = false
  const focusTarget = launcher
  launcher = null
  void nextTick(() => focusTarget?.focus())
}

function buildPreview(): void {
  uiError.value = ''
  try {
    preview.value = buildTransportDebugTask(form.kind, form.dataText, createUuid7(), form.stationId)
  } catch (error) {
    uiError.value = errorMessage(error)
  }
}

function submit(): void {
  if (!preview.value || !confirmed.value || props.submitting) return
  emit('submit', preview.value)
}

function defaultData(kind: TransportDebugTaskKind): string {
  const samples: Record<TransportDebugTaskKind, Record<string, unknown>> = {
    RACK_MOVE: {
      rack_id: 'RACK-01',
      source: { kind: 'RACK_POSITION', location_code: 'SOURCE-01' },
      target: { kind: 'RACK_POSITION', location_code: 'TARGET-01' },
      target_face: '90',
      rcs_template_id: 'F01'
    },
    RACK_ROTATE: {
      rack_id: 'RACK-01',
      position: { kind: 'RACK_POSITION', location_code: 'POSITION-01' },
      target_face: '270',
      rcs_template_id: 'CTU02'
    },
    BIN_MOVE: {
      moves: [
        {
          bin_id: 'BIN-01',
          source: { kind: 'HANDOFF_POSITION', location_code: 'SOURCE-01' },
          target: { kind: 'HANDOFF_POSITION', location_code: 'TARGET-01' }
        }
      ]
    },
    BIN_EXCHANGE: {
      exchange_pairs: [
        {
          left_bin_id: 'BIN-01',
          left_location: {
            kind: 'RACK_BIN_SLOT',
            rack_id: 'RACK-01',
            rack_face: '90',
            slot_id: 'SLOT-01'
          },
          right_bin_id: 'BIN-02',
          right_location: {
            kind: 'RACK_BIN_SLOT',
            rack_id: 'RACK-02',
            rack_face: '270',
            slot_id: 'SLOT-02'
          }
        }
      ]
    }
  }
  return JSON.stringify(samples[kind], null, 2)
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error)
}

defineExpose({ open, close, form, buildPreview })
</script>

<template>
  <StandardDialog
    :model-value="isOpen"
    title="创建真实 Transport 调试任务"
    title-icon="warning"
    size="xl"
    :closable="!submitting"
    :close-on-click-modal="false"
    @update:model-value="value => !value && close()"
  >
    <el-alert
      title="此操作会进入真实 WMS/RCS 链路；提交 ACK、SSE 通知和 Transport 终态均不等于物理完成。"
      type="warning"
      :closable="false"
      show-icon
    />
    <el-alert
      v-if="uiError"
      :title="uiError"
      type="error"
      :closable="false"
      show-icon
    />
    <el-form
      class="debug-form"
      label-position="top"
    >
      <div class="form-grid">
        <el-form-item label="TRANSPORT KIND">
          <el-select
            v-model="form.kind"
            :disabled="submitting"
          >
            <el-option
              v-for="kind in ['RACK_MOVE', 'RACK_ROTATE', 'BIN_MOVE', 'BIN_EXCHANGE']"
              :key="kind"
              :label="kind"
              :value="kind"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="STATION ID">
          <el-input
            v-model="form.stationId"
            :disabled="submitting"
          />
        </el-form-item>
      </div>
      <el-form-item label="DATA（生成合同 JSON）">
        <el-input
          v-model="form.dataText"
          type="textarea"
          :rows="14"
          :disabled="submitting"
        />
      </el-form-item>
    </el-form>
    <section
      v-if="preview"
      class="preview-panel"
    >
      <h3>不可变请求预览</h3>
      <pre>{{ JSON.stringify(preview, null, 2) }}</pre>
      <el-checkbox v-model="confirmed">我确认创建真实 Transport 调试任务</el-checkbox>
    </section>
    <template #footer>
      <div class="dialog-actions">
        <AppButton
          :disabled="submitting"
          @click="close"
        >
          关闭
        </AppButton>
        <AppButton
          v-if="!preview"
          type="primary"
          @click="buildPreview"
        >
          生成不可变预览
        </AppButton>
        <AppButton
          v-else
          type="danger"
          :loading="submitting"
          :disabled="!confirmed"
          @click="submit"
        >
          确认创建真实任务
        </AppButton>
      </div>
    </template>
  </StandardDialog>
</template>

<style scoped>
.debug-form,
.preview-panel {
  margin-top: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.preview-panel {
  padding: 16px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.preview-panel h3 {
  margin: 0 0 12px;
}

.preview-panel pre {
  overflow: auto;
  max-height: 320px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  white-space: pre-wrap;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (width < 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
}
</style>
