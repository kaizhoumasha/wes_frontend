import type { VNode } from 'vue'
import type {
  CreateWorkLinesInput as CreateWorklineInput,
  UpdateWorkLinesInput as UpdateWorklineInput,
  WorkLinesItem as Workline
} from '@/api/modules/workLines'
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

function createWorklineDetailConfig(): CrudPageDetailConfig<Workline> {
  return {
    mode: 'drawer',
    title: workline => workline.line_name,
    showActions: false,
    actions: [],
    sections: [
      {
        title: '基本信息',
        weight: 'primary',
        fields: [
          { key: 'line_code', layout: 'half' },
          { key: 'line_name', layout: 'half' },
          {
            key: 'line_type',
            layout: 'half',
            formatter: v => lineTypeFormatter(v, {}, {}) as VNode
          },
          { key: 'zone_name', layout: 'half' },
          {
            key: 'is_active',
            layout: 'half',
            formatter: v => isActiveFormatter(v, {}, {}) as VNode
          },
          { key: 'description', layout: 'full' }
        ]
      },
      {
        title: '作业线属性',
        weight: 'secondary',
        fields: [
          { key: 'run_mode', layout: 'half', formatter: v => runModeFormatter(v, {}, {}) as VNode }
        ]
      }
    ]
  }
}

export function createWorkLinePageConfig(): WorklinePageConfig {
  return createCrudPageConfigFromResource<Workline, CreateWorklineInput, UpdateWorklineInput>({
    resource: WORKLINE_PAGE_RESOURCE,
    fieldConfig: workLinePageFieldConfig,
    form: {
      fieldConfig: createWorkLineFormFieldConfig()
    },
    detail: createWorklineDetailConfig(),
    features: WORKLINE_PAGE_FEATURES,
    extensions: {
      rowActions: []
    }
  })
}
