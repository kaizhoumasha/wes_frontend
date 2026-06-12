/**
 * 自动生成的 OpenAPI schema 字段元数据: ResourceBoundary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResourceBoundaryMetadata = {
  "title": "ResourceBoundary",
  "description": "插件声明的资源边界。",
  "required": [
    "position_code",
    "rack_kind",
    "business_demand_type",
    "wms_operation_type",
    "snapshot_kind",
    "lease_scope"
  ],
  "fields": {
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
