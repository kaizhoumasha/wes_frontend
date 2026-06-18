/**
 * 自动生成的 OpenAPI schema 字段元数据: RackSlotTemplateResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackSlotTemplateResponseMetadata = {
  "title": "RackSlotTemplateResponse",
  "description": "货架槽位模板响应 Schema。",
  "required": [
    "rack_type_code",
    "slot_code",
    "slot_kind",
    "id"
  ],
  "fields": {
    "rack_type_code": {
      "title": "Rack Type Code",
      "description": "所属货架类型编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "slot_code": {
      "title": "Slot Code",
      "description": "货架槽位编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "side": {
      "description": "槽位面",
      "required": false,
      "nullable": false,
      "default": "NONE",
      "enum": [
        "A",
        "B",
        "NONE"
      ],
      "ref": "RackSlotSide"
    },
    "layer_no": {
      "title": "Layer No",
      "description": "层号",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1,
      "minimum": 1
    },
    "position_no": {
      "title": "Position No",
      "description": "同层序号",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 1,
      "minimum": 1
    },
    "slot_kind": {
      "description": "槽位承载对象类型",
      "required": true,
      "nullable": false,
      "enum": [
        "BIN_SLOT",
        "MATERIAL_SLOT"
      ],
      "ref": "RackSlotKind"
    },
    "allowed_bin_types": {
      "title": "Allowed Bin Types",
      "description": "允许的料箱类型",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "allowed_material_carrier_types": {
      "title": "Allowed Material Carrier Types",
      "description": "允许的物料承载形态",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "active": {
      "title": "Active",
      "description": "是否启用",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": true
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
