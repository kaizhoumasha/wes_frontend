/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeOverviewResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeOverviewResponseMetadata = {
  "title": "RuntimeOverviewResponse",
  "required": [
    "stats"
  ],
  "fields": {
    "stats": {
      "title": "Stats",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "RuntimeStatCard"
      }
    },
    "recent_failed_traces": {
      "title": "Recent Failed Traces",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeTraceListItem"
      }
    },
    "hot_worklines": {
      "title": "Hot Worklines",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeWorklineSummary"
      }
    },
    "abnormal_devices": {
      "title": "Abnormal Devices",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeDeviceSummary"
      }
    },
    "device_health": {
      "required": false,
      "nullable": false,
      "ref": "RuntimeDeviceHealthSummary"
    }
  }
} satisfies OpenApiSchemaMetadata
