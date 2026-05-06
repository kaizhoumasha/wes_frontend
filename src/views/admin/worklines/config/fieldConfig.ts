/**
 * 作业线字段配置
 */

import type {
  CreateWorkLinesInput as CreateWorklineInput,
  UpdateWorkLinesInput as UpdateWorklineInput,
  WorkLinesItem as Workline
} from '@/api/modules/workLines'
import type { OptionsResult as WorklinePluginOptionsResult } from '@/api/modules/workline'
import type { FormFieldConfig } from '@/composables/useTableColumns'
import { WorkLineCreateSchema, WorkLineUpdateSchema } from '@/types/zod-extensions'
import {
  defineCrudResourceFieldBundle
} from '@/components/common/crud-page/resourceFieldBuilder'
import {
  createBooleanTagFormatter,
  createStatusTagFormatter
} from '@/components/common/table/formatters'

const WORKLINE_FIELD_LABEL_OVERRIDES = {
  line_code: '作业线编码',
  line_name: '作业线名称',
  line_type: '作业线类型',
  zone_name: '区域名称',
  plugin_key: '插件标识',
  contract_version: '契约版本',
  config: '配置参数',
  run_mode: '运行模式',
  description: '描述',
  is_active: '是否激活',
  created_at: '创建时间',
  updated_at: '更新时间'
} as const

const LINE_TYPE_OPTIONS = [
  { label: '自动线', value: 'AUTO' },
  { label: '人工线', value: 'MANUAL' },
  { label: '混合线', value: 'HYBRID' }
]

const RUN_MODE_OPTIONS = [
  { label: '自动运行', value: 'AUTO' },
  { label: '人工确认', value: 'MANUAL' },
  { label: '沙箱模拟', value: 'SIMULATION' }
]

type WorklinePluginOption = WorklinePluginOptionsResult[number]

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
        width: 100,
        formatter: createStatusTagFormatter({
          AUTO: { label: '自动线', type: 'primary' },
          MANUAL: { label: '人工线', type: 'warning' },
          HYBRID: { label: '混合线', type: 'success' }
        })
      },
      form: {
        required: true,
        type: 'select',
        options: LINE_TYPE_OPTIONS
      },
      search: {
        dataType: 'enum',
        options: LINE_TYPE_OPTIONS
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
        width: 90,
        formatter: createBooleanTagFormatter({
          trueLabel: '激活',
          falseLabel: '停用',
          trueType: 'success',
          falseType: 'info'
        })
      },
      form: {
        type: 'switch'
      },
      search: {
        dataType: 'boolean'
      }
    },
    {
      key: 'run_mode',
      table: {
        visibleFrom: 'tablet',
        width: 110,
        formatter: createStatusTagFormatter({
          AUTO: { label: '自动运行', type: 'primary' },
          MANUAL: { label: '人工确认', type: 'warning' },
          SIMULATION: { label: '沙箱模拟', type: 'info' }
        })
      },
      form: {
        type: 'select',
        options: RUN_MODE_OPTIONS
      },
      search: {
        dataType: 'enum',
        options: RUN_MODE_OPTIONS
      }
    },
    {
      key: 'plugin_key',
      table: {
        visibleFrom: 'desktop',
        width: 160
      },
      form: {
        type: 'select',
        options: []
      }
    },
    {
      key: 'contract_version',
      form: {}
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
    }
  ],
  storageKey: WORKLINE_TABLE_STORAGE_KEY,
  reorderLockedKeys: ['line_code', 'line_name'],
  search: workLineSearchConfig,
  form: workLineFormConfig
})

export function createWorkLineFormFieldConfig(
  pluginOptions: readonly WorklinePluginOption[] = []
): FormFieldConfig[] {
  const pluginSelectOptions = pluginOptions.flatMap(option => {
    if (!option.plugin_key) {
      return []
    }

    const contractVersion = option.default_contract_version
    const label = contractVersion
      ? `${option.label || option.plugin_key} / ${contractVersion}`
      : option.label || option.plugin_key

    return [{
      label,
      value: option.plugin_key
    }]
  })

  return workLinePageFieldConfig.form.fieldConfig.flatMap(field => {
    if (field.key === 'plugin_key') {
      return [{
        ...field,
        type: 'select',
        options: pluginSelectOptions
      }]
    }

    if (field.key === 'contract_version') {
      return []
    }

    return [{ ...field }]
  })
}
