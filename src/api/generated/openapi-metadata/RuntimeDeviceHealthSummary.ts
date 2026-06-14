/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeDeviceHealthSummary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeDeviceHealthSummaryMetadata = {
  "title": "RuntimeDeviceHealthSummary",
  "required": [],
  "fields": {
    "total": {
      "title": "Total",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "abnormal": {
      "title": "Abnormal",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "maintenance": {
      "title": "Maintenance",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "loaded": {
      "title": "Loaded",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "healthy": {
      "title": "Healthy",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    }
  }
} satisfies OpenApiSchemaMetadata
