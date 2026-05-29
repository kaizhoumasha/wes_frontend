/**
 * 自动生成的 OpenAPI schema 字段元数据: ResourceMasterStatus
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResourceMasterStatusMetadata = {
  "title": "ResourceMasterStatus",
  "description": "资源主数据启停状态。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "ResourceMasterStatus",
      "description": "资源主数据启停状态。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "ACTIVE",
        "DISABLED"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
