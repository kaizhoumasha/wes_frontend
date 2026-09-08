<script setup lang="ts">
import { computed } from 'vue'
const props = defineProps<{
  onlyDifferences?: boolean
  rows: {
    path: string
    rule: string
    actual: string
    present: boolean
    verdict: 'PASS' | 'ERROR' | 'NOT_VALIDATED'
    source: string
  }[]
}>()

const visibleRows = computed(() =>
  props.onlyDifferences ? props.rows.filter(row => row.verdict !== 'PASS') : props.rows
)

const labels = { PASS: '通过', ERROR: '合同异常', NOT_VALIDATED: '未取得校验日志' } as const
</script>

<template>
  <p
    v-if="!rows.length"
    class="comparison-empty"
  >
    未取得字段对比，请结合 WIRE 与响应结果排查。
  </p>
  <p
    v-else-if="!visibleRows.length"
    class="comparison-empty"
  >
    没有差异或未校验项。
  </p>
  <div
    v-else
    class="comparison-scroll"
    tabindex="0"
    aria-label="字段合同对比"
  >
    <table>
      <caption>采集时合同要求与实际参数</caption>
      <thead>
        <tr>
          <th scope="col">字段</th>
          <th scope="col">预期规则</th>
          <th scope="col">实际参数</th>
          <th scope="col">校验结果</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-for="(row, index) in visibleRows"
          :key="`${row.path}-${index}`"
          :data-verdict="row.verdict"
        >
          <th scope="row">
            <code>{{ row.path }}</code>
            <small>{{ row.source }}</small>
          </th>
          <td>
            <pre>{{ row.rule }}</pre>
          </td>
          <td>
            <pre v-if="row.present">{{ row.actual }}</pre>
            <span v-else>字段缺失</span>
          </td>
          <td class="comparison-result">{{ labels[row.verdict] }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.comparison-scroll {
  overflow: auto;
}
.comparison-scroll:focus-visible {
  outline: 2px solid var(--color-primary);
  outline-offset: 2px;
}
table {
  width: 100%;
  min-width: 600px;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}
caption {
  padding: 12px 0;
  color: var(--color-text-secondary);
  text-align: left;
}
th,
td {
  padding: 10px 12px;
  vertical-align: top;
  border-bottom: 1px solid var(--el-border-color);
}
thead th {
  color: var(--color-text-secondary);
  font-weight: 500;
  white-space: nowrap;
}
tbody th {
  font-weight: 400;
}
code,
pre {
  margin: 0;
  font-family: 'JetBrains Mono', monospace;
  overflow-wrap: anywhere;
  white-space: pre-wrap;
}
small {
  display: block;
  margin-top: 6px;
  color: var(--color-text-secondary);
  overflow-wrap: anywhere;
}
.comparison-result {
  white-space: nowrap;
}
[data-verdict='ERROR'] .comparison-result {
  color: var(--color-danger);
  font-weight: 600;
}
[data-verdict='ERROR'] th {
  border-left: 3px solid var(--color-danger);
}
[data-verdict='PASS'] .comparison-result {
  color: var(--color-success);
}
[data-verdict='NOT_VALIDATED'] .comparison-result,
.comparison-empty {
  color: var(--color-text-secondary);
}
</style>
