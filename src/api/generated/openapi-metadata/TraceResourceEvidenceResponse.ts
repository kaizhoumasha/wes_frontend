/**
 * 自动生成的 OpenAPI schema 字段元数据: TraceResourceEvidenceResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const TraceResourceEvidenceResponseMetadata = {
  "title": "TraceResourceEvidenceResponse",
  "description": "Trace 关联的资源域证据链。",
  "required": [],
  "fields": {
    "resource_state_events": {
      "title": "Resource State Events",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "object"
      }
    },
    "rack_releases": {
      "title": "Rack Releases",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "object"
      }
    },
    "rack_release_bin_snapshots": {
      "title": "Rack Release Bin Snapshots",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "object"
      }
    },
    "wms_writeback_evidence": {
      "title": "Wms Writeback Evidence",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "object"
      }
    },
    "rack_bin_mounts": {
      "title": "Rack Bin Mounts",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "object"
      }
    },
    "runtime_holds": {
      "title": "Runtime Holds",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "object"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
