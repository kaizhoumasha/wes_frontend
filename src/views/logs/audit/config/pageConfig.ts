import { sysApiMethods } from '@/api/modules/sys'
import { SYS_PERMISSIONS } from '@/api/generated/permissions'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageConfig, CrudPageFeatures } from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import { auditLogPageFieldConfig } from './fieldConfig'
import { createEqualsQuickPreset, createRecentHoursQuickPreset } from '@/views/logs/shared/search'
import {
  createChangesDiffFormatter,
  createAuditSummaryCardFormatter,
  formatDurationFromSeconds
} from '@/views/logs/shared/formatters'
import type { AuditLogViewItem as AuditLog } from '@/views/logs/shared/types'

type ReadonlyInput = Record<string, never>

type AuditLogPageConfig = CrudPageConfig<AuditLog, ReadonlyInput, ReadonlyInput>

const AUDIT_STATUS_LABEL_MAP: Record<string, string> = {
  SUCCESS: '成功',
  FAIL: '失败'
}

const AUDIT_LOG_PAGE_RESOURCE = {
  key: 'audit-logs',
  title: {
    text: '审计日志',
    subtitle: '操作审计与合规追溯',
    icon: 'ep:document'
  },
  methods: sysApiMethods,
  permissions: {
    create: SYS_PERMISSIONS.auditlog.list,
    update: SYS_PERMISSIONS.auditlog.detail,
    delete: SYS_PERMISSIONS.auditlog.detail
  },
  pageSize: 20,
  defaultSort: [{ field: 'opera_time', order: 'desc' as const }]
}

const AUDIT_LOG_PAGE_TABLE: Partial<AuditLogPageConfig['table']> = {
  selectable: false,
  actionsColumn: {
    width: 88,
    minWidth: 88,
    fixed: 'right',
    reorderLocked: true,
    hideable: false
  }
}

const AUDIT_LOG_PAGE_FEATURES: CrudPageFeatures = {
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

const AUDIT_LOG_QUICK_PRESETS = [
  // 时间粒度细化（从 Toolbar 移入）
  createRecentHoursQuickPreset('opera_time', '操作时间', 0.25), // 最近 15 分钟
  createRecentHoursQuickPreset('opera_time', '操作时间', 1), // 最近 1 小时
  createRecentHoursQuickPreset('opera_time', '操作时间', 4), // 最近 4 小时

  // 异常定位（高价值）
  createEqualsQuickPreset('audit-fail-only', 'status', '仅失败操作', 'FAIL', '优先定位失败的操作'),
  createEqualsQuickPreset(
    'audit-success-only',
    'status',
    '仅成功操作',
    'SUCCESS',
    '仅查看执行成功的操作'
  )
]

const AUDIT_LOG_TOOLBAR_ACTIONS: NonNullable<AuditLogPageConfig['extensions']>['toolbarActions'] = [
  // 核心异常入口（提升为首要）
  {
    key: 'audit-fail-only',
    label: '仅失败操作',
    icon: 'ep:warning',
    type: 'danger',
    handler: context => context.applyQuickPreset('audit-fail-only', { replace: true }),
    tooltip: '优先定位失败操作'
  },
  // 辅助操作
  {
    key: 'audit-clear-filters',
    label: '重置条件',
    icon: 'ep:refresh-left',
    handler: context => context.clearFilters(),
    tooltip: '清空当前筛选条件'
  }
]

const AUDIT_LOG_PAGE_DETAIL: CrudPageDetailConfig<AuditLog> = {
  mode: 'drawer',
  width: 720,
  title: auditLog => auditLog.title || '审计日志详情',
  entityTypeLabel: '审计日志',
  sections: [
    {
      title: '操作概览',
      weight: 'primary',
      variant: 'card',
      fields: [
        {
          key: 'id',
          layout: 'full',
          label: '',
          formatter: createAuditSummaryCardFormatter<AuditLog>(
            value => AUDIT_STATUS_LABEL_MAP[String(value)] ?? String(value)
          )
        }
      ]
    },
    {
      title: '变更详情',
      weight: 'primary',
      showWhen: item => {
        const changes = (item.args as Record<string, unknown>)?.changes
        return (
          changes != null &&
          typeof changes === 'object' &&
          Object.keys(changes as object).length > 0
        )
      },
      fields: [
        { key: 'change_summary', layout: 'full' },
        {
          key: 'args',
          layout: 'full',
          label: '字段变更对比',
          formatter: createChangesDiffFormatter<AuditLog>(
            item => (item.args as Record<string, unknown>)?.changes
          )
        }
      ]
    },
    {
      title: '请求信息',
      weight: 'secondary',
      collapsible: true,
      fields: [
        { key: 'method', layout: 'half' },
        { key: 'path', layout: 'half' },
        { key: 'code', layout: 'half' },
        { key: 'cost_time', layout: 'half', formatter: value => formatDurationFromSeconds(value) },
        { key: 'trace_id', layout: 'full' }
      ]
    },
    {
      title: '原始证据',
      weight: 'secondary',
      collapsible: true,
      defaultCollapsed: true,
      fields: [
        { key: 'msg', layout: 'full' },
        { key: 'args', layout: 'full', formatter: 'json' },
        { key: 'country', layout: 'third' },
        { key: 'region', layout: 'third' },
        { key: 'city', layout: 'third' },
        { key: 'os', layout: 'third' },
        { key: 'browser', layout: 'third' },
        { key: 'device', layout: 'third' },
        { key: 'user_agent', layout: 'full' }
      ]
    }
  ]
}

export function createAuditLogPageConfig(): AuditLogPageConfig {
  return createCrudPageConfigFromResource<AuditLog, ReadonlyInput, ReadonlyInput>({
    resource: AUDIT_LOG_PAGE_RESOURCE,
    fieldConfig: {
      ...auditLogPageFieldConfig,
      search: {
        ...auditLogPageFieldConfig.search,
        quickPresets: AUDIT_LOG_QUICK_PRESETS
      }
    },
    table: AUDIT_LOG_PAGE_TABLE,
    detail: AUDIT_LOG_PAGE_DETAIL,
    features: AUDIT_LOG_PAGE_FEATURES,
    extensions: {
      toolbarActions: AUDIT_LOG_TOOLBAR_ACTIONS
    }
  })
}
