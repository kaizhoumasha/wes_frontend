/**
 * 自动生成的 OpenAPI schema 字段元数据: RackDepartureData
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackDepartureDataMetadata = {
  "title": "RackDepartureData",
  "required": [
    "task_id",
    "rack_id",
    "current_location",
    "current_face"
  ],
  "additionalProperties": false,
  "fields": {
    "current_face": {
      "title": "Current Face",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 10
    },
    "current_location": {
      "required": true,
      "nullable": false,
      "ref": "RackPosition"
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
