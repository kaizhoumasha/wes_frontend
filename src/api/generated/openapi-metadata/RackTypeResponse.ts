/**
 * 自动生成的 OpenAPI schema 字段元数据: RackTypeResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackTypeResponseMetadata = {
  "title": "RackTypeResponse",
  "description": "货架类型响应 Schema。",
  "required": [
    "rack_type_code",
    "rack_type_name",
    "rack_kind",
    "slot_count",
    "id"
  ],
  "fields": {
    "rack_type_code": {
      "title": "Rack Type Code",
      "description": "货架类型编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "rack_type_name": {
      "title": "Rack Type Name",
      "description": "货架类型名称",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "rack_kind": {
      "description": "货架物理结构类型",
      "required": true,
      "nullable": false,
      "enum": [
        "SINGLE_LAYER",
        "FIVE_LAYER",
        "RETURN",
        "TRANSFER",
        "PRODUCTION"
      ],
      "ref": "RackKind"
    },
    "slot_count": {
      "title": "Slot Count",
      "description": "标准槽位数量",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 1
    },
    "has_side": {
      "title": "Has Side",
      "description": "是否区分 A/B 面",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "description": {
      "title": "Description",
      "description": "说明",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    },
    "active": {
      "title": "Active",
      "description": "是否启用",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": true
    },
    "metadata_json": {
      "title": "Metadata Json",
      "description": "扩展属性",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
