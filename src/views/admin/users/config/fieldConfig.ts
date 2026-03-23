/**
 * 用户列表字段配置
 *
 * 使用统一字段配置管理表格、表单与搜索，字段能力基线与后端契约对齐。
 */

import type { CreateUserInput, UpdateUserInput, User } from '@/api/modules/user'
import { UserCreateSchema, UserUpdateSchema } from '@/types/zod-extensions'
import {
  defineResourceFields,
  defineCrudFieldConfig
} from '@/components/common/crud-page/resourceFieldBuilder'
import {
  createArrayTagFormatter,
  createBooleanTagFormatter,
  createDateTimeFormatter
} from '@/components/common/table/formatters'
import type { SearchFieldDef } from '@/types/search'
import { USER_SEARCH_FAVORITES, USER_SEARCH_QUICK_PRESETS } from './searchPresets'

const BOOLEAN_SEARCH_OPTIONS = [
  { label: '是', value: true },
  { label: '否', value: false }
] satisfies NonNullable<SearchFieldDef['options']>

/**
 * 用户字段定义：
 * - 字段 key 与后端读写契约对齐
 * - table / form / search 分别表达独立能力
 * - 省略项由 helper 自动补默认值
 */
export const USER_FIELDS = defineResourceFields<User, CreateUserInput, UpdateUserInput>([
  {
    key: 'username',
    label: '用户名',
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
      placeholder: '请输入用户名（3-50 字符）',
      autocomplete: 'username'
    },
    search: {
      defaultOperator: 'contains',
      quickOps: ['contains', 'equals', 'startsWith'],
      placeholder: '请输入用户名'
    }
  },
  {
    key: 'email',
    label: '邮箱',
    table: {
      visibleFrom: 'mobile',
      minWidth: 180
    },
    form: {
      inputType: 'email',
      required: true,
      placeholder: '请输入邮箱地址',
      autocomplete: 'email'
    },
    search: {
      defaultOperator: 'contains',
      quickOps: ['contains', 'equals', 'startsWith'],
      placeholder: '请输入邮箱地址'
    }
  },
  {
    key: 'full_name',
    label: '姓名',
    table: {
      visibleFrom: 'tablet',
      width: 120
    },
    form: {
      required: false,
      placeholder: '请输入姓名（可选）'
    },
    search: {
      defaultOperator: 'contains',
      quickOps: ['contains', 'equals'],
      placeholder: '请输入姓名'
    }
  },
  {
    key: 'password',
    label: '密码',
    form: {
      type: 'password',
      modes: ['create'],
      required: true,
      placeholder: '请输入密码（6-100 字符）',
      autocomplete: 'new-password'
    }
  },
  {
    key: 'is_superuser',
    label: '超级用户',
    table: {
      width: 100,
      sortable: true,
      formatter: createBooleanTagFormatter({ trueType: 'danger', falseType: 'info' })
    },
    search: {
      dataType: 'boolean',
      defaultOperator: 'equals',
      quickOps: ['equals'],
      options: BOOLEAN_SEARCH_OPTIONS
    }
  },
  {
    key: 'is_multi_login',
    label: '多端登录',
    table: {
      width: 100,
      formatter: createBooleanTagFormatter({ trueType: 'success' })
    },
    search: {
      dataType: 'boolean',
      defaultOperator: 'equals',
      quickOps: ['equals'],
      options: BOOLEAN_SEARCH_OPTIONS
    }
  },
  {
    key: 'roles',
    label: '角色',
    table: {
      visibleFrom: 'mobile',
      width: 150,
      slots: { default: createArrayTagFormatter({ labelField: 'name', emptyLabel: '无角色' }) }
    }
  },
  {
    key: 'updated_at',
    label: '更新时间',
    table: {
      visibleFrom: 'tablet',
      width: 160,
      sortable: true,
      formatter: createDateTimeFormatter()
    }
  }
])

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

export const userPageFieldConfig = defineCrudFieldConfig<
  (typeof USER_FIELDS)[number],
  CreateUserInput,
  UpdateUserInput
>({
  fields: USER_FIELDS,
  storageKey: USER_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['username'],
  search: userSearchConfig,
  form: userFormConfig
})
