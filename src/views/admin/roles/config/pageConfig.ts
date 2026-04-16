import type { CreateRolesInput, UpdateRolesInput, RolesItem } from '@/api/modules/roles'
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
import { rolesApiMethods } from '@/api/modules/roles'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageConfig, CrudPageFeatures } from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import { rolePageFieldConfig } from './fieldConfig'

type RolePageConfig = CrudPageConfig<RolesItem, CreateRolesInput, UpdateRolesInput>

const ROLE_PAGE_RESOURCE = {
  key: 'roles',
  title: {
    text: '角色管理',
    subtitle: '管理系统角色',
    icon: 'ep:collection-tag'
  },
  trashTitle: {
    text: '角色回收站',
    subtitle: '查看并恢复已删除角色',
    icon: 'ep:delete'
  },
  methods: rolesApiMethods,
  permissions: ADMIN_PERMISSIONS.role,
  optimisticUpdate: true,
  defaultSort: [{ field: 'updated_at', order: 'desc' as const }]
}

const ROLE_PAGE_TABLE: Partial<RolePageConfig['table']> = {
  actionsColumn: {
    width: 200
  }
}

const ROLE_PAGE_FEATURES: CrudPageFeatures = {
  trash: {
    enabled: true,
    label: '回收站'
  },
  create: {
    label: '新增角色',
    dialogTitle: '创建角色'
  },
  edit: {
    dialogTitle: '编辑角色'
  },
  restore: {
    label: '恢复角色'
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

const ROLE_PAGE_DETAIL: CrudPageDetailConfig<RolesItem> = {
  mode: 'drawer',
  width: 600,
  title: role => role.name,
  sections: [
    {
      title: '基本信息',
      weight: 'primary',
      fields: [
        { key: 'name', layout: 'full' },
        { key: 'description', layout: 'full' }
      ]
    }
  ]
}

export function createRolePageConfig(): RolePageConfig {
  return createCrudPageConfigFromResource<RolesItem, CreateRolesInput, UpdateRolesInput>({
    resource: ROLE_PAGE_RESOURCE,
    fieldConfig: rolePageFieldConfig,
    table: ROLE_PAGE_TABLE,
    detail: ROLE_PAGE_DETAIL,
    features: ROLE_PAGE_FEATURES
  })
}
