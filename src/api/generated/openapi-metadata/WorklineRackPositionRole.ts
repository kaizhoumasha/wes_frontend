/**
 * 自动生成的 OpenAPI schema 字段元数据: WorklineRackPositionRole
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorklineRackPositionRoleMetadata = {
  "title": "WorklineRackPositionRole",
  "description": "工作线停靠位角色。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "WorklineRackPositionRole",
      "description": "工作线停靠位角色。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "SMT_CLASSIFIER_SINGLE_RACK_WORK",
        "SMT_RACK_EXCHANGE_AREA",
        "SMT_SORTER_QUEUE",
        "SMT_SORTER_STATION",
        "SMT_RETURN_RACK_POSITION",
        "SMT_TRANSFER_RACK_POSITION",
        "SMT_EMPTY_RACK_AREA"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
