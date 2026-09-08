/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceIngressAttempt
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceIngressAttemptMetadata = {
  "title": "DeviceIngressAttempt",
  "description": "一次 ECS callback HTTP 尝试的安全诊断快照。",
  "required": [
    "request_id",
    "kind",
    "path",
    "received_at",
    "disposition",
    "status_code",
    "observed_body_bytes"
  ],
  "additionalProperties": false,
  "fields": {
    "apply_status": {
      "title": "Apply Status",
      "type": "string",
      "required": false,
      "nullable": true
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
      "required": false,
      "nullable": true
    },
    "disposition": {
      "required": true,
      "nullable": false,
      "enum": [
        "ACCEPTED",
        "DUPLICATE",
        "CONFLICT",
        "REJECTED"
      ],
      "ref": "DeviceIngressDisposition"
    },
    "error_code": {
      "title": "Error Code",
      "type": "string",
      "required": false,
      "nullable": true
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
      "required": false,
      "nullable": true
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
    "observed_body_bytes": {
      "title": "Observed Body Bytes",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "path": {
      "title": "Path",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "raw_payload": {
      "title": "Raw Payload",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "received_at": {
      "title": "Received At",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "request_id": {
      "title": "Request Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "source_event_id": {
      "title": "Source Event Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "status_code": {
      "title": "Status Code",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
