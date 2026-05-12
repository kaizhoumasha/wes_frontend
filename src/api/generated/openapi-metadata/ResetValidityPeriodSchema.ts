/**
 * 自动生成的 OpenAPI schema 字段元数据: ResetValidityPeriodSchema
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResetValidityPeriodSchemaMetadata = {
  "title": "ResetValidityPeriodSchema",
  "description": "重置有效期 Schema",
  "required": [
    "validity_period"
  ],
  "fields": {
    "version": {
      "title": "Version",
      "description": "数据版本",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "validity_period": {
      "description": "新的有效期时长",
      "required": true,
      "nullable": false,
      "enum": [
        "1d",
        "1w",
        "1m",
        "6m",
        "1y",
        "never"
      ],
      "ref": "ValidityPeriod"
    }
  }
} satisfies OpenApiSchemaMetadata
