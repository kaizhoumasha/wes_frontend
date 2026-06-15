/**
 * 自动生成的 OpenAPI schema 字段元数据: TryInvokeApplicationRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TryInvokeApplicationRequestMetadata = {
  "title": "TryInvokeApplicationRequest",
  "description": "测试 API 调用请求模型（包裹格式）",
  "required": [
    "data"
  ],
  "fields": {
    "data": {
      "required": true,
      "nullable": false,
      "ref": "TryInvokeApplication"
    }
  }
} satisfies OpenApiSchemaMetadata
