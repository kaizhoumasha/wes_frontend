/**
 * 自动生成的 OpenAPI schema 字段元数据: MaterialLocationEvidence
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const MaterialLocationEvidenceMetadata = {
  "title": "MaterialLocationEvidence",
  "description": "单个位置来源 evidence。",
  "required": [
    "source",
    "priority",
    "object_type",
    "object_key"
  ],
  "fields": {
    "correlation_id": {
      "title": "Correlation Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "evidence_json": {
      "title": "Evidence Json",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "evidence_ref": {
      "title": "Evidence Ref",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "external_reference": {
      "title": "External Reference",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "location_code": {
      "title": "Location Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "location_scope": {
      "title": "Location Scope",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "object_key": {
      "title": "Object Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "object_type": {
      "title": "Object Type",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "observed_at": {
      "title": "Observed At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "priority": {
      "title": "Priority",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "provider_code": {
      "title": "Provider Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "semantic_status": {
      "title": "Semantic Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "source": {
      "title": "Source",
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
    "source_version": {
      "title": "Source Version",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
