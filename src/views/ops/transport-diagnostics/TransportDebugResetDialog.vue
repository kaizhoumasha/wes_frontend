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

const confirmDisabled = computed(
  () => !props.preview?.eligible || !props.canReset || props.submitting
)

const blockerLabels: Record<ResetPreviewResult['blockers'][number], string> = {
  STATUS_NOT_RECONCILING: '任务状态不是 RECONCILING',
  TRANSPORT_EVIDENCE_EXISTS: '已存在 Transport Evidence',
  TRANSPORT_OUTCOME_EXISTS: '已存在 Transport Outcome'
}
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
      title="只清理当前选中的联调 Transport 聚合。已收到 Evidence 或 Outcome 的任务不会被清理。"
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
      <dd>{{ preview.evidence_count }}</dd>
      <dt>Outcome version</dt>
      <dd>{{ preview.outcome_version }}</dd>
    </dl>

    <el-alert
      v-if="preview && !preview.eligible"
      class="reset-blockers"
      type="error"
      :closable="false"
      show-icon
    >
      <template #title>当前任务不可清理</template>
      <ul>
        <li
          v-for="blocker in preview.blockers"
          :key="blocker"
        >
          {{ blockerLabels[blocker] }}
        </li>
      </ul>
    </el-alert>

    <p
      v-if="preview?.eligible && !canReset"
      class="permission-hint"
    >
      当前账号可查看预检结果，但缺少清理权限。
    </p>
    <p
      v-else-if="preview?.eligible"
      class="eligible-hint"
    >
      清理后该本地联调任务及其成员、资源绑定将被删除，可立即开始下一轮联调。
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

.reset-blockers,
.permission-hint,
.eligible-hint {
  margin-top: 16px;
}

.reset-blockers ul {
  margin: 8px 0 0;
  padding-left: 20px;
}

.permission-hint {
  color: var(--el-text-color-secondary);
}

.eligible-hint {
  color: var(--el-color-danger);
}

@media (width < 768px) {
  .reset-preview {
    grid-template-columns: 1fr;
  }
}
</style>
