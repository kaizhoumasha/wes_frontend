/**
 * 自动生成的 OpenAPI schema 字段元数据: IntegrationDebugEvidenceLink
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const IntegrationDebugEvidenceLinkMetadata = {
  "title": "IntegrationDebugEvidenceLink",
  "description": "调试证据跳转。",
  "required": [
    "kind",
    "label"
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
    "api_path": {
      "title": "Api Path",
      "type": "string",
      "required": false,
      "nullable": true
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
