/**
 * 自动生成的 OpenAPI schema 字段元数据: PhysicalHandoffEvidenceInput
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PhysicalHandoffEvidenceInputMetadata = {
  "title": "PhysicalHandoffEvidenceInput",
  "description": "Client-submitted physical handoff evidence.\n\nServer-owned facts such as confirmed_by, confirmed_at and material_identity\nare intentionally not part of this schema.",
  "required": [
    "ng_location_code",
    "ng_location_scan",
    "material_scan_payload",
    "line_clear_checked",
    "late_callback_reviewed"
  ],
  "additionalProperties": false,
  "fields": {
    "ng_location_code": {
      "title": "Ng Location Code",
      "description": "NG 暂存位置编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "ng_location_scan": {
      "title": "Ng Location Scan",
      "description": "NG 位置扫码原文",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 500
    },
    "material_scan_payload": {
      "title": "Material Scan Payload",
      "description": "现场重新扫描到的物料原文",
      "required": true,
      "nullable": false
    },
    "line_clear_checked": {
      "title": "Line Clear Checked",
      "description": "已确认工位/设备无残留同一物料",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "late_callback_reviewed": {
      "title": "Late Callback Reviewed",
      "description": "已复核迟到 callback evidence",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "handoff_witness_id": {
      "title": "Handoff Witness Id",
      "description": "可选见证人",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
