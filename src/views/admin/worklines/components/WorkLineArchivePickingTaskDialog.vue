<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { workLinesApiMethods, type WorkLinesItem as Workline } from '@/api/modules/workLines'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'

const props = defineProps<{ workline: Workline | null }>()
const modelValue = defineModel<boolean>({ default: false })
const emit = defineEmits<{
  (event: 'archived', payload: { worklineId: number; version: number }): void
}>()

type IdentifierKind = 'picking_task_id' | 'task_id'

const identifierKind = ref<IdentifierKind>('picking_task_id')
const identifierValue = ref('')
const submitting = ref(false)
const result = ref<Awaited<ReturnType<typeof workLinesApiMethods.archivePickingTask>> | null>(null)
const errorMessage = ref('')

const identifierLabel = computed(() =>
  identifierKind.value === 'picking_task_id' ? 'PickingTask ID' : 'WMS 业务 task_id'
)

const canSubmit = computed(
  () =>
    !submitting.value &&
    props.workline !== null &&
    identifierValue.value.trim().length > 0 &&
    (identifierKind.value !== 'picking_task_id' || /^\d+$/.test(identifierValue.value.trim()))
)

const dialogVisible = computed({
  get: () => modelValue.value,
  set: value => {
    if (!value && submitting.value) return
    modelValue.value = value
  }
})

const title = computed(() =>
  props.workline ? `归档单任务：${props.workline.line_name}` : '归档单任务'
)

watch(
  () => modelValue.value,
  isOpen => {
    if (isOpen) {
      identifierKind.value = 'picking_task_id'
      identifierValue.value = ''
      result.value = null
      errorMessage.value = ''
    }
  }
)

async function submit(): Promise<void> {
  if (!props.workline || !canSubmit.value) return
  submitting.value = true
  errorMessage.value = ''
  result.value = null
  try {
    const body: { version: number; picking_task_id?: number; task_id?: string } = {
      version: props.workline.version
    }
    if (identifierKind.value === 'picking_task_id') {
      body.picking_task_id = Number.parseInt(identifierValue.value.trim(), 10)
    } else {
      body.task_id = identifierValue.value.trim()
    }
    const response = await workLinesApiMethods
      .archivePickingTask({ id: props.workline.id }, body)
      .send()
    result.value = response
    emit('archived', { worklineId: props.workline.id, version: response.version })
    ElMessage.success(
      response.archived_single_picking_task
        ? `已归档 PickingTask ${response.archived_single_picking_task_id ?? ''}（原状态 ${response.picking_task_status_before ?? ''}）`
        : '未命中需要归档的 PickingTask'
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : '归档请求失败'
    errorMessage.value = message
    ElMessage.error(message)
  } finally {
    submitting.value = false
  }
}

function close(): void {
  if (!submitting.value) modelValue.value = false
}
</script>

<template>
  <StandardDialog
    v-model="dialogVisible"
    :title="title"
    title-icon="warning"
    size="md"
    confirm-text="确认归档"
    confirm-icon="lucide:archive"
    :closable="!submitting"
    :show-footer="!result"
    :hide-cancel="submitting"
    :confirm-loading="submitting"
    :confirm-disabled="!canSubmit"
    @confirm="submit"
    @cancel="close"
  >
    <div class="archive-picking-task-dialog">
      <p class="archive-picking-task-dialog__prompt">
        选择识别方式并输入目标任务。归档后不会再为该任务发起新动作；已发出的请求仍会继续对账。
      </p>

      <el-radio-group
        v-model="identifierKind"
        :disabled="submitting"
      >
        <el-radio-button value="picking_task_id">本地 ID</el-radio-button>
        <el-radio-button value="task_id">WMS task_id</el-radio-button>
      </el-radio-group>

      <el-input
        v-model="identifierValue"
        :disabled="submitting"
        :placeholder="identifierKind === 'picking_task_id' ? '例如 99' : '例如 BUSINESS-123'"
        :maxlength="identifierKind === 'picking_task_id' ? 20 : 100"
        clearable
      >
        <template #prefix>
          <span class="archive-picking-task-dialog__field-label">{{ identifierLabel }}</span>
        </template>
      </el-input>

      <div
        v-if="errorMessage"
        class="archive-picking-task-dialog__notice archive-picking-task-dialog__notice--danger"
      >
        {{ errorMessage }}
      </div>

      <dl
        v-if="result"
        class="archive-picking-task-dialog__facts"
      >
        <div>
          <dt>归档命中</dt>
          <dd>{{ result.archived_single_picking_task ? '是' : '否' }}</dd>
        </div>
        <div>
          <dt>任务 ID</dt>
          <dd>{{ result.archived_single_picking_task_id ?? '—' }}</dd>
        </div>
        <div>
          <dt>归档前状态</dt>
          <dd>{{ result.picking_task_status_before ?? '—' }}</dd>
        </div>
        <div>
          <dt>WorkLine 版本</dt>
          <dd>{{ result.version }}</dd>
        </div>
      </dl>

      <div
        v-if="result"
        class="archive-picking-task-dialog__footer"
      >
        <el-button
          :disabled="submitting"
          @click="close"
        >
          关闭
        </el-button>
      </div>
    </div>
  </StandardDialog>
</template>

<style scoped>
.archive-picking-task-dialog {
  display: grid;
  gap: 16px;
}

.archive-picking-task-dialog__prompt {
  margin: 0;
  color: var(--el-text-color-regular);
  line-height: 1.5;
}

.archive-picking-task-dialog__field-label {
  color: var(--el-text-color-secondary);
  font-size: 12px;
  white-space: nowrap;
}

.archive-picking-task-dialog__notice {
  padding: 12px 16px;
  border: 1px solid;
  border-radius: 6px;
}

.archive-picking-task-dialog__notice--danger {
  color: var(--el-color-danger);
  background: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-5);
}

.archive-picking-task-dialog__facts {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px 20px;
  margin: 0;
}

.archive-picking-task-dialog__facts div {
  min-width: 0;
}

.archive-picking-task-dialog__facts dt {
  margin-bottom: 4px;
  color: var(--el-text-color-secondary);
  font-size: 12px;
}

.archive-picking-task-dialog__facts dd {
  margin: 0;
  overflow-wrap: anywhere;
  color: var(--el-text-color-primary);
  font-family: var(--font-mono);
  font-variant-numeric: tabular-nums;
}

.archive-picking-task-dialog__footer {
  display: flex;
  justify-content: flex-end;
}

@media (width <= 640px) {
  .archive-picking-task-dialog__facts {
    grid-template-columns: 1fr;
  }
}
</style>
