/**
 * 菜单字段配置
 */

import type {
  CreateMenusInput as CreateMenuInput,
  UpdateMenusInput as UpdateMenuInput,
  MenusItem as Menu
} from '@/api/modules/menus'
import {
  MenuCreateMetadata,
  MenuResponseMetadata,
  MenuUpdateMetadata
} from '@/api/generated/openapi-metadata'
import { MenuCreateSchema, MenuUpdateSchema } from '@/types/zod-extensions'
import {
  defineCrudResourceFieldBundle
} from '@/components/common/crud-page/resourceFieldBuilder'
import { h } from 'vue'
import AppIcon from '@/components/ui/AppIcon.vue'

const MENU_FIELD_LABEL_OVERRIDES = {
  name: '菜单标识',
  title: '菜单标题',
  path: '路由路径',
  component: '组件路径',
  icon: '图标',
  parent_id: '父菜单',
  level: '层级',
  tree_path: '树路径',
  sort_order: '排序号',
  is_hidden: '是否隐藏',
  created_at: '创建时间',
  updated_at: '更新时间'
} as const

export const MENU_TABLE_STORAGE_KEY = 'wes-menu-table-columns'

export const menuSearchConfig = {
  placeholder: '搜索菜单标识或标题...',
  quickPresets: [],
  favorites: []
}

export const menuFormConfig = {
  createSchema: MenuCreateSchema,
  updateSchema: MenuUpdateSchema
}

export const {
  fields: MENU_FIELDS,
  fieldConfig: menuPageFieldConfig
} = defineCrudResourceFieldBundle<Menu, CreateMenuInput, UpdateMenuInput>({
  backend: {
    readSchema: MenuResponseMetadata,
    createSchema: MenuCreateMetadata,
    updateSchema: MenuUpdateMetadata,
    labelOverrides: MENU_FIELD_LABEL_OVERRIDES
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
        required: true
      },
      search: {}
    },
    {
      key: 'title',
      table: {
        visibleFrom: 'mobile',
        fixed: 'left',
        reorderLocked: true,
        hideable: false,
        width: 150
      },
      form: {
        required: true
      },
      search: {}
    },
    {
      key: 'path',
      table: {
        visibleFrom: 'mobile',
        width: 200
      },
      form: {
        required: true
      },
      search: {}
    },
    {
      key: 'parent_id',
      table: {
        visibleFrom: null, // 完全隐藏（树形视图已展示层级关系）
        width: 120
      },
      form: {} // 使用系统默认的树形选择器
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
      key: 'icon',
      table: {
        visibleFrom: 'desktop',
        width: 120,
        formatter: (value) => {
          if (!value) return ''
          return h(AppIcon, { icon: value as string, size: 18 })
        }
      },
      form: {
        type: 'icon'
      }
    },
    {
      key: 'component',
      table: {
        visibleFrom: 'desktop',
        width: 200
      },
      form: {}
    },
    {
      key: 'is_hidden',
      table: {
        visibleFrom: 'mobile',
        width: 90
      },
      search: {
        dataType: 'boolean'
      }
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
  storageKey: MENU_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['name', 'title'],
  search: menuSearchConfig,
  form: menuFormConfig
})
