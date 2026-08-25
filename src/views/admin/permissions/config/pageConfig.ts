import type { PermissionsItem as Permission, ReadonlyInput } from '@/api/modules/permissions'
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
import { permissionsApiMethods } from '@/api/modules/permissions'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type {
  CrudPageConfig,
  CrudPageFeatures,
  CrudPagePermissionConfig
} from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import { permissionPageFieldConfig } from './fieldConfig'

type PermissionPageConfig = CrudPageConfig<Permission, ReadonlyInput, ReadonlyInput>

const PERMISSION_PAGE_PERMISSIONS = {
  page: ADMIN_PERMISSIONS.permission.page,
  list: ADMIN_PERMISSIONS.permission.list,
  detail: ADMIN_PERMISSIONS.permission.detail,
  tree: ADMIN_PERMISSIONS.permission.tree
} satisfies CrudPagePermissionConfig

const PERMISSION_PAGE_RESOURCE = {
  key: 'permissions',
  title: {
    text: '权限管理',
    subtitle: '查看后端路由生成的 API 权限目录',
    icon: 'ep:lock'
  },
  trashTitle: {
    text: '权限回收站',
    subtitle: '查看并恢复已删除权限',
    icon: 'ep:delete'
  },
  methods: permissionsApiMethods,
  permissions: PERMISSION_PAGE_PERMISSIONS,
  optimisticUpdate: true,
  defaultSort: [{ field: 'sort_order', order: 'asc' as const }],
  // 启用树形模式（非懒加载，后端一次返回完整树）
  treeMode: {
    enabled: true,
    childrenKey: 'children',
    hasChildrenKey: 'has_children',
    lazyLoad: false,
    initialExpandLevel: 1,
    displayField: 'name'
  }
}

const PERMISSION_PAGE_TABLE: Partial<PermissionPageConfig['table']> = {
  actionsColumn: {
    width: 200
  }
}

const PERMISSION_PAGE_FEATURES: CrudPageFeatures = {
  create: false,
  edit: false,
  delete: false,
  batchDelete: false,
  trash: false,
  restore: false,
  batchRestore: false,
  permanentDelete: false,
  batchPermanentDelete: false,
  move: false,
  sort: false,
  createChild: false
}

const PERMISSION_PAGE_DETAIL: CrudPageDetailConfig<Permission> = {
  mode: 'drawer',
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
    }
  ]
}

export function createPermissionPageConfig(): PermissionPageConfig {
  return createCrudPageConfigFromResource<Permission, ReadonlyInput, ReadonlyInput>({
    resource: PERMISSION_PAGE_RESOURCE,
    fieldConfig: permissionPageFieldConfig,
    table: PERMISSION_PAGE_TABLE,
    detail: PERMISSION_PAGE_DETAIL,
    features: PERMISSION_PAGE_FEATURES
  })
}
