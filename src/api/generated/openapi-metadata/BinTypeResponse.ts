/**
 * 自动生成的 OpenAPI schema 字段元数据: BinTypeResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinTypeResponseMetadata = {
  "title": "BinTypeResponse",
  "description": "料箱类型响应 Schema。",
  "required": [
    "bin_type_code",
    "bin_type_name",
    "id"
  ],
  "fields": {
    "bin_type_code": {
      "title": "Bin Type Code",
      "description": "料箱类型编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "bin_type_name": {
      "title": "Bin Type Name",
      "description": "料箱类型名称",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
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
