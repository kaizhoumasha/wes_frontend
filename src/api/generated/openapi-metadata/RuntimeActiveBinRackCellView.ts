/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeActiveBinRackCellView
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeActiveBinRackCellViewMetadata = {
  "title": "RuntimeActiveBinRackCellView",
  "required": [],
  "fields": {
    "bin_cell_index": {
      "title": "Bin Cell Index",
      "required": false,
      "nullable": true
    },
    "bin_cell_code": {
      "title": "Bin Cell Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "bin_cell_location": {
      "title": "Bin Cell Location",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "capacity_depth_mm": {
      "title": "Capacity Depth Mm",
      "required": false,
      "nullable": true
    },
    "used_depth_mm": {
      "title": "Used Depth Mm",
      "required": false,
      "nullable": true
    },
    "material_identity_key": {
      "title": "Material Identity Key",
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
    "is_reserved": {
      "title": "Is Reserved",
      "type": "boolean",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
