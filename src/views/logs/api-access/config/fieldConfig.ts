import type { SearchFieldDef } from '@/types/search'
import { defineCrudResourceFieldBundle } from '@/components/common/crud-page/resourceFieldBuilder'
import { APIAccessLogResponseMetadata } from '@/api/generated/openapi-metadata'
import {
  createQuickFilterFormatter,
  formatDurationFromMilliseconds,
  resolveStatusCodeTagType
} from '@/views/logs/shared/formatters'
import type { APIAccessLogViewItem as APIAccessLog } from '@/views/logs/shared/types'

type ReadonlyInput = Record<string, never>

export const API_ACCESS_LOG_DIRECTION_LABELS: Record<string, string> = {
  INBOUND: '入站',
  OUTBOUND: '出站'
}

export const API_ACCESS_LOG_DELIVERY_LABELS: Record<string, string> = {
  NOT_SENT: '未发送',
  DELIVERY_UNKNOWN: '送达未知',
  RESPONSE_RECEIVED: '已收到响应'
}

const API_ACCESS_LOG_LABEL_OVERRIDES = {
  system_id: '系统',
  direction: '方向',
  method: '方法',
  path: '路径',
  peer_address: '对端地址',
  status_code: 'HTTP 状态',
  response_time_ms: '交互耗时',
  delivery_state: '送达事实',
  error_code: '错误码',
  request_id: '请求 ID',
  trace_id: 'Trace ID',
  event_id: '事件 ID',
  causation_id: '因果事件 ID',
  created_at: '记录时间',
  id: '日志 ID',
  details: '详情快照'
} as const

export const API_ACCESS_LOG_CREATED_AT_SEARCH_FIELD: SearchFieldDef = {
  key: 'created_at',
  label: '记录时间',
  dataType: 'date',
  defaultOperator: 'gte',
  quickOps: ['gte', 'lte', 'between'],
  placeholder: '请选择记录时间'
}

export const API_ACCESS_LOG_TABLE_STORAGE_KEY = 'wes-api-access-log-table-columns'

export const { fieldConfig: apiAccessLogPageFieldConfig } = defineCrudResourceFieldBundle<
  APIAccessLog,
  ReadonlyInput,
  ReadonlyInput
>({
  backend: {
    readSchema: APIAccessLogResponseMetadata,
    labelOverrides: API_ACCESS_LOG_LABEL_OVERRIDES
  },
  fields: [
    {
      key: 'created_at',
      table: {
        visibleFrom: 'mobile',
        fixed: 'left',
        reorderLocked: true,
        hideable: false,
        width: 176,
        sortable: true
      },
      search: { defaultOperator: 'gte', quickOps: ['gte', 'lte', 'between'] }
    },
    {
      key: 'system_id',
      table: {
        visibleFrom: 'mobile',
        width: 100,
        formatter: createQuickFilterFormatter({
          field: 'system_id',
          emptyLabel: '—',
          label: value => String(value).toUpperCase()
        })
      },
      search: {}
    },
    {
      key: 'direction',
      table: {
        visibleFrom: 'mobile',
        width: 100,
        formatter: createQuickFilterFormatter({
          field: 'direction',
          emptyLabel: '—',
          label: value => API_ACCESS_LOG_DIRECTION_LABELS[String(value)] ?? String(value)
        })
      },
      search: {
        options: Object.entries(API_ACCESS_LOG_DIRECTION_LABELS).map(([value, label]) => ({
          value,
          label
        }))
      }
    },
    {
      key: 'status_code',
      table: {
        visibleFrom: 'mobile',
        width: 140,
        sortable: true,
        formatter: createQuickFilterFormatter({
          field: 'status_code',
          emptyLabel: '无 HTTP 响应',
          tagType: resolveStatusCodeTagType
        })
      },
      search: {}
    },
    {
      key: 'response_time_ms',
      table: {
        visibleFrom: 'tablet',
        width: 120,
        sortable: true,
        formatter: value => formatDurationFromMilliseconds(value)
      },
      search: {}
    },
    {
      key: 'path',
      table: {
        visibleFrom: 'tablet',
        minWidth: 300,
        formatter: (value, row) =>
          createQuickFilterFormatter({
            field: 'path',
            emptyLabel: '—',
            label: path => `${row.method} ${String(path)}`
          })(value, row, {})
      },
      search: {}
    },
    ...[
      'peer_address',
      'delivery_state',
      'error_code',
      'request_id',
      'trace_id',
      'event_id',
      'causation_id',
      'method'
    ].map(key => ({
      key,
      table: {
        visibleFrom: 'desktop' as const,
        hideable: true,
        minWidth: 160,
        formatter: createQuickFilterFormatter({
          field: key,
          emptyLabel: '—',
          ...(key === 'delivery_state'
            ? {
                label: (value: unknown) =>
                  API_ACCESS_LOG_DELIVERY_LABELS[String(value)] ?? String(value)
              }
            : {})
        })
      },
      search: {}
    })),
    {
      key: 'id',
      table: { visibleFrom: 'desktop', hideable: true, width: 100, sortable: true },
      search: {}
    },
    { key: 'details' }
  ],
  storageKey: API_ACCESS_LOG_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['created_at'],
  search: { placeholder: '搜索系统、请求 ID、路径、对端地址...' }
})
