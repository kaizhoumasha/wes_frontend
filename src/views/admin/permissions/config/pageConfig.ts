import type {
  CreatePermissionsInput as CreatePermissionInput,
  UpdatePermissionsInput as UpdatePermissionInput,
  PermissionsItem as Permission
} from '@/api/modules/permissions'
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
import { permissionsApi } from '@/api/modules/permissions'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageConfig, CrudPageFeatures } from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import { permissionPageFieldConfig } from './fieldConfig'

type PermissionPageConfig = CrudPageConfig<Permission, CreatePermissionInput, UpdatePermissionInput>

const PERMISSION_PAGE_RESOURCE: PermissionPageConfig['resource'] = {
  key: 'permissions',
  title: {
    text: '权限管理',
    subtitle: '管理系统权限和API访问控制',
    icon: 'ep:lock'
  },
  trashTitle: {
    text: '权限回收站',
    subtitle: '查看并恢复已删除权限',
    icon: 'ep:delete'
  },
  api: permissionsApi,
  permissions: ADMIN_PERMISSIONS.permission,
  optimisticUpdate: true,
  defaultSort: [{ field: 'sort_order', order: 'asc' }],
  // 启用树形模式
  treeMode: {
    enabled: true,
    childrenKey: 'children',
    hasChildrenKey: 'has_children',
    lazyLoad: true,
    initialExpandLevel: 1
  }
}

const PERMISSION_PAGE_TABLE: Partial<PermissionPageConfig['table']> = {
  actionsColumn: {
    width: 200
  }
}

const PERMISSION_PAGE_FEATURES: CrudPageFeatures = {
  trash: {
    enabled: true,
    label: '回收站'
  },
  create: {
    label: '新增权限',
    dialogTitle: '创建权限'
  },
  edit: {
    dialogTitle: '编辑权限'
  },
  restore: {
    label: '恢复权限'
  },
  batchRestore: {
    label: '批量恢复'
  },
  permanentDelete: {
    label: '彻底删除'
  },
  batchPermanentDelete: {
    label: '批量彻底删除'
  },
  sort: {
    enabled: true,
    label: '排序',
    icon: 'lucide:arrow-down-up'
  }
}

const PERMISSION_PAGE_DETAIL: CrudPageDetailConfig<Permission> = {
  mode: 'drawer',
  width: 600,
  title: permission => permission.name,
  sections: [
    {
      title: '基本信息',
      weight: 'primary',
      fields: [
        { key: 'name', layout: 'half' },
        { key: 'description', layout: 'half' },
        { key: 'type', layout: 'half' },
        { key: 'category', layout: 'half' },
        { key: 'resource', layout: 'half' },
        { key: 'action', layout: 'half' }
      ]
    },
    {
      title: 'API配置',
      weight: 'secondary',
      fields: [
        { key: 'method', layout: 'half' },
        { key: 'path', layout: 'full' }
      ]
    },
    {
      title: '层级结构',
      weight: 'secondary',
      fields: [
        { key: 'parent_id', layout: 'half' },
        { key: 'level', layout: 'half' },
        { key: 'sort_order', layout: 'half' },
        { key: 'tree_path', layout: 'half' }
      ]
    }
  ]
}

export function createPermissionPageConfig(): PermissionPageConfig {
  return createCrudPageConfigFromResource<Permission, CreatePermissionInput, UpdatePermissionInput>({
    resource: PERMISSION_PAGE_RESOURCE,
    fieldConfig: permissionPageFieldConfig,
    table: PERMISSION_PAGE_TABLE,
    detail: PERMISSION_PAGE_DETAIL,
    features: PERMISSION_PAGE_FEATURES
  })
}