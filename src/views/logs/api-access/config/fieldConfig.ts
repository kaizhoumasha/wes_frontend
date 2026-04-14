import type { SearchFieldDef } from '@/types/search'
import { defineCrudResourceFieldBundle } from '@/components/common/crud-page/resourceFieldBuilder'
import {
  createQuickFilterFormatter,
  formatDurationFromMilliseconds,
  resolveStatusCodeTagType
} from '@/views/logs/shared/formatters'
import type { APIAccessLogViewItem as APIAccessLog } from '@/views/logs/shared/types'

type ReadonlyInput = Record<string, never>

const API_ACCESS_LOG_LABEL_OVERRIDES = {
  app_id: '应用 ID',
  app_name: '应用名称',
  request_id: '请求 ID',
  method: '请求方法',
  path: '请求路径',
  status_code: '状态码',
  response_time_ms: '响应耗时',
  ip_address: '客户端 IP',
  user_agent: 'User-Agent',
  error_message: '错误信息',
  created_at: '访问时间'
} as const

export const API_ACCESS_LOG_CREATED_AT_SEARCH_FIELD: SearchFieldDef = {
  key: 'created_at',
  label: '访问时间',
  dataType: 'date',
  defaultOperator: 'gte',
  quickOps: ['gte', 'lte', 'between'],
  placeholder: '请选择访问时间'
}

export const API_ACCESS_LOG_TABLE_STORAGE_KEY = 'wes-api-access-log-table-columns'

export const {
  fieldConfig: apiAccessLogPageFieldConfig
} = defineCrudResourceFieldBundle<APIAccessLog, ReadonlyInput, ReadonlyInput>({
  backend: {
    readSchema: 'APIAccessLogResponse',
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
      search: {
        defaultOperator: 'gte',
        quickOps: ['gte', 'lte', 'between']
      }
    },
    {
      key: 'app_name',
      table: {
        visibleFrom: 'mobile',
        width: 168,
        formatter: createQuickFilterFormatter({ field: 'app_name' })
      },
      search: {}
    },
    {
      key: 'request_id',
      table: {
        visibleFrom: 'mobile',
        width: 180,
        formatter: createQuickFilterFormatter({ field: 'request_id' })
      },
      search: {}
    },
    {
      key: 'method',
      table: {
        visibleFrom: 'mobile',
        width: 110,
        formatter: createQuickFilterFormatter({ field: 'method' })
      },
      search: {}
    },
    {
      key: 'path',
      table: {
        visibleFrom: 'tablet',
        minWidth: 240,
        formatter: createQuickFilterFormatter({ field: 'path' })
      },
      search: {}
    },
    {
      key: 'status_code',
      table: {
        visibleFrom: 'tablet',
        width: 110,
        sortable: true,
        formatter: createQuickFilterFormatter({
          field: 'status_code',
          tagType: value => resolveStatusCodeTagType(value)
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
      key: 'ip_address',
      table: {
        visibleFrom: 'desktop',
        width: 150,
        formatter: createQuickFilterFormatter({ field: 'ip_address' })
      },
      search: {}
    },
    {
      key: 'error_message',
      table: {
        visibleFrom: 'desktop',
        minWidth: 220,
        formatter: createQuickFilterFormatter({ field: 'error_message' })
      },
      search: {
        defaultOperator: 'contains',
        quickOps: ['contains', 'equals']
      }
    },
    {
      key: 'id',
      table: {
        visibleFrom: 'desktop',
        width: 100,
        sortable: true
      }
    }
  ],
  storageKey: API_ACCESS_LOG_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['created_at'],
  search: {
    placeholder: '搜索应用名称、请求 ID、路径、客户端 IP...'
  }
})
