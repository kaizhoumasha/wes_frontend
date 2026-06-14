/**
 * 自动生成的 OpenAPI schema 字段元数据: SandboxWorklineStartRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SandboxWorklineStartRequestMetadata = {
  "title": "SandboxWorklineStartRequest",
  "description": "沙箱 WorkLine START 请求。",
  "required": [
    "device_code"
  ],
  "fields": {
    "device_code": {
      "title": "Device Code",
      "description": "触发 START 的设备编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "trace_id": {
      "title": "Trace Id",
      "description": "Trace ID（可选，自动生成）",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    }
  }
} satisfies OpenApiSchemaMetadata
