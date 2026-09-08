/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceEvidenceUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceEvidenceUpdateMetadata = {
  "title": "DeviceEvidenceUpdate",
  "description": "device evidence 当前诊断快照；未处理的历史记录没有 processed_at。",
  "required": [
    "evidence_id",
    "kind",
    "source_event_id",
    "device_code",
    "apply_status",
    "processed_at"
  ],
  "additionalProperties": false,
  "fields": {
    "apply_status": {
      "title": "Apply Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "command_code": {
      "title": "Command Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "event_type": {
      "title": "Event Type",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "evidence_id": {
      "title": "Evidence Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "kind": {
      "required": true,
      "nullable": false,
      "enum": [
        "DEVICE_RESULT",
        "DEVICE_EVENT"
      ],
      "ref": "DeviceIngressKind"
    },
    "processed_at": {
      "title": "Processed At",
      "type": "string",
      "required": true,
      "nullable": true
    },
    "source_event_id": {
      "title": "Source Event Id",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
