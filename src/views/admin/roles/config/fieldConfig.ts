/**
 * 角色列表字段配置
 *
 * 使用统一字段配置管理表格、表单与搜索，字段能力基线与后端契约对齐。
 */

import type { CreateRolesInput, UpdateRolesInput, RolesItem } from '@/api/modules/roles'
import { RoleCreateSchema, RoleUpdateSchema } from '@/types/zod-extensions'
import {
  defineCrudResourceFieldBundle
} from '@/components/common/crud-page/resourceFieldBuilder'

const ROLE_FIELD_LABEL_OVERRIDES = {
  name: '角色名称',
  description: '描述',
  created_at: '创建时间',
  updated_at: '更新时间'
} as const

export const ROLE_TABLE_STORAGE_KEY = 'wes-role-table-columns'

export const roleSearchConfig = {
  placeholder: '搜索角色名称...',
  quickPresets: [],
  favorites: []
}

export const roleFormConfig = {
  createSchema: RoleCreateSchema,
  updateSchema: RoleUpdateSchema
}

/**
 * 角色字段定义：
 * - `backend` 描述后端字段事实来源
 * - `fields` 仅描述前端 UI 投影差异
 */
export const {
  fields: ROLE_FIELDS,
  fieldConfig: rolePageFieldConfig
} = defineCrudResourceFieldBundle<RolesItem, CreateRolesInput, UpdateRolesInput>({
  backend: {
    readSchema: 'RoleResponse',
    createSchema: 'RoleCreate',
    updateSchema: 'RoleUpdate',
    labelOverrides: ROLE_FIELD_LABEL_OVERRIDES
  },
  fields: [
    {
      key: 'name',
      table: {
        visibleFrom: 'mobile',
        fixed: 'left',
        reorderLocked: true,
        hideable: false,
        width: 150
      },
      form: {
        readonly: true,
        required: true
      },
      search: {}
    },
    {
      key: 'description',
      table: {
        visibleFrom: 'mobile',
        minWidth: 200
      },
      form: {
        required: false,
        type: 'textarea'
      },
      search: {}
    }
  ],
  storageKey: ROLE_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['name'],
  search: roleSearchConfig,
  form: roleFormConfig
})
