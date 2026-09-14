/**
 * 自动生成的 OpenAPI schema 字段元数据: BinInboundBatchData
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinInboundBatchDataMetadata = {
  "title": "BinInboundBatchData",
  "required": [
    "task_id",
    "rack_id",
    "rack_face"
  ],
  "fields": {
    "rack_face": {
      "title": "Rack Face",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 10
    },
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "task_id": {
      "title": "Task Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
