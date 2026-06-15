/**
 * 自动生成的 OpenAPI schema 字段元数据: Body_api_auth_applications_by_id_permissions_post
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const Body_api_auth_applications_by_id_permissions_postMetadata = {
  "title": "Body_api_auth_applications_by_id_permissions_post",
  "required": [
    "permission_ids"
  ],
  "fields": {
    "permission_ids": {
      "title": "Permission Ids",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "type": "integer"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
