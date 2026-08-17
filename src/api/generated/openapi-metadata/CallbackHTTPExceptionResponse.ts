/**
 * 自动生成的 OpenAPI schema 字段元数据: CallbackHTTPExceptionResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CallbackHTTPExceptionResponseMetadata = {
  "title": "CallbackHTTPExceptionResponse",
  "description": "Callback 入口由 HTTPException 返回的传输层错误。",
  "required": [
    "detail"
  ],
  "fields": {
    "detail": {
      "title": "Detail",
      "description": "可重试或请求体限制错误说明",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
