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

interface WorklinePageActions {
  openRuntime: (workline: Workline) => void
  openTrace: (workline: Workline) => void
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
  defaultSort: [{ field: 'sort_order', order: 'asc' as const }]
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
    width: 600,
    title: workline => workline.line_name,
    showActions: true,
    actions: [
      {
        key: 'open-runtime',
        label: '运行看板',
        type: 'primary',
        icon: 'ep:monitor',
        onClick: workline => actions.openRuntime(workline),
      },
      {
        key: 'open-trace',
        label: '查看 TRACE',
        type: 'warning',
        icon: 'ep:connection',
        onClick: workline => actions.openTrace(workline),
      },
    ],
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
}

export function createWorkLinePageConfig(actions: WorklinePageActions): WorklinePageConfig {
  return createCrudPageConfigFromResource<Workline, CreateWorklineInput, UpdateWorklineInput>({
    resource: WORKLINE_PAGE_RESOURCE,
    fieldConfig: workLinePageFieldConfig,
    table: WORKLINE_PAGE_TABLE,
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
        },
        {
          key: 'open-trace',
          label: '查看 TRACE',
          type: 'warning',
          permission: BIZ_PERMISSIONS.workline.page,
          onClick: row => actions.openTrace(row),
        },
      ]
    }
  })
}
