/**
 * 自动生成的 OpenAPI schema 字段元数据: DebugDataCleanupRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DebugDataCleanupRequestMetadata = {
  "title": "DebugDataCleanupRequest",
  "description": "非生产调试过程数据清理请求。",
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
      "description": "执行清理时的确认文本",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    }
  }
} satisfies OpenApiSchemaMetadata
