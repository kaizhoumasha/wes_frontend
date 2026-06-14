/**
 * 自动生成的 OpenAPI schema 字段元数据: NgReasonOption
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const NgReasonOptionMetadata = {
  "title": "NgReasonOption",
  "description": "NG reason option.",
  "required": [
    "source",
    "code",
    "label"
  ],
  "fields": {
    "source": {
      "title": "Source",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "code": {
      "title": "Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "label": {
      "title": "Label",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "plugin_key": {
      "title": "Plugin Key",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "contract_version": {
      "title": "Contract Version",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "maps_from": {
      "title": "Maps From",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
