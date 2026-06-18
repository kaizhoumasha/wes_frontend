/**
 * 自动生成的 OpenAPI schema 字段元数据: BinContentSnapshotItemResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinContentSnapshotItemResponseMetadata = {
  "title": "BinContentSnapshotItemResponse",
  "description": "料箱内容快照明细响应 Schema。",
  "required": [
    "snapshot_id",
    "id"
  ],
  "fields": {
    "snapshot_id": {
      "title": "Snapshot Id",
      "description": "所属快照业务 ID",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 160
    },
    "bin_cell_code": {
      "title": "Bin Cell Code",
      "description": "料箱内部格位编码",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "bin_cell_index": {
      "title": "Bin Cell Index",
      "description": "料箱内部格位序号",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 20
    },
    "pkg_code": {
      "title": "Pkg Code",
      "description": "PKG 展示字段",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "material_code": {
      "title": "Material Code",
      "description": "物料编码引用",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "vendor_code": {
      "title": "Vendor Code",
      "description": "供应商引用",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "lot_code": {
      "title": "Lot Code",
      "description": "批次展示字段",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "date_code": {
      "title": "Date Code",
      "description": "Date Code",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "qty_snapshot": {
      "title": "Qty Snapshot",
      "description": "当时执行过程看到的数量",
      "type": "number",
      "required": false,
      "nullable": true,
      "minimum": 0
    },
    "thickness_mm": {
      "title": "Thickness Mm",
      "description": "厚度",
      "type": "number",
      "required": false,
      "nullable": true,
      "minimum": 0
    },
    "dims_json": {
      "title": "Dims Json",
      "description": "尺寸",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "wms_inventory_id": {
      "title": "Wms Inventory Id",
      "description": "WMS 库存记录引用",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 160
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
