import type { VNode } from 'vue'
import type {
  CreateWorkLinesInput as CreateWorklineInput,
  UpdateWorkLinesInput as UpdateWorklineInput,
  WorkLinesItem as Workline
} from '@/api/modules/workLines'
import type { OptionsResult as WorklinePluginOptionsResult } from '@/api/modules/workline'
import { BIZ_PERMISSIONS } from '@/api/generated/permissions'
import { workLinesApiMethods } from '@/api/modules/workLines'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageConfig, CrudPageFeatures } from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import {
  createBooleanTagFormatter,
  createStatusTagFormatter
} from '@/components/common/table/formatters'
import { createWorkLineFormFieldConfig, workLinePageFieldConfig } from './fieldConfig'

const lineTypeFormatter = createStatusTagFormatter({
  AUTO: { label: '自动线', type: 'primary' },
  MANUAL: { label: '人工线', type: 'warning' },
  HYBRID: { label: '混合线', type: 'success' }
})

const runModeFormatter = createStatusTagFormatter({
  AUTO: { label: '自动运行', type: 'primary' },
  MANUAL: { label: '人工确认', type: 'warning' },
  SIMULATION: { label: '沙箱模拟', type: 'info' }
})

const isActiveFormatter = createBooleanTagFormatter({
  trueLabel: '激活',
  falseLabel: '停用',
  trueType: 'success',
  falseType: 'info'
})

type WorklinePageConfig = CrudPageConfig<Workline, CreateWorklineInput, UpdateWorklineInput>
type WorklinePluginOptions = WorklinePluginOptionsResult

interface WorklinePageActions {
  openRuntime: (workline: Workline) => void
}

const WORKLINE_PAGE_RESOURCE = {
  key: 'worklines',
  title: {
    text: '作业线管理',
    subtitle: '管理仓储作业线配置',
    icon: 'ep:connection'
  },
  trashTitle: {
    text: '作业线回收站',
    subtitle: '查看并恢复已删除作业线',
    icon: 'ep:delete'
  },
  methods: workLinesApiMethods,
  permissions: BIZ_PERMISSIONS.workline,
  optimisticUpdate: true,
  defaultSort: [{ field: 'id', order: 'asc' as const }]
}

const WORKLINE_PAGE_TABLE: Partial<WorklinePageConfig['table']> = {
  actionsColumn: {
    width: 260
  }
}

const WORKLINE_PAGE_FEATURES: CrudPageFeatures = {
  trash: {
    enabled: true,
    label: '回收站'
  },
  create: {
    label: '新增作业线',
    dialogTitle: '创建作业线'
  },
  edit: {
    dialogTitle: '编辑作业线'
  },
  restore: {
    label: '恢复作业线'
  },
  batchRestore: {
    label: '批量恢复'
  },
  permanentDelete: {
    label: '彻底删除'
  },
  batchPermanentDelete: {
    label: '批量彻底删除'
  }
}

function createWorklineDetailConfig(actions: WorklinePageActions): CrudPageDetailConfig<Workline> {
  return {
    mode: 'drawer',
    title: workline => workline.line_name,
    showActions: true,
    actions: [
      {
        key: 'open-runtime',
        label: '运行看板',
        type: 'primary',
        icon: 'ep:monitor',
        onClick: workline => actions.openRuntime(workline),
      }
    ],
    sections: [
      {
        title: '基本信息',
        weight: 'primary',
        fields: [
          { key: 'line_code', layout: 'half' },
          { key: 'line_name', layout: 'half' },
          { key: 'line_type', layout: 'half', formatter: v => lineTypeFormatter(v, {}, {}) as VNode },
          { key: 'zone_name', layout: 'half' },
          { key: 'is_active', layout: 'half', formatter: v => isActiveFormatter(v, {}, {}) as VNode },
          { key: 'description', layout: 'full' }
        ]
      },
      {
        title: '运行配置',
        weight: 'secondary',
        fields: [
          { key: 'run_mode', layout: 'half', formatter: v => runModeFormatter(v, {}, {}) as VNode },
          { key: 'plugin_key', layout: 'half' },
          { key: 'contract_version', layout: 'half' }
        ]
      }
    ]
  }
}

export function createWorkLinePageConfig(
  actions: WorklinePageActions,
  pluginOptions: WorklinePluginOptions = []
): WorklinePageConfig {
  return createCrudPageConfigFromResource<Workline, CreateWorklineInput, UpdateWorklineInput>({
    resource: WORKLINE_PAGE_RESOURCE,
    fieldConfig: workLinePageFieldConfig,
    table: WORKLINE_PAGE_TABLE,
    form: {
      fieldConfig: createWorkLineFormFieldConfig(pluginOptions)
    },
    detail: createWorklineDetailConfig(actions),
    features: WORKLINE_PAGE_FEATURES,
    extensions: {
      rowActions: [
        {
          key: 'open-runtime',
          label: '运行看板',
          type: 'primary',
          permission: BIZ_PERMISSIONS.workline.page,
          onClick: row => actions.openRuntime(row),
        }
      ]
    }
  })
}
