/**
 * 自动生成的 OpenAPI schema 字段元数据: SandboxResultTemplate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SandboxResultTemplateMetadata = {
  "title": "SandboxResultTemplate",
  "description": "沙箱 Result 模板。",
  "required": [
    "command_type",
    "label"
  ],
  "fields": {
    "command_type": {
      "title": "Command Type",
      "description": "Command 类型标识",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "label": {
      "title": "Label",
      "description": "Command 类型显示名称",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "success_payload_template": {
      "title": "Success Payload Template",
      "description": "成功 Payload 模板",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "failed_payload_template": {
      "title": "Failed Payload Template",
      "description": "失败 Payload 模板",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "error_template": {
      "title": "Error Template",
      "description": "错误信息模板",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
