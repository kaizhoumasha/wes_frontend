/**
 * 自动生成的 OpenAPI schema 字段元数据: SandboxAckRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SandboxAckRequestMetadata = {
  "title": "SandboxAckRequest",
  "description": "沙箱 Command ACK 模拟请求。",
  "required": [
    "dispatch_key"
  ],
  "fields": {
    "dispatch_key": {
      "title": "Dispatch Key",
      "description": "Dispatch Key",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 200
    }
  }
} satisfies OpenApiSchemaMetadata
