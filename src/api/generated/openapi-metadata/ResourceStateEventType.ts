/**
 * 自动生成的 OpenAPI schema 字段元数据: ResourceStateEventType
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResourceStateEventTypeMetadata = {
  "title": "ResourceStateEventType",
  "description": "资源事实事件类型。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "ResourceStateEventType",
      "description": "资源事实事件类型。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK_ARRIVED",
        "RACK_DEPARTED",
        "BIN_ARRIVED",
        "BIN_DEPARTED",
        "BIN_MOUNTED",
        "BIN_UNMOUNTED",
        "MATERIAL_MOUNTED",
        "MATERIAL_UNMOUNTED",
        "EXCHANGE_STATUS_UPDATED",
        "RESOURCE_RECONCILED"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
