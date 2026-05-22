/**
 * 自动生成的 OpenAPI schema 字段元数据: ResetPasswordRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResetPasswordRequestMetadata = {
  "title": "ResetPasswordRequest",
  "description": "管理员重置密码请求",
  "required": [
    "new_password"
  ],
  "fields": {
    "new_password": {
      "title": "New Password",
      "description": "新密码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 6,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
