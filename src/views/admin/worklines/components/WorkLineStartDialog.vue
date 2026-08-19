<script setup lang="ts">
import { computed, watch } from 'vue'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import { useWorkLineStart } from '../composables/useWorkLineStart'
import type { WorkLineStartReason } from '../config/startRequest'

const START_REASON_MESSAGES = {
  WORKLINE_NOT_FOUND: '工作线不存在或已删除',
  INVALID_STATE: '当前工作线状态不允许创建新的运行代际',
  CONFIGURATION_INVALID: '工作线、设备 Endpoint 或粗分机配置不完整或不符合合同',
  IDEMPOTENCY_CONFLICT: '该 request_id 已属于另一条工作线',
  SERVICE_UNAVAILABLE: 'START 服务暂不可用，本次请求未被接纳'
} satisfies Record<WorkLineStartReason, string>

const props = defineProps<{ workline: Workline | null }>()
const modelValue = defineModel<boolean>({ default: false })
const start = useWorkLineStart()
const { state, result, rejectionReason, submitting } = start

const showActionFooter = computed(
  () => state.value === 'idle' || state.value === 'submitting' || state.value === 'delivery-unknown'
)
const dialogVisible = computed({
  get: () => modelValue.value,
  set: value => {
    if (!value && submitting.value) return
    modelValue.value = value
  }
})
const title = computed(() =>
  start.workline.value ? `启动 WorkLine：${start.workline.value.line_name}` : '启动 WorkLine'
)
const rejectionMessage = computed(() =>
  rejectionReason.value ? START_REASON_MESSAGES[rejectionReason.value] : ''
)

watch(
  dialogVisible,
  (isOpen, wasOpen) => {
    if (isOpen && !wasOpen && props.workline) start.open(props.workline)
  },
  { immediate: true }
)
</script>

<template>
  <StandardDialog
    v-model="dialogVisible"
    :title="title"
    title-icon="warning"
    size="lg"
    confirm-text="确认启动"
    confirm-icon="lucide:play"
    :closable="!submitting"
    :show-footer="showActionFooter"
    :hide-cancel="submitting"
    :confirm-loading="submitting"
    :confirm-disabled="submitting"
    @confirm="start.submit"
  >
    <div class="workline-start-dialog">
      <p
        v-if="state === 'idle' || state === 'submitting'"
        class="workline-start-dialog__prompt"
      >
        确认启动此 WorkLine 并创建新的运行代际？
      </p>

      <div
        v-else-if="state === 'delivery-unknown'"
        class="workline-start-dialog__notice workline-start-dialog__notice--warning"
      >
        上次 START 结果未知。重试将复用同一 request_id，不会创建第二个意图。
      </div>

      <div
        v-else-if="state === 'rejected'"
        class="workline-start-dialog__notice workline-start-dialog__notice--danger"
      >
        {{ rejectionMessage }}
      </div>

      <dl
        v-else-if="state === 'succeeded' && result"
        class="workline-start-dialog__facts"
      >
        <div>
          <dt>Epoch 编码</dt>
          <dd>{{ result.epoch_code }}</dd>
        </div>
        <div>
          <dt>运行代际 ID</dt>
          <dd>{{ result.line_run_epoch_id }}</dd>
        </div>
        <div>
          <dt>历史 Epoch 状态</dt>
          <dd>{{ result.epoch_status }}</dd>
        </div>
        <div>
          <dt>创建结果</dt>
          <dd>{{ result.created ? '新建成功' : '幂等重放' }}</dd>
        </div>
        <div>
          <dt>Epoch 开始时间</dt>
          <dd>{{ result.epoch_started_at }}</dd>
        </div>
        <div>
          <dt>Epoch 关闭时间</dt>
          <dd>{{ result.epoch_closed_at ?? '—' }}</dd>
        </div>
        <div>
          <dt>当前 WorkLine 投影</dt>
          <dd>{{ result.current_workline_runtime_status ?? '—' }}</dd>
        </div>
      </dl>
    </div>
  </StandardDialog>
</template>

<style scoped>
.workline-start-dialog {
  display: grid;
  gap: 16px;
}

.workline-start-dialog__prompt {
  margin: 0;
  color: var(--el-text-color-primary);
}

.workline-start-dialog__notice {
  padding: 12px 16px;
  border: 1px solid;
  border-radius: 6px;
}

.workline-start-dialog__notice--warning {
  color: var(--el-color-warning);
  background: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-5);
}

.workline-start-dialog__notice--danger {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-5);
}

.workline-start-dialog__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  margin: 0;
}

.workline-start-dialog__facts div {
  min-width: 0;
}

.workline-start-dialog__facts dt {
  margin-bottom: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.workline-start-dialog__facts dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--el-text-color-primary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

@media (width <= 640px) {
  .workline-start-dialog__facts {
    grid-template-columns: 1fr;
  }
}
</style>
