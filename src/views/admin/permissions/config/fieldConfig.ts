/**
 * 权限字段配置
 */

import type {
  CreatePermissionsInput as CreatePermissionInput,
  UpdatePermissionsInput as UpdatePermissionInput,
  PermissionsItem as Permission
} from '@/api/modules/permissions'
import { PermissionCreateSchema, PermissionUpdateSchema } from '@/types/zod-extensions'
import {
  defineCrudResourceFieldBundle
} from '@/components/common/crud-page/resourceFieldBuilder'

const PERMISSION_FIELD_LABEL_OVERRIDES = {
  name: '权限标识',
  description: '权限描述',
  type: '权限类型',
  category: '权限分类',
  resource: '资源类型',
  action: '操作类型',
  method: 'HTTP方法',
  path: 'API路径',
  parent_id: '父权限',
  level: '层级',
  tree_path: '树路径',
  sort_order: '排序号',
  has_children: '是否有子节点',
  created_at: '创建时间',
  updated_at: '更新时间'
} as const

export const PERMISSION_TABLE_STORAGE_KEY = 'wes-permission-table-columns'

export const permissionSearchConfig = {
  placeholder: '搜索权限标识或描述...',
  quickPresets: [],
  favorites: []
}

export const permissionFormConfig = {
  createSchema: PermissionCreateSchema,
  updateSchema: PermissionUpdateSchema
}

export const {
  fields: PERMISSION_FIELDS,
  fieldConfig: permissionPageFieldConfig
} = defineCrudResourceFieldBundle<Permission, CreatePermissionInput, UpdatePermissionInput>({
  backend: {
    readSchema: 'PermissionResponse',
    createSchema: 'PermissionCreate',
    updateSchema: 'PermissionUpdate',
    labelOverrides: PERMISSION_FIELD_LABEL_OVERRIDES
  },
  fields: [
    {
      key: 'name',
      table: {
        visibleFrom: 'mobile',
        fixed: 'left',
        reorderLocked: true,
        hideable: false,
        width: 180
      },
      form: {
        required: true
      },
      search: {}
    },
    {
      key: 'description',
      table: {
        visibleFrom: 'mobile',
        width: 200
      },
      form: {},
      search: {}
    },
    {
      key: 'type',
      table: {
        visibleFrom: 'tablet',
        width: 100
      },
      form: {},
      search: {
        dataType: 'text'
      }
    },
    {
      key: 'category',
      table: {
        visibleFrom: 'tablet',
        width: 100
      },
      form: {},
      search: {
        dataType: 'text'
      }
    },
    {
      key: 'resource',
      table: {
        visibleFrom: 'tablet',
        width: 120
      },
      form: {},
      search: {
        dataType: 'text'
      }
    },
    {
      key: 'action',
      table: {
        visibleFrom: 'tablet',
        width: 100
      },
      form: {},
      search: {
        dataType: 'text'
      }
    },
    {
      key: 'method',
      table: {
        visibleFrom: 'desktop',
        width: 80
      },
      form: {}
    },
    {
      key: 'path',
      table: {
        visibleFrom: 'desktop',
        width: 200
      },
      form: {}
    },
    {
      key: 'parent_id',
      table: {
        visibleFrom: null, // 完全隐藏（树形视图已展示层级关系）
        width: 120
      },
      form: {
        type: 'number'
      },
      search: {
        dataType: 'number'
      }
    },
    {
      key: 'level',
      table: {
        visibleFrom: null, // 完全隐藏（树形缩进已展示层级）
        width: 80
      }
      // form: 隐藏，由后端根据 parent_id 自动计算
    },
    {
      key: 'sort_order',
      table: {
        visibleFrom: null, // 完全隐藏（列表顺序已展示排序）
        width: 90
      }
      // form: 隐藏，通过拖拽排序功能调整
    },
    {
      key: 'tree_path',
      table: {
        visibleFrom: null, // 完全隐藏（ID 路径对用户无意义）
        width: 200
      }
      // form: 隐藏，由后端自动生成
    }
  ],
  storageKey: PERMISSION_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['name', 'description'],
  search: permissionSearchConfig,
  form: permissionFormConfig
})