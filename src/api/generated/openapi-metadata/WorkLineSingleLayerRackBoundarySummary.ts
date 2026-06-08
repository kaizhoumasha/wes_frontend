/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineSingleLayerRackBoundarySummary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineSingleLayerRackBoundarySummaryMetadata = {
  "title": "WorkLineSingleLayerRackBoundarySummary",
  "description": "插件声明的货架承接边界。",
  "required": [
    "station_code",
    "position_code",
    "rack_kind",
    "station_role",
    "business_demand_type",
    "wms_operation_type",
    "snapshot_kind",
    "lease_scope"
  ],
  "fields": {
    "station_code": {
      "title": "Station Code",
      "description": "插件内 station/工作位逻辑编码",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "position_code": {
      "title": "Position Code",
      "description": "WMS/RCS 约定的逻辑位置编码",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "rack_kind": {
      "title": "Rack Kind",
      "description": "承接货架类型",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "station_role": {
      "title": "Station Role",
      "description": "该边界在插件业务中的承接角色",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "business_demand_type": {
      "title": "Business Demand Type",
      "description": "驱动该边界的业务需求类型",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "wms_operation_type": {
      "title": "Wms Operation Type",
      "description": "由 WMS 转发的货架运输 operation 类型",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "snapshot_kind": {
      "title": "Snapshot Kind",
      "description": "WES 需要读取的 active 快照类型",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "lease_scope": {
      "title": "Lease Scope",
      "description": "WES 业务预占范围",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
