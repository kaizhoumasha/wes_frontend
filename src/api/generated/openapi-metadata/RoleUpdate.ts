/**
 * 自动生成的 OpenAPI schema 字段元数据: RoleUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RoleUpdateMetadata = {
  "title": "RoleUpdate",
  "description": "角色更新 Schema",
  "required": [
    "version"
  ],
  "additionalProperties": false,
  "fields": {
    "description": {
      "title": "Description",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
    },
    "name": {
      "title": "Name",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "version": {
      "title": "Version",
      "description": "乐观锁版本号，更新时必传",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
