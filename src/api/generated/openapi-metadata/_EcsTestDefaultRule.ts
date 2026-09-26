/**
 * 自动生成的 OpenAPI schema 字段元数据: _EcsTestDefaultRule
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _EcsTestDefaultRuleMetadata = {
  "title": "_EcsTestDefaultRule",
  "required": [
    "target_device_code",
    "task_type",
    "params"
  ],
  "additionalProperties": false,
  "fields": {
    "params": {
      "title": "Params",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "target_device_code": {
      "title": "Target Device Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "task_type": {
      "title": "Task Type",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
