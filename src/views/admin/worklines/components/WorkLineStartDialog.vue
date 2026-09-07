<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { CRUD_PAGE_REFRESH_KEY } from '@/components/common/crud-page/types'
import type { WorkLinesItem as Workline } from '@/api/modules/workLines'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import { useWorkLineStart } from '../composables/useWorkLineStart'
import type { WorkLineStartReason } from '../config/startRequest'

const START_REASON_MESSAGES = {
  WORKLINE_NOT_FOUND: '工作线不存在或已删除',
  INVALID_STATE: '当前工作线状态不允许启动',
  CONFIGURATION_INVALID: '工作线、设备接入地址或所选插件配置不完整或不符合合同',
  VERSION_CONFLICT: '工作线状态已变化，请查看当前状态后重新操作',
  SERVICE_UNAVAILABLE: 'START 服务暂不可用，本次请求未被接纳'
} satisfies Record<WorkLineStartReason, string>

const props = defineProps<{ workline: Workline | null }>()
const modelValue = defineModel<boolean>({ default: false })
const start = useWorkLineStart()
const refreshList = inject(CRUD_PAGE_REFRESH_KEY, undefined)
const listRefreshFailed = ref(false)

async function submit(): Promise<void> {
  await start.submit()
  if (start.state.value !== 'succeeded' || !refreshList) return
  try {
    await refreshList()
  } catch {
    listRefreshFailed.value = true
  }
}
const { state, result, rejectionReason, submitting, refreshing, refreshFailed } = start

const showActionFooter = computed(() => state.value === 'idle' || state.value === 'submitting')
const dialogVisible = computed({
  get: () => modelValue.value,
  set: value => {
    if (!value && (submitting.value || refreshing.value)) return
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
    if (isOpen && !wasOpen && props.workline) {
      listRefreshFailed.value = false
      start.open(props.workline)
    }
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
    :closable="!submitting && !refreshing"
    :show-footer="showActionFooter"
    :hide-cancel="submitting"
    :confirm-loading="submitting"
    :confirm-disabled="submitting"
    @confirm="submit"
  >
    <div class="workline-start-dialog">
      <p v-if="listRefreshFailed">工作线已启动，列表刷新失败，请手动刷新。</p>
      <p
        v-if="state === 'idle' || state === 'submitting'"
        class="workline-start-dialog__prompt"
      >
        确认启动此 WorkLine？
      </p>

      <div
        v-else-if="state === 'delivery-unknown'"
        class="workline-start-dialog__notice workline-start-dialog__notice--warning"
      >
        启动结果未知，已尝试读取当前工作线状态。请确认状态后重新操作。
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
          <dt>工作线 ID</dt>
          <dd>{{ result.workline_id }}</dd>
        </div>
        <div>
          <dt>版本</dt>
          <dd>{{ result.version }}</dd>
        </div>
        <div>
          <dt>业务插件</dt>
          <dd>{{ result.plugin_key }} / {{ result.plugin_version }}</dd>
        </div>
        <div>
          <dt>流程模式</dt>
          <dd>{{ result.flow_mode }}</dd>
        </div>
        <div>
          <dt>当前状态</dt>
          <dd>{{ result.is_active ? '已启动' : '已停用' }}</dd>
        </div>
      </dl>
      <div v-if="state === 'delivery-unknown' || rejectionReason === 'VERSION_CONFLICT'">
        <p v-if="refreshing">正在读取当前工作线状态…</p>
        <p v-else-if="refreshFailed">读取失败，请再次读取当前状态。</p>
        <p v-else>
          当前工作线：{{ start.workline.value?.is_active ? '已启动' : '已停用' }}，版本
          {{ start.workline.value?.version }}
        </p>
        <el-button
          :loading="refreshing"
          @click="start.refresh"
        >
          刷新状态
        </el-button>
      </div>
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
