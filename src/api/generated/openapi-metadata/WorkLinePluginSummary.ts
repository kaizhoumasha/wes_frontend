/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLinePluginSummary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLinePluginSummaryMetadata = {
  "title": "WorkLinePluginSummary",
  "description": "部署清单中的业务插件及当前 WorkLine 兼容性。",
  "required": [
    "plugin_key",
    "plugin_version",
    "display_name",
    "supported_line_types",
    "compatible"
  ],
  "fields": {
    "compatible": {
      "title": "Compatible",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "device_roles": {
      "title": "Device Roles",
      "type": "array",
      "required": false,
      "nullable": false,
      "default": [],
      "items": {
        "ref": "WorkLineDeviceRole"
      }
    },
    "display_name": {
      "title": "Display Name",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "incompatibility_reasons": {
      "title": "Incompatibility Reasons",
      "type": "array",
      "required": false,
      "nullable": false,
      "default": [],
      "items": {
        "type": "string"
      }
    },
    "plugin_key": {
      "title": "Plugin Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "plugin_version": {
      "title": "Plugin Version",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "supported_line_types": {
      "title": "Supported Line Types",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "LineType",
        "enum": [
          "AUTO",
          "MANUAL",
          "HYBRID"
        ]
      }
    }
  }
} satisfies OpenApiSchemaMetadata
