/**
 * 用户列表字段配置
 *
 * 使用统一字段配置管理表格、表单与搜索，字段能力基线与后端契约对齐。
 */

import type {
  CreateUsersInput as CreateUserInput,
  UpdateUsersInput as UpdateUserInput,
  UsersItem as User
} from '@/api/modules/users'
import {
  UserCreateMetadata,
  UserResponseMetadata,
  UserUpdateMetadata
} from '@/api/generated/openapi-metadata'
import { UserCreateSchema, UserUpdateSchema } from '@/types/zod-extensions'
import {
  defineCrudResourceFieldBundle
} from '@/components/common/crud-page/resourceFieldBuilder'
import {
  createArrayTagFormatter,
  createBooleanTagFormatter
} from '@/components/common/table/formatters'
import { USER_SEARCH_FAVORITES, USER_SEARCH_QUICK_PRESETS } from './searchPresets'

const USER_FIELD_LABEL_OVERRIDES = {
  password: '密码',
  is_superuser: '超级用户',
  is_multi_login: '多端登录',
  roles: '角色',
  created_at: '创建时间',
  updated_at: '更新时间'
} as const

export const USER_TABLE_STORAGE_KEY = 'wes-user-table-columns'

export const userSearchConfig = {
  placeholder: '搜索用户名、邮箱...',
  quickPresets: USER_SEARCH_QUICK_PRESETS,
  favorites: USER_SEARCH_FAVORITES
}

export const userFormConfig = {
  createSchema: UserCreateSchema,
  updateSchema: UserUpdateSchema
}

/**
 * 用户字段定义：
 * - `backend` 描述后端字段事实来源
 * - `fields` 仅描述前端 UI 投影差异
 */
export const {
  fields: USER_FIELDS,
  fieldConfig: userPageFieldConfig
} = defineCrudResourceFieldBundle<User, CreateUserInput, UpdateUserInput>({
  backend: {
    readSchema: UserResponseMetadata,
    createSchema: UserCreateMetadata,
    updateSchema: UserUpdateMetadata,
    labelOverrides: USER_FIELD_LABEL_OVERRIDES
  },
  fields: [
    {
      key: 'username',
      table: {
        visibleFrom: 'mobile',
        fixed: 'left',
        reorderLocked: true,
        hideable: false,
        width: 120
      },
      form: {
        readonly: true,
        required: true,
        autocomplete: 'username'
      },
      search: {}
    },
    {
      key: 'email',
      table: {
        visibleFrom: 'mobile',
        minWidth: 180
      },
      form: {
        required: true,
        autocomplete: 'email'
      },
      search: {}
    },
    {
      key: 'full_name',
      table: {
        visibleFrom: 'tablet',
        width: 120
      },
      form: {
        required: false
      },
      search: {}
    },
    {
      key: 'password',
      form: {
        type: 'password',
        modes: ['create'],
        required: true,
        autocomplete: 'new-password'
      }
    },
    {
      key: 'is_superuser',
      table: {
        width: 100,
        sortable: true,
        formatter: createBooleanTagFormatter({ trueType: 'danger', falseType: 'info' })
      },
      search: {}
    },
    {
      key: 'is_multi_login',
      table: {
        width: 100,
        formatter: createBooleanTagFormatter({ trueType: 'success' })
      },
      search: {}
    },
    {
      key: 'roles',
      table: {
        visibleFrom: 'mobile',
        width: 150,
        slots: { default: createArrayTagFormatter({ labelField: 'name', emptyLabel: '无角色' }) }
      }
    },
    {
      key: 'created_at'
    },
    {
      key: 'updated_at',
      table: {
        visibleFrom: 'tablet',
        width: 160,
        sortable: true
      }
    }
  ],
  storageKey: USER_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['username'],
  search: userSearchConfig,
  form: userFormConfig
})
