/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLinePluginOption
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLinePluginOptionMetadata = {
  "title": "WorkLinePluginOption",
  "description": "作业线插件下拉选项。",
  "required": [
    "plugin_key",
    "label",
    "default_contract_version"
  ],
  "fields": {
    "plugin_key": {
      "title": "Plugin Key",
      "description": "工作线执行插件标识",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "label": {
      "title": "Label",
      "description": "插件显示文本",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "contract_versions": {
      "title": "Contract Versions",
      "description": "可选契约版本",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "default_contract_version": {
      "title": "Default Contract Version",
      "description": "默认契约版本",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
