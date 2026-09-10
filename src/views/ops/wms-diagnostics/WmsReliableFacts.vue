<script setup lang="ts">
import type { ConfirmationsResult, EvidencesResult } from '@/api/modules/wmsDiagnostics'

defineProps<{
  confirmation: ConfirmationsResult | null
  evidence: EvidencesResult | null
  confirmationError: Error | null
  evidenceError: Error | null
  loading: boolean
  canReadConfirmation: boolean
  canReadEvidence: boolean
}>()

function errorMessage(error: Error) {
  const typed = error as Error & { code?: string; status?: number; statusCode?: number }
  const status = typed.status ?? typed.statusCode
  if (status === 404 || typed.code === '3000')
    return '未找到对应可靠记录；此结果不能证明此前是否发生过收发。'
  if (status === 503 || typed.code === '5030')
    return '当前无法确认可靠记录状态；持久化存储暂不可用。'
  return `查询失败：${error.message}`
}
</script>

<template>
  <section
    class="reliable-facts"
    aria-label="可靠事实"
  >
    <p
      v-if="loading"
      role="status"
    >
      正在读取可靠事实…
    </p>
    <article>
      <h2>可靠发送义务</h2>
      <p
        v-if="!canReadConfirmation"
        class="empty-state"
      >
        无可靠发送义务读取权限。
      </p>
      <p
        v-else-if="confirmationError"
        class="error-message"
        role="alert"
      >
        {{ errorMessage(confirmationError) }}
      </p>
      <dl v-else-if="confirmation">
        <dt>Identity</dt>
        <dd>{{ confirmation.operation }} / {{ confirmation.operation_id }}</dd>
        <dt>实际状态</dt>
        <dd>{{ confirmation.status }}</dd>
        <dt>最后记录时间</dt>
        <dd>{{ confirmation.updated_at ?? confirmation.last_dispatch_at ?? '—' }}</dd>
        <dt>响应结果</dt>
        <dd>{{ confirmation.response_result ?? '—' }}</dd>
        <dt>等待时间</dt>
        <dd>{{ confirmation.next_attempt_at ?? confirmation.deadline_at }}</dd>
      </dl>
    </article>
    <article>
      <h2>持久化接收与应用事实</h2>
      <p
        v-if="!canReadEvidence"
        class="empty-state"
      >
        无接收事实读取权限。
      </p>
      <p
        v-else-if="evidenceError"
        class="error-message"
        role="alert"
      >
        {{ errorMessage(evidenceError) }}
      </p>
      <dl v-else-if="evidence">
        <dt>Identity</dt>
        <dd>{{ evidence.operation }} / {{ evidence.operation_id }}</dd>
        <dt>实际状态</dt>
        <dd>{{ evidence.apply_status }}</dd>
        <dt>接收时间</dt>
        <dd>{{ evidence.received_at }}</dd>
        <dt>处理时间</dt>
        <dd>{{ evidence.processed_at ?? '—' }}</dd>
        <dt>发布时间</dt>
        <dd>{{ evidence.published_at ?? '—' }}</dd>
      </dl>
    </article>
    <p class="fact-boundary">
      HTTP 202 与应用 PENDING 可以同时成立；这些可靠事实不代表 PickingTask 或物理动作完成。
    </p>
  </section>
</template>

<style scoped>
.reliable-facts {
  margin-top: 16px;
  padding: 16px;
  background: var(--diag-panel);
  border: 1px solid var(--diag-border);
  border-radius: 8px;
}
.reliable-facts article + article {
  margin-top: 16px;
}
.reliable-facts h2 {
  margin: 0 0 8px;
  font-size: 15px;
}
.reliable-facts dl {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 6px 12px;
  margin: 0;
}
.reliable-facts dt {
  color: var(--color-text-secondary);
}
.reliable-facts dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  font-family: var(--font-mono);
}
.empty-state,
.fact-boundary {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.6;
}
.error-message {
  color: var(--el-color-danger);
}
</style>
