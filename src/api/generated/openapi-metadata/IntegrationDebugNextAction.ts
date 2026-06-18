/**
 * 自动生成的 OpenAPI schema 字段元数据: IntegrationDebugNextAction
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const IntegrationDebugNextActionMetadata = {
  "title": "IntegrationDebugNextAction",
  "description": "只读下一步建议。",
  "required": [
    "kind",
    "label",
    "description"
  ],
  "fields": {
    "kind": {
      "title": "Kind",
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
    "description": {
      "title": "Description",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "route_name": {
      "title": "Route Name",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "route_params": {
      "title": "Route Params",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "route_query": {
      "title": "Route Query",
      "type": "object",
      "required": false,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
