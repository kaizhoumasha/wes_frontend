/**
 * 自动生成的 OpenAPI schema 字段元数据: RoleCreate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RoleCreateMetadata = {
  "title": "RoleCreate",
  "description": "角色创建 Schema",
  "required": [
    "name"
  ],
  "additionalProperties": false,
  "fields": {
    "name": {
      "title": "Name",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 100
    },
    "description": {
      "title": "Description",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
    }
  }
} satisfies OpenApiSchemaMetadata
