/**
 * 自动生成的 OpenAPI schema 字段元数据: BinContentSnapshotResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const BinContentSnapshotResponseMetadata = {
  "title": "BinContentSnapshotResponse",
  "description": "料箱内容快照头响应 Schema。",
  "required": [
    "snapshot_id",
    "bin_code",
    "captured_at",
    "snapshot_hash",
    "id"
  ],
  "fields": {
    "snapshot_id": {
      "title": "Snapshot Id",
      "description": "快照业务 ID",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 160
    },
    "bin_code": {
      "title": "Bin Code",
      "description": "料箱编码",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "source_session_id": {
      "title": "Source Session Id",
      "description": "产生快照的 WorklineSession",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "source_event_id": {
      "title": "Source Event Id",
      "description": "来源事件或命令结果",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 200
    },
    "captured_at": {
      "title": "Captured At",
      "description": "快照时间",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    },
    "snapshot_status": {
      "description": "快照完整性",
      "required": false,
      "nullable": false,
      "default": "UNKNOWN",
      "enum": [
        "COMPLETE",
        "PARTIAL",
        "UNKNOWN"
      ],
      "ref": "BinContentSnapshotStatus"
    },
    "snapshot_reason": {
      "title": "Snapshot Reason",
      "description": "快照原因",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 80
    },
    "snapshot_group_key": {
      "title": "Snapshot Group Key",
      "description": "快照分组键",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 160
    },
    "snapshot_hash": {
      "title": "Snapshot Hash",
      "description": "快照头和明细稳定摘要",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 128
    },
    "wms_snapshot_version": {
      "title": "Wms Snapshot Version",
      "description": "WMS 查询版本或时间",
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
