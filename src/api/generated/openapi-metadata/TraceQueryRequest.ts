/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceQueryRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceQueryRequestMetadata = {
  "title": "TraceQueryRequest",
  "description": "Trace 列表查询请求。",
  "required": [],
  "fields": {
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "device_id": {
      "title": "Device Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "step_code": {
      "title": "Step Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "keyword": {
      "title": "Keyword",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "only_active": {
      "title": "Only Active",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "only_failed": {
      "title": "Only Failed",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "limit": {
      "title": "Limit",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 20,
      "minimum": 1,
      "maximum": 100
    },
    "offset": {
      "title": "Offset",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0,
      "minimum": 0
    }
  }
} satisfies OpenApiSchemaMetadata
