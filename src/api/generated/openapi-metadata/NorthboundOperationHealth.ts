/**
 * 自动生成的 OpenAPI schema 字段元数据: NorthboundOperationHealth
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const NorthboundOperationHealthMetadata = {
  "title": "NorthboundOperationHealth",
  "description": "只暴露低基数 identity、operation mode 和聚合 SLI，不暴露行级证据或 payload。",
  "required": [
    "provider_profile_identity",
    "operation_identity",
    "mode",
    "backlog_count",
    "active_lease_count",
    "unknown_count",
    "oldest_queue_age_seconds",
    "rate_limited_count",
    "lease_loss_count",
    "reconciliation_open_count"
  ],
  "additionalProperties": false,
  "fields": {
    "provider_profile_identity": {
      "title": "Provider Profile Identity",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 240
    },
    "operation_identity": {
      "title": "Operation Identity",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 240
    },
    "mode": {
      "title": "Mode",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "QUERY",
        "EFFECT"
      ]
    },
    "backlog_count": {
      "title": "Backlog Count",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "active_lease_count": {
      "title": "Active Lease Count",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "unknown_count": {
      "title": "Unknown Count",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "oldest_queue_age_seconds": {
      "title": "Oldest Queue Age Seconds",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "rate_limited_count": {
      "title": "Rate Limited Count",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "lease_loss_count": {
      "title": "Lease Loss Count",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "reconciliation_open_count": {
      "title": "Reconciliation Open Count",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    }
  }
} satisfies OpenApiSchemaMetadata
