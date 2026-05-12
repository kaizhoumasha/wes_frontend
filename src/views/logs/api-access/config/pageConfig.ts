import { apiAuthApiMethods } from '@/api/modules/apiAuth'
import { API_AUTH_PERMISSIONS } from '@/api/generated/permissions'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageConfig, CrudPageFeatures } from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import { apiAccessLogPageFieldConfig } from './fieldConfig'
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
    subtitle: 'API 异常排查与性能分析',
    icon: 'ep:histogram'
  },
  methods: apiAuthApiMethods,
  permissions: {
    create: API_AUTH_PERMISSIONS.apiaccesslog.list,
    update: API_AUTH_PERMISSIONS.apiaccesslog.detail,
    delete: API_AUTH_PERMISSIONS.apiaccesslog.detail
  },
  pageSize: 20,
  defaultSort: [{ field: 'created_at', order: 'desc' as const }]
}

const API_ACCESS_LOG_PAGE_TABLE: Partial<APIAccessLogPageConfig['table']> = {
  selectable: false,
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
  createRecentHoursQuickPreset('created_at', '访问时间', 0.25),  // 最近 15 分钟
  createRecentHoursQuickPreset('created_at', '访问时间', 1),     // 最近 1 小时
  createRecentHoursQuickPreset('created_at', '访问时间', 4),     // 最近 4 小时

  // 异常定位（高价值）
  createThresholdQuickPreset('api-5xx-only', 'status_code', '仅 5xx 错误', 'gte', 500, '优先定位服务端异常'),
  createThresholdQuickPreset('api-failed-only', 'status_code', '仅失败请求', 'gte', 400, '筛出所有 4xx / 5xx 请求'),
  createThresholdQuickPreset('api-slow-1s', 'response_time_ms', '慢请求 >= 1s', 'gte', 1000, '筛出耗时至少 1 秒的请求'),
  createThresholdQuickPreset('api-slow-3s', 'response_time_ms', '慢请求 >= 3s', 'gte', 3000, '筛出耗时至少 3 秒的请求')
]

const API_ACCESS_LOG_TOOLBAR_ACTIONS: NonNullable<APIAccessLogPageConfig['extensions']>['toolbarActions'] = [
  // 核心异常入口（5xx 优先）
  {
    key: 'api-5xx-only',
    label: '仅 5xx',
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
  title: item => item.request_id || `访问日志 #${item.id}`,
  entityTypeLabel: 'API 访问日志',
  sections: [
    {
      title: '请求摘要',
      weight: 'primary',
      fields: [
        { key: 'created_at', layout: 'half', formatter: 'datetime' },
        { key: 'app_name', layout: 'half', formatter: createQuickFilterDetailFormatter({ field: 'app_name' }) },
        { key: 'app_id', layout: 'half' },
        { key: 'request_id', layout: 'full', formatter: createQuickFilterDetailFormatter({ field: 'request_id' }) },
        { key: 'method', layout: 'half', formatter: createQuickFilterDetailFormatter({ field: 'method' }) },
        { key: 'path', layout: 'half', formatter: createQuickFilterDetailFormatter({ field: 'path' }) },
        {
          key: 'status_code',
          layout: 'half',
          formatter: createQuickFilterDetailFormatter({
            field: 'status_code',
            tagType: value => resolveStatusCodeTagType(value)
          })
        },
        { key: 'response_time_ms', layout: 'half', formatter: value => formatDurationFromMilliseconds(value) },
        { key: 'ip_address', layout: 'half', formatter: createQuickFilterDetailFormatter({ field: 'ip_address' }) },
        { key: 'id', layout: 'half' }
      ]
    },
    {
      title: '请求上下文',
      weight: 'secondary',
      fields: [
        { key: 'user_agent', layout: 'full' },
        { key: 'error_message', layout: 'full' }
      ]
    }
  ]
}

export function createAPIAccessLogPageConfig(): APIAccessLogPageConfig {
  return createCrudPageConfigFromResource<APIAccessLog, ReadonlyInput, ReadonlyInput>({
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
}
