/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneResourceRef
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneResourceRefMetadata = {
  "title": "PlaneResourceRef",
  "description": "Snapshot/Active Objects 关联 Scene 资源行的唯一引用；不表达绑定详情。",
  "required": [
    "group",
    "key"
  ],
  "additionalProperties": false,
  "fields": {
    "group": {
      "required": true,
      "nullable": false,
      "enum": [
        "POSITION_SLOT",
        "DEVICE_ROLE"
      ],
      "ref": "PlaneResourceGroup"
    },
    "key": {
      "title": "Key",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
