/**
 * 自动生成的 OpenAPI schema 字段元数据: TryInvokeApplication
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TryInvokeApplicationMetadata = {
  "title": "TryInvokeApplication",
  "description": "测试 API 调用数据模型",
  "required": [
    "command_name",
    "command_description",
    "command_parameters",
    "command_response"
  ],
  "fields": {
    "command_name": {
      "title": "Command Name",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "command_description": {
      "title": "Command Description",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "command_parameters": {
      "title": "Command Parameters",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "command_response": {
      "title": "Command Response",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
