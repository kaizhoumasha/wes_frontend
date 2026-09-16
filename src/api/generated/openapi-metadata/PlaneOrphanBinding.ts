/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneOrphanBinding
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneOrphanBindingMetadata = {
  "title": "PlaneOrphanBinding",
  "description": "Definition 已不再声明、但历史 config 仍保留的绑定诊断。",
  "required": [
    "group",
    "key",
    "bound_code",
    "reason"
  ],
  "additionalProperties": false,
  "fields": {
    "bound_code": {
      "title": "Bound Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
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
    },
    "reason": {
      "title": "Reason",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    }
  }
} satisfies OpenApiSchemaMetadata
