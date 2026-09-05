/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineConfigurationResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineConfigurationResponseMetadata = {
  "title": "WorkLineConfigurationResponse",
  "description": "业务插件配置全集保存结果。",
  "required": [
    "workline_id",
    "version",
    "plugin_key",
    "config",
    "device_codes"
  ],
  "fields": {
    "config": {
      "title": "Config",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "device_codes": {
      "title": "Device Codes",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "plugin_key": {
      "title": "Plugin Key",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
