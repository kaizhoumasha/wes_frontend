/**
 * 自动生成的 OpenAPI schema 字段元数据: BinResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinResponseMetadata = {
  "title": "BinResponse",
  "description": "料箱实例响应 Schema。",
  "required": [
    "bin_code",
    "bin_type_code",
    "id"
  ],
  "fields": {
    "bin_code": {
      "title": "Bin Code",
      "description": "WES 料箱编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "wms_bin_id": {
      "title": "Wms Bin Id",
      "description": "WMS 料箱 ID",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "bin_type_code": {
      "title": "Bin Type Code",
      "description": "料箱类型编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "status": {
      "description": "料箱主数据状态",
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
