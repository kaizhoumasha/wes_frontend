/**
 * 自动生成的 OpenAPI schema 字段元数据: SandboxTemplatesResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SandboxTemplatesResponseMetadata = {
  "title": "SandboxTemplatesResponse",
  "description": "沙箱模板响应。",
  "required": [],
  "fields": {
    "event_templates": {
      "title": "Event Templates",
      "description": "Event 模板列表",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "SandboxEventTemplate"
      }
    },
    "result_templates": {
      "title": "Result Templates",
      "description": "Result 模板列表",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "SandboxResultTemplate"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
