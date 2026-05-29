/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineStateTransitionRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineStateTransitionRequestMetadata = {
  "title": "WorkLineStateTransitionRequest",
  "description": "作业线启停请求。",
  "required": [
    "version"
  ],
  "fields": {
    "version": {
      "title": "Version",
      "description": "WorkLine 乐观锁版本号",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
