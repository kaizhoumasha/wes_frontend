/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeActiveBinRackView
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeActiveBinRackViewMetadata = {
  "title": "RuntimeActiveBinRackView",
  "required": [],
  "fields": {
    "rack_id": {
      "title": "Rack Id",
      "required": false,
      "nullable": true
    },
    "rack_code": {
      "title": "Rack Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "rack_kind": {
      "title": "Rack Kind",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "rack_type": {
      "title": "Rack Type",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "bins": {
      "title": "Bins",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeActiveBinRackBinView"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
