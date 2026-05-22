/**
 * 自动生成的 OpenAPI schema 字段元数据: SimulateWorkLineEstopRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SimulateWorkLineEstopRequestMetadata = {
  "title": "SimulateWorkLineEstopRequest",
  "description": "沙箱模拟 WorkLine 软件急停请求。",
  "required": [],
  "fields": {
    "reason": {
      "title": "Reason",
      "description": "模拟急停说明",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    },
    "source_device_id": {
      "title": "Source Device Id",
      "description": "模拟来源设备 ID",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "payload": {
      "title": "Payload",
      "description": "模拟触发 payload",
      "type": "object",
      "required": false,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
