/**
 * 自动生成的 OpenAPI schema 字段元数据: BinSlotTemplateResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinSlotTemplateResponseMetadata = {
  "title": "BinSlotTemplateResponse",
  "description": "料箱槽位模板响应 Schema。",
  "required": [
    "bin_type_code",
    "bin_slot_code",
    "slot_size",
    "id"
  ],
  "fields": {
    "bin_type_code": {
      "title": "Bin Type Code",
      "description": "所属料箱类型编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "bin_slot_code": {
      "title": "Bin Slot Code",
      "description": "料箱内槽位编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "slot_size": {
      "description": "槽位尺寸",
      "required": true,
      "nullable": false,
      "enum": [
        "7INCH",
        "13INCH",
        "15INCH",
        "LARGE"
      ],
      "ref": "BinSlotSize"
    },
    "max_depth_mm": {
      "title": "Max Depth Mm",
      "description": "最大深度",
      "type": "integer",
      "required": false,
      "nullable": true,
      "minimum": 1
    },
    "max_weight_g": {
      "title": "Max Weight G",
      "description": "最大重量",
      "type": "integer",
      "required": false,
      "nullable": true,
      "minimum": 1
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
