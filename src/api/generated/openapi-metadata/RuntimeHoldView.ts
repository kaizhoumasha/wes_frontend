/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeHoldView
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeHoldViewMetadata = {
  "title": "RuntimeHoldView",
  "description": "Active object 关联 RuntimeHold 展示字段。",
  "required": [],
  "fields": {
    "allowed_next_effect_scope": {
      "title": "Allowed Next Effect Scope",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "freeze_scope": {
      "title": "Freeze Scope",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "reason_code": {
      "title": "Reason Code",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
