/**
 * 自动生成的 OpenAPI schema 字段元数据: CallbackRejectedResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CallbackRejectedResponseMetadata = {
  "title": "CallbackRejectedResponse",
  "description": "Callback 入口拒收响应数据。",
  "required": [],
  "fields": {
    "ack": {
      "title": "Ack",
      "description": "入口是否接收",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "reason_code": {
      "title": "Reason Code",
      "description": "拒收原因代码",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "diagnostic": {
      "title": "Diagnostic",
      "description": "拒收诊断信息",
      "type": "object",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
