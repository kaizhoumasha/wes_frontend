/**
 * 自动生成的 OpenAPI schema 字段元数据: _EcsTestDefaultResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _EcsTestDefaultResponseMetadata = {
  "title": "_EcsTestDefaultResponse",
  "required": [
    "device_id",
    "device_code",
    "device_version",
    "default"
  ],
  "fields": {
    "default": {
      "required": true,
      "nullable": true,
      "ref": "_EcsTestDefaultRule"
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "device_id": {
      "title": "Device Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "device_version": {
      "title": "Device Version",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
