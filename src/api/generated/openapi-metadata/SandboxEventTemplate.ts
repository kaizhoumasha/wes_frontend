/**
 * 自动生成的 OpenAPI schema 字段元数据: SandboxEventTemplate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SandboxEventTemplateMetadata = {
  "title": "SandboxEventTemplate",
  "description": "沙箱 Event 模板。",
  "required": [
    "event_type",
    "label"
  ],
  "fields": {
    "event_type": {
      "title": "Event Type",
      "description": "事件类型标识",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "label": {
      "title": "Label",
      "description": "事件类型显示名称",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "payload_template": {
      "title": "Payload Template",
      "description": "Payload 模板",
      "type": "object",
      "required": false,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
