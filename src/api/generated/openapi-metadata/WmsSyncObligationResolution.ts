/**
 * 自动生成的 OpenAPI schema 字段元数据: WmsSyncObligationResolution
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WmsSyncObligationResolutionMetadata = {
  "title": "WmsSyncObligationResolution",
  "description": "明确满足单项 E03/E07 同步义务的已关闭对账裁决。",
  "required": [
    "resolved_operation_identity",
    "resolved_fact_version",
    "resolution",
    "source_event_id",
    "evidence_reference"
  ],
  "additionalProperties": false,
  "fields": {
    "evidence_reference": {
      "title": "Evidence Reference",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 500
    },
    "resolution": {
      "title": "Resolution",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "resolved_fact_version": {
      "title": "Resolved Fact Version",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "resolved_operation_identity": {
      "title": "Resolved Operation Identity",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "wms.inventory.confirm_inbound@v1",
        "wms.fulfillment.notify_pkg_binding@v1"
      ]
    },
    "source_event_id": {
      "title": "Source Event Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 240
    }
  }
} satisfies OpenApiSchemaMetadata
