/**
 * 自动生成的 OpenAPI schema 字段元数据: SandboxWorklineStartResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SandboxWorklineStartResponseMetadata = {
  "title": "SandboxWorklineStartResponse",
  "description": "沙箱 WorkLine START 准入结果。",
  "required": [],
  "fields": {
    "status": {
      "title": "Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "ack": {
      "title": "Ack",
      "type": "boolean",
      "required": false,
      "nullable": true
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "reason_code": {
      "title": "Reason Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "diagnostic": {
      "title": "Diagnostic",
      "type": "object",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
