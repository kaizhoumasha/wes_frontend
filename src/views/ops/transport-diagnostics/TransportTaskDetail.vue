<script setup lang="ts">
import { computed, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { CallbackReceiptsResult, GetByTransportTaskIdResult } from '@/api/modules/transport'

const props = defineProps<{
  detail: GetByTransportTaskIdResult | null
  loading: boolean
  canRead: boolean
  canReadCallbackReceipt: boolean
  callbackReceipt: CallbackReceiptsResult | null
  callbackReceiptUnknown: boolean
  callbackReceiptError: string
  loadingCallbackReceipt: boolean
}>()

const emit = defineEmits<{
  lookupCallbackReceipt: [operation: string, operationId: string]
}>()
const receiptOperation = ref('transport.task.resulted@v1')
const receiptOperationId = ref('')
const publicationState = computed(() => {
  if (!props.detail) return '—'
  if (props.detail.outcome_version === 0) return '尚无待发布结果'
  return props.detail.outcome_version > props.detail.published_outcome_version
    ? '待发布'
    : '已发布（仅表示发布完成）'
})

function lookupCallbackReceipt(): void {
  const operation = receiptOperation.value.trim()
  const operationId = receiptOperationId.value.trim()
  if (operation && operationId) emit('lookupCallbackReceipt', operation, operationId)
}
</script>

<template>
  <aside
    v-loading="loading"
    class="detail-panel"
  >
    <el-empty
      v-if="!canRead"
      description="缺少 TransportTask 详情权限"
    />
    <el-empty
      v-else-if="!detail"
      description="选择任务后按需查询持久详情"
    />
    <template v-else>
      <section class="evidence-layer">
        <p class="layer-label">01 / 提交接纳</p>
        <dl>
          <dt>transport_task_id</dt>
          <dd>{{ detail.transport_task_id }}</dd>
          <dt>submit_operation_id</dt>
          <dd>{{ detail.submit_operation_id }}</dd>
          <dt>status</dt>
          <dd>{{ detail.status }}</dd>
          <dt>reason_code</dt>
          <dd>{{ detail.reason_code ?? '—' }}</dd>
          <dt>send_started_at</dt>
          <dd>{{ detail.send_started_at ?? '—' }}</dd>
          <dt>result_deadline_at（冻结）</dt>
          <dd>{{ detail.result_deadline_at ?? '—' }}</dd>
          <dt>submit_attempt_count</dt>
          <dd>{{ detail.submit_attempt_count }}</dd>
          <dt>active_binding_count</dt>
          <dd>{{ detail.active_binding_count }}</dd>
        </dl>
        <p>WES 创建或 WMS 接纳不代表设备已执行。</p>
      </section>
      <section class="evidence-layer">
        <p class="layer-label">02 / 持久 Evidence</p>
        <pre>{{ JSON.stringify(detail.latest_evidence, null, 2) }}</pre>
      </section>
      <section class="evidence-layer">
        <p class="layer-label">03 / Transport 终态</p>
        <dl>
          <dt>结果等待</dt>
          <dd>{{ detail.status === 'RECONCILING' ? '等待权威结果' : '—' }}</dd>
          <dt>outcome_version</dt>
          <dd>{{ detail.outcome_version }}</dd>
          <dt>published_outcome_version</dt>
          <dd>{{ detail.published_outcome_version }}</dd>
          <dt>publication</dt>
          <dd>{{ publicationState }}</dd>
          <dt>pending_evidence_count</dt>
          <dd>{{ detail.pending_evidence_count }}</dd>
        </dl>
        <pre>{{ JSON.stringify(detail.result, null, 2) }}</pre>
      </section>
      <section class="evidence-layer receipt-query">
        <p class="layer-label">独立回调收据查询</p>
        <p>按 operation + operation_id 精确查询；收据不与当前任务 Evidence 自动关联。</p>
        <template v-if="canReadCallbackReceipt">
          <el-input
            v-model="receiptOperation"
            aria-label="回调 operation"
          />
          <el-input
            v-model="receiptOperationId"
            aria-label="回调 operation_id"
          />
          <AppButton
            :loading="loadingCallbackReceipt"
            :disabled="!receiptOperation.trim() || !receiptOperationId.trim()"
            @click="lookupCallbackReceipt"
          >
            查询收据
          </AppButton>
          <el-alert
            v-if="callbackReceiptUnknown"
            :title="`收据状态未知：${callbackReceiptError || '查询暂不可用'}`"
            type="warning"
            :closable="false"
          />
          <dl v-else-if="callbackReceipt">
            <dt>operation</dt>
            <dd>{{ callbackReceipt.operation }}</dd>
            <dt>operation_id</dt>
            <dd>{{ callbackReceipt.operation_id }}</dd>
            <dt>response_http_status</dt>
            <dd>{{ callbackReceipt.response_http_status }}</dd>
            <dt>response_code</dt>
            <dd>{{ callbackReceipt.response_code }}</dd>
            <dt>conflict_code</dt>
            <dd>{{ callbackReceipt.conflict_code ?? '—' }}</dd>
            <dt>received_at</dt>
            <dd>{{ callbackReceipt.received_at }}</dd>
          </dl>
          <el-alert
            v-else-if="callbackReceiptError"
            :title="callbackReceiptError"
            type="error"
            :closable="false"
          />
        </template>
        <el-alert
          v-else
          title="缺少 Transport 回调收据查询权限"
          type="warning"
          :closable="false"
        />
      </section>
      <section class="evidence-layer">
        <p class="layer-label">规范化请求</p>
        <pre>{{ JSON.stringify(detail.request, null, 2) }}</pre>
      </section>
      <el-alert
        title="04 / 物理事实与现场验收仍须结合 WMS、RCS、AGV/CTU 记录和现场观察。"
        type="warning"
        :closable="false"
        show-icon
      />
      <el-alert
        v-if="detail.status === 'RECONCILING'"
        title="交付事实未知：保留原任务身份进行对账，禁止盲目重发。"
        type="warning"
        :closable="false"
        show-icon
      />
    </template>
  </aside>
</template>

<style scoped>
.detail-panel {
  display: grid;
  align-content: start;
  gap: 16px;
  min-height: 360px;
  padding: 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: 12px;
}

.evidence-layer {
  padding: 12px;
  background: var(--el-fill-color-light);
  border-left: 3px solid var(--color-primary);
  border-radius: 8px;
}

.layer-label {
  margin: 0 0 8px;
  color: var(--color-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

dl {
  display: grid;
  grid-template-columns: minmax(140px, auto) 1fr;
  gap: 6px 12px;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
}

dt,
dd {
  margin: 0;
  overflow-wrap: anywhere;
}

pre {
  overflow: auto;
  max-height: 220px;
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.receipt-query {
  display: grid;
  gap: 8px;
}

.receipt-query p {
  margin: 0;
}
</style>
