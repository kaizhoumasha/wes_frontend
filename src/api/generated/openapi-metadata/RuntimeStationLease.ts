/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeStationLease
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeStationLeaseMetadata = {
  "title": "RuntimeStationLease",
  "description": "工站当前占用来源，用于判断是否可继续调度。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "RuntimeStationLease",
      "description": "工站当前占用来源，用于判断是否可继续调度。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "IDLE",
        "ACTIVE_RACK_BOUND",
        "ACTIVE_DISPATCH_LEASE",
        "ACTIVE_SESSION_BOUND",
        "UNKNOWN"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
