/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneResource
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneResourceMetadata = {
  "title": "PlaneResource",
  "description": "Scene v2 单个资源行：Definition 声明 + WorkLine 实际绑定 + 绑定状态。",
  "required": [
    "key",
    "display_name",
    "stable_order",
    "binding_state"
  ],
  "additionalProperties": false,
  "fields": {
    "binding": {
      "required": false,
      "nullable": true,
      "ref": "PlaneResourceBinding"
    },
    "binding_state": {
      "required": true,
      "nullable": false,
      "enum": [
        "BOUND",
        "UNBOUND",
        "INVALID"
      ],
      "ref": "SceneBindingState"
    },
    "declared_constraints": {
      "title": "Declared Constraints",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "display_name": {
      "title": "Display Name",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "key": {
      "title": "Key",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "stable_order": {
      "title": "Stable Order",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    }
  }
} satisfies OpenApiSchemaMetadata
