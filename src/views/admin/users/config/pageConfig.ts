import type {
  CreateUsersInput as CreateUserInput,
  UpdateUsersInput as UpdateUserInput
} from '@/api/modules/users'
import { ADMIN_PERMISSIONS } from '@/api/generated/permissions'
import { type UsersItem as User, usersApiMethods } from '@/api/modules/users'
import { createCrudPageConfigFromResource } from '@/components/common/crud-page/createCrudPageConfigFromResource'
import type { CrudPageConfig, CrudPageFeatures } from '@/components/common/crud-page/types'
import type { CrudPageDetailConfig } from '@/components/common/crud-page/detail/types'
import { createUserRowActions } from './actionConfig'
import { userPageFieldConfig } from './fieldConfig'

type UserPageConfig = CrudPageConfig<User, CreateUserInput, UpdateUserInput>

const USER_PAGE_RESOURCE = {
  key: 'users',
  title: {
    text: '用户管理',
    subtitle: '管理系统用户',
    icon: 'ep:user'
  },
  trashTitle: {
    text: '用户回收站',
    subtitle: '查看并恢复已删除用户',
    icon: 'ep:delete'
  },
  methods: usersApiMethods,
  permissions: ADMIN_PERMISSIONS.user,
  optimisticUpdate: true,
  defaultSort: [{ field: 'updated_at', order: 'desc' as const }]
}

const USER_PAGE_TABLE: Partial<UserPageConfig['table']> = {
  actionsColumn: {
    width: 260
  }
}

const USER_PAGE_FEATURES: CrudPageFeatures = {
  trash: {
    enabled: true,
    label: '回收站'
  },
  create: {
    label: '新增用户',
    dialogTitle: '创建用户'
  },
  edit: {
    dialogTitle: '编辑用户'
  },
  restore: {
    label: '恢复用户'
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

const USER_PAGE_DETAIL: CrudPageDetailConfig<User> = {
  mode: 'drawer',
  title: user => user.username,
  sections: [
    {
      title: '基本信息',
      weight: 'primary',
      fields: [
        { key: 'username', layout: 'half' },
        { key: 'full_name', layout: 'half' },
        { key: 'email', layout: 'full' },
        { key: 'is_superuser', formatter: 'boolean', layout: 'half' },
        { key: 'is_multi_login', formatter: 'boolean', layout: 'half' }
      ]
    },
    {
      title: '角色信息',
      weight: 'secondary',
      relation: {
        type: 'tags',
        data: user => user.roles ?? [],
        emptyText: '无角色'
      }
    },
    {
      title: '审计信息',
      weight: 'tertiary',
      fields: [
        { key: 'created_at', formatter: 'datetime' },
        { key: 'updated_at', formatter: 'datetime' }
      ]
    }
  ]
}

export function createUserPageConfig(
  openAssignRolesDialog: (user: User) => void,
  openResetPasswordDialog: (user: User) => void
): UserPageConfig {
  return createCrudPageConfigFromResource<User, CreateUserInput, UpdateUserInput>({
    resource: USER_PAGE_RESOURCE,
    fieldConfig: userPageFieldConfig,
    table: USER_PAGE_TABLE,
    detail: USER_PAGE_DETAIL,
    features: USER_PAGE_FEATURES,
    extensions: {
      rowActions: createUserRowActions(openAssignRolesDialog, openResetPasswordDialog)
    }
  })
}
