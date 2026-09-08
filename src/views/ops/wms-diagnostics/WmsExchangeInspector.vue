<script setup lang="ts">
import { computed, ref } from 'vue'
import type { WmsObservation } from '@/api/streaming/wmsDiagnosticsStream'
import ExchangeDetail from '@/views/ops/wms-diagnostics/ExchangeDetail.vue'
import FieldComparisonTable from '@/views/ops/wms-diagnostics/FieldComparisonTable.vue'
const props = defineProps<{ exchange: WmsObservation }>()
const wrap = ref(true)
const sides = ['request', 'response'] as const
const states = {
  CAPTURED: '已捕获 · 已脱敏',
  TRUNCATED: '已截断 · 已脱敏',
  UNSAFE_JSON: '无法安全展示 JSON',
  EMPTY: '空报文',
  NOT_CAPTURED: '未捕获',
  NO_RESPONSE: '未收到响应'
}
const snapshot = computed(() => JSON.stringify(props.exchange, null, 2))
const comparisons = computed(() =>
  (props.exchange.comparisons ?? []).map(row => ({
    side: row.side,
    path: row.path,
    rule:
      row.expected_rule +
      (row.expected_value != null ? `；预期值 ${JSON.stringify(row.expected_value)}` : ''),
    actual: JSON.stringify(row.actual_value) ?? '未提供',
    present: row.actual_present,
    verdict: row.verdict,
    source: row.source
  }))
)
</script>

<template>
  <ExchangeDetail
    :attempt-id="exchange.attempt_id"
    :observed-at="exchange.observed_at"
    :result="exchange.result"
    :incomplete="exchange.incomplete"
    :saved="Boolean(exchange.exchange_id)"
    :redacted-content="snapshot"
  >
    <template
      v-for="side in sides"
      :key="side"
      #[side]
    >
      <p class="identity">
        {{ exchange.operation || '未识别 operation' }}
        <br />
        {{ exchange.operation_id || '未识别 operation_id' }}
      </p>
      <p
        v-if="exchange.error_code"
        class="error"
      >
        ! {{ exchange.error_code }}
      </p>
      <p v-if="exchange.business_reference">业务关联：{{ exchange.business_reference }}</p>
      <p class="wire-state">
        {{ states[exchange[side]?.state ?? 'NOT_CAPTURED'] }} ·
        {{ exchange[side]?.source ?? 'NOT_CAPTURED' }}
      </p>
      <p v-if="exchange[side]?.state === 'NO_RESPONSE'">
        没有观察到响应；不能据此判定对方未接收或物理动作失败。
      </p>
      <label>
        <input
          v-model="wrap"
          type="checkbox"
        />
        JSON 自动换行
      </label>
      <details>
        <summary>WIRE / PAYLOAD · 展开采集报文</summary>
        <pre :class="{ wrap }">{{
          exchange[side]?.headers?.map(pair => pair.join(': ')).join('\n')
        }}</pre>
        <pre :class="{ wrap }">{{ exchange[side]?.body ?? '没有可展示的报文内容' }}</pre>
      </details>
    </template>
    <template #comparisons="{ side, onlyDifferences }">
      <p v-if="exchange.contract_status === 'NOT_VALIDATED'">
        未取得校验日志；以下规则仅供比对，不代表本次校验通过。
      </p>
      <FieldComparisonTable
        :rows="comparisons.filter(row => row.side === side)"
        :only-differences="onlyDifferences"
      />
    </template>
  </ExchangeDetail>
</template>

<style scoped>
.identity,
pre {
  font-family: var(--font-mono, monospace);
  overflow-wrap: anywhere;
}
pre {
  max-height: 260px;
  overflow: auto;
  font-size: 12px;
}
.wrap {
  white-space: pre-wrap;
}
.wire-state {
  color: var(--diag-warning);
}
.error {
  color: var(--diag-error);
}
details {
  margin-top: 12px;
}
summary {
  cursor: pointer;
}
</style>
