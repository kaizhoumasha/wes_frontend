import type { CreateUserInput, UpdateUserInput } from '@/api/modules/user'
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
import { userApi, type User } from '@/api/modules/user'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageConfig, CrudPageFeatures } from '@/components/common/crud-page/types'
import { createUserRowActions } from './actionConfig'
import { userPageFieldConfig } from './fieldConfig'

type UserPageConfig = CrudPageConfig<User, CreateUserInput, UpdateUserInput>

const USER_PAGE_RESOURCE: UserPageConfig['resource'] = {
  key: 'users',
  title: {
    text: '用户管理',
    subtitle: '管理系统用户',
    icon: 'ep:user'
  },
  api: userApi,
  permissions: ADMIN_PERMISSIONS.user,
  optimisticUpdate: true,
  defaultSort: [{ field: 'updated_at', order: 'desc' }]
}

const USER_PAGE_TABLE: Partial<UserPageConfig['table']> = {
  actionsColumn: {
    width: 220
  }
}

const USER_PAGE_FEATURES: CrudPageFeatures = {
  create: {
    label: '新增用户',
    dialogTitle: '创建用户'
  },
  edit: {
    dialogTitle: '编辑用户'
  }
}

export function createUserPageConfig(): UserPageConfig {
  return createCrudPageConfigFromResource<User, CreateUserInput, UpdateUserInput>({
    resource: USER_PAGE_RESOURCE,
    fieldConfig: userPageFieldConfig,
    table: USER_PAGE_TABLE,
    features: USER_PAGE_FEATURES,
    extensions: {
      rowActions: createUserRowActions()
    },
  })
}
