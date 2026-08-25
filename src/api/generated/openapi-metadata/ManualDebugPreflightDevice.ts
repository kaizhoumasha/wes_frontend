/**
 * 自动生成的 OpenAPI schema 字段元数据: ManualDebugPreflightDevice
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ManualDebugPreflightDeviceMetadata = {
  "title": "ManualDebugPreflightDevice",
  "required": [
    "device",
    "state",
    "admissible",
    "rejection_code"
  ],
  "additionalProperties": false,
  "fields": {
    "admissible": {
      "title": "Admissible",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "device": {
      "required": true,
      "nullable": false,
      "ref": "EcsDeviceInfo"
    },
    "rejection_code": {
      "title": "Rejection Code",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "state": {
      "required": true,
      "nullable": false,
      "ref": "EcsDeviceRuntimeState"
    }
  }
} satisfies OpenApiSchemaMetadata
