/**
 * API 应用字段配置
 */

import type {
  ApplicationsItem as APIApplication,
  CreateApplicationsInput as CreateAPIApplicationInput,
  UpdateApplicationsInput as UpdateAPIApplicationInput
} from '@/api/modules/applications'
import { APIApplicationCreateSchema, APIApplicationUpdateSchema } from '@/types/zod-extensions'
import {
  defineCrudResourceFieldBundle
} from '@/components/common/crud-page/resourceFieldBuilder'

const API_APPLICATION_FIELD_LABEL_OVERRIDES = {
  app_name: '应用名称',
  app_type: '应用类型',
  description: '描述',
  ip_whitelist: 'IP 白名单',
  rate_limit_per_minute: '每分钟限流',
  rate_limit_per_hour: '每小时限流',
  validity_period: '有效期',
  created_at: '创建时间',
  updated_at: '更新时间',
  is_deleted: '已删除',
  created_by: '创建人',
  updated_by: '更新人',
  deleted_by: '删除人',
  deleted_at: '删除时间'
} as const

export const API_APPLICATION_TABLE_STORAGE_KEY = 'wes-api-application-table-columns'

export const apiApplicationSearchConfig = {
  placeholder: '搜索应用名称...',
  quickPresets: [],
  favorites: []
}

export const apiApplicationFormConfig = {
  createSchema: APIApplicationCreateSchema,
  updateSchema: APIApplicationUpdateSchema
}

export const {
  fields: API_APPLICATION_FIELDS,
  fieldConfig: apiApplicationPageFieldConfig
} = defineCrudResourceFieldBundle<APIApplication, CreateAPIApplicationInput, UpdateAPIApplicationInput>({
  backend: {
    readSchema: 'APIApplicationResponse',
    createSchema: 'APIApplicationCreate',
    updateSchema: 'APIApplicationUpdate',
    labelOverrides: API_APPLICATION_FIELD_LABEL_OVERRIDES
  },
  fields: [
    {
      key: 'app_name',
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
      key: 'app_type',
      table: {
        visibleFrom: 'mobile',
        width: 120
      },
      form: {
        required: true
      },
      search: {}
    },
    {
      key: 'validity_period',
      table: {
        visibleFrom: 'mobile',
        width: 120
      },
      form: {
        required: true
      }
    },
    {
      key: 'rate_limit_per_minute',
      table: {
        visibleFrom: 'tablet',
        width: 140
      },
      form: {
        type: 'number'
      }
    },
    {
      key: 'rate_limit_per_hour',
      table: {
        visibleFrom: 'tablet',
        width: 140
      },
      form: {
        type: 'number'
      }
    },
    {
      key: 'ip_whitelist',
      table: {
        visibleFrom: 'desktop',
        width: 200
      },
      form: {
        type: 'textarea',
        placeholder: '每行一个 IP 地址，例如：\n192.168.1.1\n10.0.0.0/8',
        rows: 4
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
      key: 'is_deleted',
      table: {
        visibleFrom: 'mobile',
        width: 90
      }
    }
  ],
  storageKey: API_APPLICATION_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['app_name'],
  search: apiApplicationSearchConfig,
  form: apiApplicationFormConfig
})
