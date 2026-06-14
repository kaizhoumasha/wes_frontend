/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeResourceKind
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeResourceKindMetadata = {
  "title": "RuntimeResourceKind",
  "description": "运行时资源标识类型，用于统一料架、料盒、工位槽等资源编码。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RuntimeResourceKind",
      "description": "运行时资源标识类型，用于统一料架、料盒、工位槽等资源编码。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "RACK",
        "BIN",
        "PKG",
        "SLOT",
        "CELL",
        "MAGAZINE",
        "PART_SN",
        "UNKNOWN"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
