/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineStartResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineStartResponseMetadata = {
  "title": "WorkLineStartResponse",
  "required": [
    "workline_id",
    "version",
    "plugin_key",
    "plugin_version",
    "flow_mode",
    "is_active"
  ],
  "fields": {
    "flow_mode": {
      "title": "Flow Mode",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "is_active": {
      "title": "Is Active",
      "type": "boolean",
      "required": true,
      "nullable": false
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
