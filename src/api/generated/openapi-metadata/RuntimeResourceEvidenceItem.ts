/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeResourceEvidenceItem
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeResourceEvidenceItemMetadata = {
  "title": "RuntimeResourceEvidenceItem",
  "required": [
    "resource_kind",
    "resource_code",
    "display_label",
    "evidence_kind"
  ],
  "fields": {
    "resource_kind": {
      "required": true,
      "nullable": false,
      "enum": [
        "RACK",
        "BIN",
        "PKG",
        "SLOT",
        "CELL",
        "MAGAZINE",
        "PART_SN",
        "UNKNOWN"
      ],
      "ref": "RuntimeResourceKind"
    },
    "resource_code": {
      "title": "Resource Code",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "display_label": {
      "title": "Display Label",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "evidence_kind": {
      "required": true,
      "nullable": false,
      "enum": [
        "WES_ACTIVE_SNAPSHOT",
        "WMS_CALLBACK_EVIDENCE",
        "TRACE_RESOURCE_EVIDENCE",
        "GENERIC_EVIDENCE",
        "UNKNOWN"
      ],
      "ref": "RuntimeResourceEvidenceKind"
    },
    "station_code": {
      "title": "Station Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "position_code": {
      "title": "Position Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "rack_code": {
      "title": "Rack Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "bin_code": {
      "title": "Bin Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "slot_code": {
      "title": "Slot Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "cell_code": {
      "title": "Cell Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "pkg_code": {
      "title": "Pkg Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "part_sn": {
      "title": "Part Sn",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "material_code": {
      "title": "Material Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "date_code": {
      "title": "Date Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "lot_code": {
      "title": "Lot Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "reel_count": {
      "title": "Reel Count",
      "required": false,
      "nullable": true
    },
    "reel_code": {
      "title": "Reel Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "position_index": {
      "title": "Position Index",
      "required": false,
      "nullable": true
    },
    "source_session_id": {
      "title": "Source Session Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_trace_id": {
      "title": "Source Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "occurred_at": {
      "title": "Occurred At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
