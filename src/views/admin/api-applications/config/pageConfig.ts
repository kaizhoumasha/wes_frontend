/**
 * API 应用页面配置
 */

import type {
  ApplicationsItem as APIApplication,
  CreateApplicationsInput as CreateAPIApplicationInput,
  UpdateApplicationsInput as UpdateAPIApplicationInput
} from '@/api/modules/applications'
import { API_AUTH_PERMISSIONS } from '@/api/generated/permissions'
import { applicationsApiMethods } from '@/api/modules/applications'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageConfig, CrudPageFeatures } from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import { apiApplicationPageFieldConfig } from './fieldConfig'
import { createAPIApplicationRowActions } from './actionConfig'

type APIApplicationPageConfig = CrudPageConfig<APIApplication, CreateAPIApplicationInput, UpdateAPIApplicationInput>

const API_APPLICATION_PAGE_RESOURCE = {
  key: 'api-applications',
  title: {
    text: 'API 应用管理',
    subtitle: '管理第三方系统接入的 API 应用',
    icon: 'ep:key'
  },
  trashTitle: {
    text: 'API 应用回收站',
    subtitle: '查看并恢复已删除的 API 应用',
    icon: 'ep:delete'
  },
  methods: applicationsApiMethods,
  permissions: API_AUTH_PERMISSIONS.apiApplication,
  optimisticUpdate: true,
  defaultSort: [{ field: 'created_at', order: 'desc' as const }]
}

const API_APPLICATION_PAGE_TABLE: Partial<APIApplicationPageConfig['table']> = {
  actionsColumn: {
    width: 240
  }
}

const API_APPLICATION_PAGE_FEATURES: CrudPageFeatures = {
  trash: {
    enabled: true,
    label: '回收站'
  },
  create: {
    label: '新增应用',
    dialogTitle: '创建 API 应用'
  },
  edit: {
    dialogTitle: '编辑 API 应用'
  },
  restore: {
    label: '恢复应用'
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

const API_APPLICATION_PAGE_DETAIL: CrudPageDetailConfig<APIApplication> = {
  mode: 'drawer',
  title: (app: APIApplication) => app.app_name || '未命名应用',
  sections: [
    {
      title: '基本信息',
      weight: 'primary',
      fields: [
        { key: 'app_id', layout: 'full' },
        { key: 'app_name', layout: 'full' },
        { key: 'app_type', layout: 'half' },
        { key: 'validity_period', layout: 'half' },
        { key: 'description', layout: 'full' }
      ]
    },
    {
      title: '限流配置',
      weight: 'secondary',
      fields: [
        { key: 'rate_limit_per_minute', layout: 'half' },
        { key: 'rate_limit_per_hour', layout: 'half' }
      ]
    },
    {
      title: '安全配置',
      weight: 'secondary',
      fields: [
        { key: 'ip_whitelist', layout: 'full' }
      ]
    }
  ]
}

export function createAPIApplicationPageConfig(
  openResetSecretDialog: (app: APIApplication) => void
): APIApplicationPageConfig {
  const rowActions = createAPIApplicationRowActions(openResetSecretDialog)

  return createCrudPageConfigFromResource<APIApplication, CreateAPIApplicationInput, UpdateAPIApplicationInput>({
    resource: API_APPLICATION_PAGE_RESOURCE,
    fieldConfig: apiApplicationPageFieldConfig,
    table: API_APPLICATION_PAGE_TABLE,
    detail: API_APPLICATION_PAGE_DETAIL,
    features: API_APPLICATION_PAGE_FEATURES,
    extensions: {
      rowActions
    }
  })
}
