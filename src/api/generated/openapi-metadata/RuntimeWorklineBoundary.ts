/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeWorklineBoundary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeWorklineBoundaryMetadata = {
  "title": "RuntimeWorklineBoundary",
  "required": [],
  "fields": {
    "workline_readiness": {
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "READY",
        "NOT_READY",
        "UNKNOWN"
      ],
      "ref": "RuntimeWorklineReadiness"
    },
    "station_lease": {
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "IDLE",
        "ACTIVE_RACK_BOUND",
        "ACTIVE_DISPATCH_LEASE",
        "ACTIVE_SESSION_BOUND",
        "UNKNOWN"
      ],
      "ref": "RuntimeStationLease"
    },
    "single_layer_rack_snapshot": {
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "ACTIVE",
        "MISSING",
        "INVALID",
        "NON_SINGLE_LAYER_EVIDENCE",
        "UNKNOWN"
      ],
      "ref": "RuntimeSingleLayerRackSnapshot"
    },
    "rack_operation_wait": {
      "required": false,
      "nullable": false,
      "default": "NONE",
      "enum": [
        "WAITING_WMS",
        "WMS_CALLBACK_RECEIVED",
        "TIMEOUT",
        "FAILED",
        "NONE",
        "UNKNOWN"
      ],
      "ref": "RuntimeRackOperationWait"
    }
  }
} satisfies OpenApiSchemaMetadata
