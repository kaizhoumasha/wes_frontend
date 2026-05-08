import { defineCrudResourceFieldBundle } from '@/components/common/crud-page/resourceFieldBuilder'
import { AuditLogResponseMetadata } from '@/api/generated/openapi-metadata'
import {
  createQuickFilterFormatter,
  formatDurationFromSeconds
} from '@/views/logs/shared/formatters'
import type { AuditLogViewItem as AuditLog } from '@/views/logs/shared/types'

type ReadonlyInput = Record<string, never>

const AUDIT_LOG_LABEL_OVERRIDES = {
  trace_id: '链路 ID',
  username: '操作用户',
  method: '请求方法',
  title: '操作名称',
  path: '请求路径',
  ip: '客户端 IP',
  country: '国家',
  region: '地区',
  city: '城市',
  user_agent: 'User-Agent',
  os: '操作系统',
  browser: '浏览器',
  device: '设备',
  args: '请求参数',
  status: '执行状态',
  code: '响应码',
  msg: '响应消息',
  object_type: '对象类型',
  action: '操作动作',
  object_id: '对象标识',
  change_summary: '变更摘要',
  cost_time: '耗时',
  opera_time: '操作时间'
} as const

const AUDIT_STATUS_LABEL_MAP: Record<string, string> = {
  SUCCESS: '成功',
  FAIL: '失败'
}

export const AUDIT_LOG_TABLE_STORAGE_KEY = 'wes-audit-log-table-columns'

export const {
  fieldConfig: auditLogPageFieldConfig
} = defineCrudResourceFieldBundle<AuditLog, ReadonlyInput, ReadonlyInput>({
  backend: {
    readSchema: AuditLogResponseMetadata,
    labelOverrides: AUDIT_LOG_LABEL_OVERRIDES
  },
  fields: [
    {
      key: 'opera_time',
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
      key: 'username',
      table: {
        visibleFrom: 'mobile',
        width: 116,
        formatter: createQuickFilterFormatter({ field: 'username' })
      },
      search: {}
    },
    {
      key: 'status',
      table: {
        visibleFrom: 'mobile',
        width: 104,
        formatter: createQuickFilterFormatter({
          field: 'status',
          label: value => AUDIT_STATUS_LABEL_MAP[String(value)] ?? String(value),
          tagType: value => String(value) === 'SUCCESS' ? 'success' : 'danger'
        })
      },
      search: {}
    },
    {
      key: 'action',
      table: {
        visibleFrom: 'mobile',
        width: 116,
        formatter: createQuickFilterFormatter({ field: 'action' })
      },
      search: {
        defaultOperator: 'equals',
        quickOps: ['equals', 'contains']
      }
    },
    {
      key: 'object_type',
      table: {
        visibleFrom: 'mobile',
        width: 148,
        formatter: createQuickFilterFormatter({ field: 'object_type' })
      },
      search: {
        defaultOperator: 'equals',
        quickOps: ['equals', 'contains']
      }
    },
    {
      key: 'object_id',
      table: {
        visibleFrom: 'tablet',
        width: 120,
        formatter: createQuickFilterFormatter({ field: 'object_id' })
      },
      search: {
        defaultOperator: 'equals',
        quickOps: ['equals', 'contains']
      }
    },
    {
      key: 'title',
      table: {
        visibleFrom: 'tablet',
        minWidth: 180,
        formatter: createQuickFilterFormatter({ field: 'title' })
      },
      search: {}
    },
    {
      key: 'change_summary',
      table: {
        visibleFrom: 'tablet',
        minWidth: 220,
        formatter: createQuickFilterFormatter({ field: 'change_summary' })
      },
      search: {
        defaultOperator: 'contains',
        quickOps: ['contains', 'equals']
      }
    },
    {
      key: 'method',
      table: {
        visibleFrom: 'desktop',
        width: 110,
        formatter: createQuickFilterFormatter({ field: 'method' })
      },
      search: {}
    },
    {
      key: 'path',
      table: {
        visibleFrom: 'tablet',
        minWidth: 220,
        formatter: createQuickFilterFormatter({ field: 'path' })
      },
      search: {}
    },
    {
      key: 'cost_time',
      table: {
        visibleFrom: 'tablet',
        width: 110,
        sortable: true,
        formatter: value => formatDurationFromSeconds(value)
      },
      search: {}
    },
    {
      key: 'code',
      table: {
        visibleFrom: 'desktop',
        width: 110
      },
      search: {}
    },
    {
      key: 'ip',
      table: {
        visibleFrom: 'desktop',
        width: 150,
        formatter: createQuickFilterFormatter({ field: 'ip' })
      },
      search: {}
    },
    {
      key: 'trace_id',
      table: {
        visibleFrom: 'desktop',
        width: 180,
        formatter: createQuickFilterFormatter({ field: 'trace_id' })
      },
      search: {}
    }
  ],
  storageKey: AUDIT_LOG_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['opera_time'],
  search: {
    placeholder: '搜索用户、对象类型、动作、对象 ID、路径、链路 ID...'
  }
})
