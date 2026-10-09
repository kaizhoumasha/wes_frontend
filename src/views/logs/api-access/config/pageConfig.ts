import { apiAccessLogsApiMethods } from '@/api/modules/apiAccessLogs'
import { SYS_PERMISSIONS } from '@/api/generated/permissions'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageConfig, CrudPageFeatures } from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import {
  apiAccessLogPageFieldConfig,
  API_ACCESS_LOG_DIRECTION_LABELS,
  API_ACCESS_LOG_DELIVERY_LABELS
} from './fieldConfig'
import {
  createRecentHoursQuickPreset,
  createThresholdQuickPreset
} from '@/views/logs/shared/search'
import {
  createQuickFilterDetailFormatter,
  formatDurationFromMilliseconds,
  resolveStatusCodeTagType
} from '@/views/logs/shared/formatters'
import type { APIAccessLogViewItem as APIAccessLog } from '@/views/logs/shared/types'

type ReadonlyInput = Record<string, never>

type APIAccessLogPageConfig = CrudPageConfig<APIAccessLog, ReadonlyInput, ReadonlyInput>

const API_ACCESS_LOG_PAGE_RESOURCE = {
  key: 'api-access-logs',
  title: {
    text: 'API 访问日志',
    subtitle: 'WMS、ECS 等外部系统交互',
    icon: 'ep:histogram'
  },
  methods: apiAccessLogsApiMethods,
  permissions: {
    create: SYS_PERMISSIONS.apiaccesslog.list,
    update: SYS_PERMISSIONS.apiaccesslog.detail,
    delete: SYS_PERMISSIONS.apiaccesslog.detail
  },
  pageSize: 20,
  defaultSort: [
    { field: 'created_at', order: 'desc' as const },
    { field: 'id', order: 'desc' as const }
  ]
}

const API_ACCESS_LOG_PAGE_TABLE: Partial<APIAccessLogPageConfig['table']> = {
  selectable: false,
  emptyText:
    '当前查询范围内暂无外部交互记录。可调整筛选或刷新；日志可能延迟或漏记，无记录不代表请求未到达。',
  actionsColumn: {
    width: 88,
    fixed: 'right',
    reorderLocked: true,
    hideable: false
  }
}

const API_ACCESS_LOG_PAGE_FEATURES: CrudPageFeatures = {
  create: false,
  edit: false,
  delete: false,
  batchDelete: false,
  trash: false,
  restore: false,
  batchRestore: false,
  permanentDelete: false,
  batchPermanentDelete: false
}

const API_ACCESS_LOG_QUICK_PRESETS = [
  // 时间粒度细化（从 Toolbar 移入）
  createRecentHoursQuickPreset('created_at', '记录时间', 0.25), // 最近 15 分钟
  createRecentHoursQuickPreset('created_at', '记录时间', 1), // 最近 1 小时
  createRecentHoursQuickPreset('created_at', '记录时间', 4), // 最近 4 小时

  // 异常定位（高价值）
  createThresholdQuickPreset(
    'api-5xx-only',
    'status_code',
    'HTTP 5xx',
    'gte',
    500,
    '优先定位服务端异常'
  ),
  createThresholdQuickPreset(
    'api-failed-only',
    'status_code',
    'HTTP 4xx/5xx',
    'gte',
    400,
    '筛出所有 4xx / 5xx 请求'
  ),
  createThresholdQuickPreset(
    'api-slow-1s',
    'response_time_ms',
    '慢请求 >= 1s',
    'gte',
    1000,
    '筛出耗时至少 1 秒的请求'
  ),
  createThresholdQuickPreset(
    'api-slow-3s',
    'response_time_ms',
    '慢请求 >= 3s',
    'gte',
    3000,
    '筛出耗时至少 3 秒的请求'
  )
]

const API_ACCESS_LOG_TOOLBAR_ACTIONS: NonNullable<
  APIAccessLogPageConfig['extensions']
>['toolbarActions'] = [
  // 核心异常入口（5xx 优先）
  {
    key: 'api-5xx-only',
    label: 'HTTP 5xx',
    icon: 'ep:warning-filled',
    type: 'danger',
    handler: context => context.applyQuickPreset('api-5xx-only', { replace: true }),
    tooltip: '优先定位服务端异常请求'
  },
  // 性能问题入口
  {
    key: 'api-slow-1s',
    label: '慢请求',
    icon: 'ep:timer',
    type: 'warning',
    handler: context => context.applyQuickPreset('api-slow-1s', { replace: true }),
    tooltip: '筛出响应耗时大于等于 1 秒的请求'
  },
  // 辅助操作
  {
    key: 'api-clear-filters',
    label: '重置条件',
    icon: 'ep:refresh-left',
    handler: context => context.clearFilters(),
    tooltip: '清空当前筛选条件'
  }
]

const API_ACCESS_LOG_PAGE_DETAIL: CrudPageDetailConfig<APIAccessLog> = {
  mode: 'drawer',
  size: 'lg',
  title: item => `访问日志 #${item.id}`,
  entityTypeLabel: 'API 访问日志',
  sections: [
    {
      title: '交互摘要',
      weight: 'primary',
      fields: [
        { key: 'created_at', layout: 'half', formatter: 'datetime' },
        {
          key: 'system_id',
          layout: 'half',
          formatter: createQuickFilterDetailFormatter({
            field: 'system_id',
            label: value => String(value).toUpperCase()
          })
        },
        {
          key: 'direction',
          layout: 'half',
          formatter: createQuickFilterDetailFormatter({
            field: 'direction',
            label: value => API_ACCESS_LOG_DIRECTION_LABELS[String(value)] ?? String(value)
          })
        },
        {
          key: 'method',
          layout: 'half',
          formatter: createQuickFilterDetailFormatter({ field: 'method' })
        },
        {
          key: 'path',
          layout: 'full',
          formatter: createQuickFilterDetailFormatter({ field: 'path' })
        },
        {
          key: 'status_code',
          layout: 'half',
          showWhen: value => value != null,
          formatter: createQuickFilterDetailFormatter({
            field: 'status_code',
            tagType: resolveStatusCodeTagType
          })
        },
        // 全局空值处理先于 formatter，说明使用已有非空 ID 元数据承载。
        {
          key: 'id',
          label: 'HTTP 状态',
          layout: 'half',
          showWhen: (_value, item) => item.status_code == null,
          formatter: () => '无 HTTP 响应'
        },
        {
          key: 'response_time_ms',
          layout: 'half',
          formatter: value => formatDurationFromMilliseconds(value)
        },
        {
          key: 'delivery_state',
          layout: 'half',
          formatter: createQuickFilterDetailFormatter({
            field: 'delivery_state',
            label: value => API_ACCESS_LOG_DELIVERY_LABELS[String(value)] ?? String(value)
          })
        },
        {
          key: 'error_code',
          layout: 'half',
          formatter: createQuickFilterDetailFormatter({ field: 'error_code' })
        }
      ]
    },
    {
      title: '追踪与地址',
      weight: 'secondary',
      fields: [
        {
          key: 'peer_address',
          layout: 'full',
          formatter: createQuickFilterDetailFormatter({ field: 'peer_address' })
        },
        {
          key: 'request_id',
          layout: 'full',
          formatter: createQuickFilterDetailFormatter({ field: 'request_id' })
        },
        {
          key: 'trace_id',
          layout: 'full',
          formatter: createQuickFilterDetailFormatter({ field: 'trace_id' })
        },
        {
          key: 'event_id',
          layout: 'full',
          formatter: createQuickFilterDetailFormatter({ field: 'event_id' })
        },
        {
          key: 'causation_id',
          layout: 'full',
          formatter: createQuickFilterDetailFormatter({ field: 'causation_id' })
        },
        { key: 'id', layout: 'half' }
      ]
    },
    {
      title: '已保存快照',
      weight: 'tertiary',
      fields: [
        { key: 'details', layout: 'full', formatter: 'json', showWhen: value => value != null },
        {
          key: 'id',
          label: '',
          layout: 'full',
          showWhen: (_value, item) => item.details == null,
          formatter: () => '此记录未保存详情快照。'
        },
        {
          key: 'direction',
          label: '',
          layout: 'full',
          showWhen: (_value, item) => item.details == null && item.direction === 'OUTBOUND',
          formatter: () => '本次出站日志仅保存交互元数据。'
        }
      ]
    }
  ]
}

export function createAPIAccessLogPageConfig(): APIAccessLogPageConfig {
  const config = createCrudPageConfigFromResource<APIAccessLog, ReadonlyInput, ReadonlyInput>({
    resource: API_ACCESS_LOG_PAGE_RESOURCE,
    fieldConfig: {
      ...apiAccessLogPageFieldConfig,
      search: {
        ...apiAccessLogPageFieldConfig.search,
        quickPresets: API_ACCESS_LOG_QUICK_PRESETS
      }
    },
    table: API_ACCESS_LOG_PAGE_TABLE,
    detail: API_ACCESS_LOG_PAGE_DETAIL,
    features: API_ACCESS_LOG_PAGE_FEATURES,
    extensions: {
      toolbarActions: API_ACCESS_LOG_TOOLBAR_ACTIONS
    }
  })
  for (const column of apiAccessLogPageFieldConfig.table.defaultColumns) {
    if (
      [
        'peer_address',
        'delivery_state',
        'error_code',
        'request_id',
        'trace_id',
        'event_id',
        'causation_id',
        'method',
        'id'
      ].includes(column.key)
    ) {
      column.visibleFrom = null
    }
  }
  return config
}
