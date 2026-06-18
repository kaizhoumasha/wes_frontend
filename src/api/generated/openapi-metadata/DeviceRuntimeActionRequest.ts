/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceRuntimeActionRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceRuntimeActionRequestMetadata = {
  "title": "DeviceRuntimeActionRequest",
  "description": "设备运行态空操作请求，保留扩展位。",
  "required": [],
  "fields": {
    "reason": {
      "title": "Reason",
      "description": "操作原因",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    }
  }
} satisfies OpenApiSchemaMetadata
