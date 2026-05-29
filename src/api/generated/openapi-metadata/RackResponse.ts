/**
 * 自动生成的 OpenAPI schema 字段元数据: RackResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackResponseMetadata = {
  "title": "RackResponse",
  "description": "货架实例响应 Schema。",
  "required": [
    "rack_code",
    "rack_type_code",
    "id"
  ],
  "fields": {
    "rack_code": {
      "title": "Rack Code",
      "description": "WES 货架编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "wms_rack_id": {
      "title": "Wms Rack Id",
      "description": "WMS 货架 ID",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "rack_type_code": {
      "title": "Rack Type Code",
      "description": "货架类型编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "status": {
      "description": "货架主数据状态",
      "required": false,
      "nullable": false,
      "default": "ACTIVE",
      "enum": [
        "ACTIVE",
        "DISABLED"
      ],
      "ref": "ResourceMasterStatus"
    },
    "source_system": {
      "description": "来源系统",
      "required": false,
      "nullable": false,
      "default": "MANUAL_IMPORT",
      "enum": [
        "WMS",
        "RCS",
        "ECS",
        "WES_RUNTIME",
        "MANUAL_IMPORT",
        "MANUAL"
      ],
      "ref": "ResourceSourceSystem"
    },
    "source_version": {
      "title": "Source Version",
      "description": "来源版本",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
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
