/**
 * 自动生成的 OpenAPI schema 字段元数据: SandboxCleanupRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SandboxCleanupRequestMetadata = {
  "title": "SandboxCleanupRequest",
  "description": "沙箱工作线清理请求。",
  "required": [],
  "fields": {
    "dry_run": {
      "title": "Dry Run",
      "description": "true 仅返回影响范围；false 执行清理",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": true
    },
    "confirmation": {
      "title": "Confirmation",
      "description": "执行清理时必须等于工作线编码",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    }
  }
} satisfies OpenApiSchemaMetadata
