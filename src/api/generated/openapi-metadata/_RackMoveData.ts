/**
 * 自动生成的 OpenAPI schema 字段元数据: _RackMoveData
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const _RackMoveDataMetadata = {
  "title": "_RackMoveData",
  "required": [
    "rack_id",
    "source",
    "target",
    "target_face"
  ],
  "additionalProperties": false,
  "fields": {
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "rcs_template_id": {
      "required": false,
      "nullable": true,
      "enum": [
        "CTU01",
        "CTU02",
        "CTU03",
        "F01"
      ],
      "ref": "RcsTemplateId"
    },
    "source": {
      "required": true,
      "nullable": false,
      "ref": "_RackMovePosition"
    },
    "target": {
      "required": true,
      "nullable": false,
      "ref": "_RackMovePosition"
    },
    "target_face": {
      "title": "Target Face",
      "description": "Opaque non-empty face value without NUL; preserve exactly",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1
    }
  }
} satisfies OpenApiSchemaMetadata
