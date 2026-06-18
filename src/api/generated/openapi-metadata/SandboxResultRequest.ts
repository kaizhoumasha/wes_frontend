/**
 * 自动生成的 OpenAPI schema 字段元数据: SandboxResultRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SandboxResultRequestMetadata = {
  "title": "SandboxResultRequest",
  "description": "沙箱 Command Result 模拟请求。",
  "required": [
    "command_code",
    "device_code",
    "result"
  ],
  "fields": {
    "command_code": {
      "title": "Command Code",
      "description": "Command Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "device_code": {
      "title": "Device Code",
      "description": "设备 Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "result": {
      "title": "Result",
      "description": "结果状态",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "payload": {
      "title": "Payload",
      "description": "Result Payload",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "error_detail": {
      "title": "Error Detail",
      "description": "错误详情（FAILED 时）",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    },
    "timestamp": {
      "title": "Timestamp",
      "description": "结果时间戳（默认当前时间）",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
