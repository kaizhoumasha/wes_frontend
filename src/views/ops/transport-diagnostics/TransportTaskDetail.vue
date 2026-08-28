<script setup lang="ts">
import type { GetByTransportTaskIdResult } from '@/api/modules/transport'

defineProps<{
  detail: GetByTransportTaskIdResult | null
  loading: boolean
  canRead: boolean
}>()
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
        </dl>
        <p>WES 创建或 WMS 接纳不代表设备已执行。</p>
      </section>
      <section class="evidence-layer">
        <p class="layer-label">02 / 持久 Evidence</p>
        <pre>{{ JSON.stringify(detail.latest_evidence, null, 2) }}</pre>
      </section>
      <section class="evidence-layer">
        <p class="layer-label">03 / Transport 终态</p>
        <pre>{{ JSON.stringify(detail.result, null, 2) }}</pre>
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
</style>
