<script setup lang="ts">
import { computed } from 'vue'
import StandardDialog from '@/components/ui/StandardDialog/StandardDialog.vue'
import type { ResetPreviewResult } from '@/api/modules/transport'

const props = defineProps<{
  modelValue: boolean
  preview: ResetPreviewResult | null
  submitting: boolean
  canReset: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: []
}>()

const confirmDisabled = computed(() => !props.preview || !props.canReset || props.submitting)
</script>

<template>
  <StandardDialog
    :model-value="modelValue"
    title="清理 Transport 联调任务"
    title-icon="danger"
    size="sm"
    confirm-type="danger"
    confirm-text="确认清理"
    :confirm-loading="submitting"
    :confirm-disabled="confirmDisabled"
    :closable="!submitting"
    :close-on-click-modal="false"
    @update:model-value="value => emit('update:modelValue', value)"
    @confirm="emit('confirm')"
  >
    <el-alert
      title="按 transport_task_id 清理完整的本地 Transport 链路。不会向 WMS 或 RCS 发送取消请求。"
      type="warning"
      :closable="false"
      show-icon
    />

    <dl
      v-if="preview"
      class="reset-preview"
    >
      <dt>transport_task_id</dt>
      <dd>{{ preview.transport_task_id }}</dd>
      <dt>status</dt>
      <dd>{{ preview.status }}</dd>
      <dt>本地成员</dt>
      <dd>{{ preview.member_count }} 个成员</dd>
      <dt>资源绑定</dt>
      <dd>{{ preview.binding_count }} 个资源绑定</dd>
      <dt>活动绑定</dt>
      <dd>{{ preview.active_binding_count }} 个活动绑定</dd>
      <dt>Evidence</dt>
      <dd>{{ preview.evidence_count }} 条</dd>
      <dt>Callback Receipt</dt>
      <dd>{{ preview.callback_receipt_count }} 条回执</dd>
      <dt>位置投影</dt>
      <dd>{{ preview.position_projection_count }} 条位置投影</dd>
      <dt>Outcome version</dt>
      <dd>{{ preview.outcome_version }}</dd>
    </dl>

    <p
      v-if="preview && !canReset"
      class="permission-hint"
    >
      当前账号可查看预检结果，但缺少清理权限。
    </p>
    <p
      v-else-if="preview"
      class="cleanup-hint"
    >
      清理后该任务、Evidence、Callback Receipt、由其 Evidence
      产生的位置投影、成员和资源绑定都会被删除，可立即开始下一轮联调。
    </p>
  </StandardDialog>
</template>

<style scoped>
.reset-preview {
  display: grid;
  grid-template-columns: minmax(150px, auto) 1fr;
  gap: 8px 16px;
  margin: 16px 0 0;
  padding: 16px;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
}

.reset-preview dt,
.reset-preview dd {
  margin: 0;
  overflow-wrap: anywhere;
}

.permission-hint,
.cleanup-hint {
  margin-top: 16px;
}

.permission-hint {
  color: var(--el-text-color-secondary);
}

.cleanup-hint {
  color: var(--el-color-danger);
}

@media (width < 768px) {
  .reset-preview {
    grid-template-columns: 1fr;
  }
}
</style>
