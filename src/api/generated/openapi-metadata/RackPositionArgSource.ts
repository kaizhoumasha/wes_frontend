/**
 * 自动生成的 OpenAPI schema 字段元数据: RackPositionArgSource
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackPositionArgSourceMetadata = {
  "title": "RackPositionArgSource",
  "description": "命令货架位参数的动态解析来源。",
  "required": [
    "kind",
    "path"
  ],
  "fields": {
    "kind": {
      "title": "Kind",
      "description": "参数来源类型",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "path": {
      "title": "Path",
      "description": "参数来源路径",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "fallback_rack_position_ref": {
      "title": "Fallback Rack Position Ref",
      "description": "兜底静态货架位引用",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
