/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneWorkLineIdentityV2
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneWorkLineIdentityV2Metadata = {
  "title": "PlaneWorkLineIdentityV2",
  "description": "Scene v2 的 WorkLine 静态身份切片；不包含 config 等敏感字段。",
  "required": [
    "id",
    "version",
    "line_code",
    "line_name",
    "line_type",
    "is_active",
    "run_mode"
  ],
  "additionalProperties": false,
  "fields": {
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "is_active": {
      "title": "Is Active",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "line_code": {
      "title": "Line Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "line_name": {
      "title": "Line Name",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "line_type": {
      "title": "Line Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "plugin_display_name": {
      "title": "Plugin Display Name",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "plugin_key": {
      "title": "Plugin Key",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "plugin_version": {
      "title": "Plugin Version",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "run_mode": {
      "title": "Run Mode",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
