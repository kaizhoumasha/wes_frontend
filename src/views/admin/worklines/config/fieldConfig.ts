/**
 * 作业线字段配置
 */

import type {
  CreateWorkLinesInput as CreateWorklineInput,
  UpdateWorkLinesInput as UpdateWorklineInput,
  WorkLinesItem as Workline
} from '@/api/modules/workLines'
import { WorkLineCreateSchema, WorkLineUpdateSchema } from '@/types/zod-extensions'
import {
  defineCrudResourceFieldBundle
} from '@/components/common/crud-page/resourceFieldBuilder'

const WORKLINE_FIELD_LABEL_OVERRIDES = {
  line_code: '作业线编码',
  line_name: '作业线名称',
  line_type: '作业线类型',
  zone_name: '区域名称',
  plugin_key: '插件标识',
  config: '配置参数',
  description: '描述',
  is_active: '是否激活',
  capacity: '容量',
  sort_order: '排序号',
  created_at: '创建时间',
  updated_at: '更新时间'
} as const

export const WORKLINE_TABLE_STORAGE_KEY = 'wes-workline-table-columns'

export const workLineSearchConfig = {
  placeholder: '搜索作业线编码或名称...',
  quickPresets: [],
  favorites: []
}

export const workLineFormConfig = {
  createSchema: WorkLineCreateSchema,
  updateSchema: WorkLineUpdateSchema
}

export const {
  fields: WORKLINE_FIELDS,
  fieldConfig: workLinePageFieldConfig
} = defineCrudResourceFieldBundle<Workline, CreateWorklineInput, UpdateWorklineInput>({
  backend: {
    readSchema: 'WorkLineResponse',
    createSchema: 'WorkLineCreate',
    updateSchema: 'WorkLineUpdate',
    labelOverrides: WORKLINE_FIELD_LABEL_OVERRIDES
  },
  fields: [
    {
      key: 'line_code',
      table: {
        visibleFrom: 'mobile',
        fixed: 'left',
        reorderLocked: true,
        hideable: false,
        width: 120
      },
      form: {
        required: true
      },
      search: {}
    },
    {
      key: 'line_name',
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
      key: 'line_type',
      table: {
        visibleFrom: 'mobile',
        width: 120
      },
      form: {
        required: true,
        type: 'select'
      },
      search: {
        dataType: 'enum'
      }
    },
    {
      key: 'zone_name',
      table: {
        visibleFrom: 'tablet',
        width: 120
      },
      form: {},
      search: {}
    },
    {
      key: 'is_active',
      table: {
        visibleFrom: 'mobile',
        width: 90
      },
      search: {
        dataType: 'boolean'
      }
    },
    {
      key: 'capacity',
      table: {
        visibleFrom: 'tablet',
        width: 100
      },
      form: {
        type: 'number'
      }
    },
    {
      key: 'description',
      table: {
        visibleFrom: 'desktop',
        minWidth: 200
      },
      form: {
        type: 'textarea'
      }
    },
    {
      key: 'sort_order',
      table: {
        visibleFrom: 'desktop',
        width: 90
      },
      form: {
        type: 'number'
      }
    }
  ],
  storageKey: WORKLINE_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['line_code', 'line_name'],
  search: workLineSearchConfig,
  form: workLineFormConfig
})
