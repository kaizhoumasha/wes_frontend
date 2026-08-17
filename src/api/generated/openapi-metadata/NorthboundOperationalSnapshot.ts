/**
 * 自动生成的 OpenAPI schema 字段元数据: NorthboundOperationalSnapshot
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const NorthboundOperationalSnapshotMetadata = {
  "title": "NorthboundOperationalSnapshot",
  "description": "租户作用域的北向运维快照。",
  "required": [
    "generated_at",
    "tenant_scope",
    "tenant_id",
    "workline_id",
    "operations"
  ],
  "additionalProperties": false,
  "fields": {
    "schema_version": {
      "title": "Schema Version",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "northbound-operational-snapshot.v1"
    },
    "catalog_version": {
      "title": "Catalog Version",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "northbound-operation-slo.v1"
    },
    "generated_at": {
      "title": "Generated At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "tenant_scope": {
      "title": "Tenant Scope",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "WORKLINE_OWNER",
        "PLATFORM"
      ]
    },
    "tenant_id": {
      "title": "Tenant Id",
      "type": "integer",
      "required": true,
      "nullable": true
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": true
    },
    "operations": {
      "title": "Operations",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "NorthboundOperationHealth"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
