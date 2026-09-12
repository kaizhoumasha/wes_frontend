<script setup lang="ts">
import { computed } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import type { CallbackReceiptsResult, GetByTransportTaskIdResult } from '@/api/modules/transport'
import { buildTransportWaitingStages } from './transportDiagnosticExport'

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
  exportDiagnostic: []
}>()
const publicationState = computed(() => {
  if (!props.detail) return '—'
  if (props.detail.outcome_version === 0) return '尚无待发布结果'
  return props.detail.outcome_version > props.detail.published_outcome_version
    ? '待发布'
    : '已发布（仅表示发布完成）'
})
const waitingStages = computed(() =>
  props.detail ? buildTransportWaitingStages(props.detail) : []
)
const linkedCallbackReceipt = computed(() => {
  if (!props.detail?.latest_evidence || !props.callbackReceipt) return null
  return props.callbackReceipt.operation === props.detail.latest_evidence.operation &&
    props.callbackReceipt.operation_id === props.detail.latest_evidence.operation_id
    ? props.callbackReceipt
    : null
})
const acceptanceState = computed(() => {
  if (!props.detail) return '未观察到'
  if (props.detail.status === 'REJECTED') return '已拒绝'
  if (['ACCEPTED', 'SUCCEEDED', 'FAILED'].includes(props.detail.status)) return '已观察到接纳'
  if (props.detail.status === 'RECONCILING') return '接纳事实未确认'
  return '未观察到'
})
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
      <div class="detail-actions">
        <AppButton @click="emit('exportDiagnostic')">导出排查记录</AppButton>
      </div>
      <section class="evidence-layer">
        <p class="layer-label">01 / 任务请求与业务决策</p>
        <dl>
          <dt>transport_task_id</dt>
          <dd>{{ detail.transport_task_id }}</dd>
          <dt>client_request_id</dt>
          <dd>{{ detail.client_request_id }}</dd>
          <dt>任务请求</dt>
          <dd>已观察到</dd>
          <dt>WMS 决策</dt>
          <dd>未观察到（当前 Transport 合同无独立决策记录）</dd>
        </dl>
        <pre>{{ JSON.stringify(detail.request, null, 2) }}</pre>
      </section>
      <section class="evidence-layer">
        <p class="layer-label">02 / WES 下发</p>
        <dl>
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
        </dl>
        <p>WES 创建或对端接纳不代表设备已执行。</p>
      </section>
      <section class="evidence-layer">
        <p class="layer-label">03 / 对端接纳</p>
        <p>{{ acceptanceState }}</p>
      </section>
      <section class="evidence-layer">
        <p class="layer-label">04 / Evidence 与执行结果</p>
        <p>持久 Evidence</p>
        <pre v-if="detail.latest_evidence">{{
          JSON.stringify(detail.latest_evidence, null, 2)
        }}</pre>
        <p v-else>未观察到</p>
        <p>执行结果</p>
        <pre v-if="detail.result">{{ JSON.stringify(detail.result, null, 2) }}</pre>
        <p v-else>未观察到</p>
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
      </section>
      <section class="evidence-layer">
        <p class="layer-label">05 / 等待与积压</p>
        <p>时长按当前视图加载时计算；“未安排”表示合同中没有可展示的持久重试时间。</p>
        <p v-if="waitingStages.length === 0">当前没有 WES 已记录的等待环节。</p>
        <dl
          v-for="stage in waitingStages"
          :key="stage.stage"
          class="waiting-stage"
        >
          <dt>等待环节</dt>
          <dd>{{ stage.stage }}</dd>
          <dt>已等待</dt>
          <dd>{{ stage.waiting_duration }}</dd>
          <dt>开始时间</dt>
          <dd>{{ stage.waiting_since }}</dd>
          <dt>最近尝试</dt>
          <dd>{{ stage.last_attempt_at }}</dd>
          <dt>下次重试</dt>
          <dd>{{ stage.next_retry_at }}</dd>
        </dl>
      </section>
      <section class="evidence-layer receipt-query">
        <p class="layer-label">06 / 精确关联回调收据</p>
        <p>
          只使用当前任务最新 Evidence 的 operation + operation_id 查询，不按资源或时间猜测关联。
        </p>
        <template v-if="canReadCallbackReceipt">
          <p v-if="loadingCallbackReceipt">正在查询精确关联收据…</p>
          <el-alert
            v-if="callbackReceiptUnknown"
            title="未观察到与 Evidence 身份匹配的回调收据"
            type="warning"
            :closable="false"
          />
          <dl v-else-if="linkedCallbackReceipt">
            <dt>operation</dt>
            <dd>{{ linkedCallbackReceipt.operation }}</dd>
            <dt>operation_id</dt>
            <dd>{{ linkedCallbackReceipt.operation_id }}</dd>
            <dt>response_http_status</dt>
            <dd>{{ linkedCallbackReceipt.response_http_status }}</dd>
            <dt>response_code</dt>
            <dd>{{ linkedCallbackReceipt.response_code }}</dd>
            <dt>conflict_code</dt>
            <dd>{{ linkedCallbackReceipt.conflict_code ?? '—' }}</dd>
            <dt>received_at</dt>
            <dd>{{ linkedCallbackReceipt.received_at }}</dd>
          </dl>
          <el-alert
            v-else-if="callbackReceiptError"
            :title="`查询失败，当前链路可能不完整：${callbackReceiptError}`"
            type="error"
            :closable="false"
          />
          <p v-else-if="!loadingCallbackReceipt">未观察到与 Evidence 身份匹配的回调收据</p>
        </template>
        <el-alert
          v-else
          title="缺少 Transport 回调收据查询权限"
          type="warning"
          :closable="false"
        />
      </section>
      <el-alert
        title="物理事实与现场验收仍须结合 WMS、RCS、AGV/CTU 记录和现场观察。"
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

.detail-actions {
  display: flex;
  justify-content: flex-end;
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

.waiting-stage + .waiting-stage {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--el-border-color);
}
</style>
