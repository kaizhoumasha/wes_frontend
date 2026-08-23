<script setup lang="ts">
import { computed, h, ref } from 'vue'
import AppButton from '@/components/ui/AppButton.vue'
import StandardDrawer from '@/components/ui/StandardDrawer/StandardDrawer.vue'
import { DataTable, type TableColumnConfig } from '@/components/ui/table'
import type { DeviceEvidenceRow } from './useDeviceEvidenceStream'

interface Props {
  rows: DeviceEvidenceRow[]
}

interface EvidenceDisplayRow extends Record<string, unknown> {
  source: DeviceEvidenceRow
  time: string
  kind: string
  device: string
  subject: string
  disposition: string
  applyStatus: string
  httpStatus: string
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (event: 'debug', deviceCode: string, launcher: HTMLElement | null): void
}>()
const selectedRow = ref<DeviceEvidenceRow | null>(null)
const drawerOpen = ref(false)

const displayRows = computed<EvidenceDisplayRow[]>(() => props.rows.map(toDisplayRow))
const columns: TableColumnConfig[] = [
  { field: 'time', title: '时间', minWidth: 180, formatter: (_value, row) => gapOr(row, row.time) },
  {
    field: 'kind',
    title: '类型',
    width: 130,
    formatter: (value, row) => gapOrBadge(row, value, 'info')
  },
  { field: 'device', title: '设备', minWidth: 130 },
  { field: 'subject', title: '指令 / 事件', minWidth: 160 },
  {
    field: 'disposition',
    title: 'HTTP 处置',
    width: 130,
    formatter: (value, row) =>
      gapOrBadge(
        row,
        value,
        ['ACCEPTED', 'DUPLICATE'].includes(String(value)) ? 'success' : 'danger'
      )
  },
  {
    field: 'applyStatus',
    title: 'Evidence 应用',
    width: 150,
    formatter: (value, row) => gapOrBadge(row, value, applyBadgeTone(String(value)))
  },
  {
    field: 'httpStatus',
    title: 'HTTP',
    width: 90,
    align: 'center',
    formatter: (value, row) =>
      gapOrBadge(row, value, Number(value) >= 200 && Number(value) < 300 ? 'success' : 'danger')
  },
  {
    title: '操作',
    width: 210,
    fixed: 'right',
    slots: {
      default: ({ row }) => {
        const source = (row as EvidenceDisplayRow).source
        if (source.gap) return ''
        return h('div', { class: 'evidence-actions' }, [
          h(AppButton, { size: 'small', onClick: () => showDetails(source) }, () => '详情'),
          h(
            AppButton,
            {
              size: 'small',
              type: 'primary',
              disabled: !deviceCode(source),
              onClick: (event: MouseEvent) =>
                launchDebug(source, event.currentTarget as HTMLElement)
            },
            () => '现场联调下发'
          )
        ])
      }
    }
  }
]

const formattedPayload = computed(() => {
  const row = selectedRow.value
  if (!row) return ''
  return JSON.stringify(row.attempt?.raw_payload ?? row.latestUpdate ?? {}, null, 2)
})

function toDisplayRow(source: DeviceEvidenceRow): EvidenceDisplayRow {
  if (source.gap) {
    return {
      source,
      time: '',
      kind: '',
      device: '',
      subject: '',
      disposition: '',
      applyStatus: '',
      httpStatus: ''
    }
  }
  const attempt = source.attempt
  const update = source.latestUpdate
  return {
    source,
    time: attempt?.received_at ?? update?.processed_at ?? '—',
    kind: attempt?.kind ?? update?.kind ?? '—',
    device: deviceCode(source) ?? '—',
    subject:
      attempt?.command_code ??
      attempt?.event_type ??
      update?.command_code ??
      update?.event_type ??
      '—',
    disposition: attempt?.disposition ?? '—',
    applyStatus: update?.apply_status ?? attempt?.apply_status ?? '—',
    httpStatus: attempt ? String(attempt.status_code) : '—'
  }
}

function gapOr(row: Record<string, unknown>, fallback: unknown) {
  return (row as EvidenceDisplayRow).source?.gap
    ? h('strong', { class: 'gap-message' }, '期间可能存在消息缺口')
    : String(fallback ?? '—')
}

function gapOrBadge(
  row: Record<string, unknown>,
  value: unknown,
  tone: 'success' | 'warning' | 'danger' | 'info'
) {
  if ((row as EvidenceDisplayRow).source?.gap) return ''
  const text = String(value ?? '—')
  if (text === '—') return text
  return h('span', { class: `evidence-badge evidence-badge--${tone}` }, text)
}

function applyBadgeTone(value: string): 'success' | 'warning' | 'danger' | 'info' {
  if (value === 'APPLIED') return 'success'
  if (value === 'FAILED') return 'danger'
  if (value === 'PENDING' || value === 'RECONCILING') return 'warning'
  return 'info'
}

function deviceCode(row: DeviceEvidenceRow): string | null {
  return row.attempt?.device_code ?? row.latestUpdate?.device_code ?? null
}

function spanMethod({
  row,
  columnIndex
}: {
  row: EvidenceDisplayRow | DeviceEvidenceRow
  columnIndex: number
}) {
  const source = 'source' in row ? row.source : row
  if (!source.gap) return [1, 1] as [number, number]
  return columnIndex === 0
    ? ([1, columns.length] as [number, number])
    : ([0, 0] as [number, number])
}

function showDetails(row: DeviceEvidenceRow): void {
  selectedRow.value = row
  drawerOpen.value = true
}

function launchDebug(row: DeviceEvidenceRow, launcher: HTMLElement | null = null): void {
  const code = deviceCode(row)
  if (code) emit('debug', code, launcher)
}

defineExpose({ showDetails, launchDebug, spanMethod })
</script>

<template>
  <DataTable
    :data="displayRows"
    :columns="columns"
    row-key="source.rowKey"
    density="compact"
    stripe
    border
    :span-method="spanMethod"
  />

  <StandardDrawer
    v-model="drawerOpen"
    title="解析 JSON（非字节级原始 body）"
    size="lg"
  >
    <pre class="payload-json">{{ formattedPayload }}</pre>
  </StandardDrawer>
</template>

<style scoped>
.payload-json {
  margin: 0;
  overflow: auto;
  color: var(--el-text-color-primary);
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  line-height: 1.6;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

:deep(.evidence-actions) {
  display: flex;
  gap: 8px;
}

:deep(.gap-message) {
  color: var(--el-color-warning);
  font-weight: 600;
}

:deep(.evidence-badge) {
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border: 1px solid currentcolor;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

:deep(.evidence-badge--success) {
  color: var(--el-color-success);
}

:deep(.evidence-badge--warning) {
  color: var(--el-color-warning);
}

:deep(.evidence-badge--danger) {
  color: var(--el-color-danger);
}

:deep(.evidence-badge--info) {
  color: var(--el-text-color-secondary);
}
</style>
