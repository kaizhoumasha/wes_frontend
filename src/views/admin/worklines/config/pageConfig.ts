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
import { workLinePageFieldConfig } from './fieldConfig'

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
  defaultSort: [{ field: 'sort_order', order: 'asc' as const }]
}

const WORKLINE_PAGE_TABLE: Partial<WorklinePageConfig['table']> = {
  actionsColumn: {
    width: 200
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

const WORKLINE_PAGE_DETAIL: CrudPageDetailConfig<Workline> = {
  mode: 'drawer',
  width: 600,
  title: workline => workline.line_name,
  sections: [
    {
      title: '基本信息',
      weight: 'primary',
      fields: [
        { key: 'line_code', layout: 'half' },
        { key: 'line_name', layout: 'half' },
        { key: 'line_type', layout: 'half' },
        { key: 'zone_name', layout: 'half' },
        { key: 'is_active', layout: 'half' },
        { key: 'capacity', layout: 'half' },
        { key: 'description', layout: 'full' }
      ]
    },
    {
      title: '扩展配置',
      weight: 'secondary',
      fields: [
        { key: 'sort_order', layout: 'half' }
      ]
    }
  ]
}

export function createWorkLinePageConfig(): WorklinePageConfig {
  return createCrudPageConfigFromResource<Workline, CreateWorklineInput, UpdateWorklineInput>({
    resource: WORKLINE_PAGE_RESOURCE,
    fieldConfig: workLinePageFieldConfig,
    table: WORKLINE_PAGE_TABLE,
    detail: WORKLINE_PAGE_DETAIL,
    features: WORKLINE_PAGE_FEATURES
  })
}
