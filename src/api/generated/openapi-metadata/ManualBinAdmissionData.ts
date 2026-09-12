/**
 * 自动生成的 OpenAPI schema 字段元数据: ManualBinAdmissionData
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ManualBinAdmissionDataMetadata = {
  "title": "ManualBinAdmissionData",
  "required": [
    "task_id",
    "bin_code",
    "scanned_at"
  ],
  "fields": {
    "bin_code": {
      "title": "Bin Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "scanned_at": {
      "title": "Scanned At",
      "type": "integer",
      "required": true,
      "nullable": false,
      "maximum": 9223372036854776000
    },
    "task_id": {
      "title": "Task Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
