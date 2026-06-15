/**
 * 自动生成的 OpenAPI schema 字段元数据: RackPosition
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackPositionMetadata = {
  "title": "RackPosition",
  "description": "WES 管理的货架停靠位/库存事实锚点，不代表泛化物理位置。",
  "required": [
    "code",
    "role",
    "station_code",
    "carrier_capability"
  ],
  "fields": {
    "code": {
      "title": "Code",
      "description": "WES 管理货架停靠位编码，也是库存事实锚点编码",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "role": {
      "title": "Role",
      "description": "货架停靠位业务角色",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "station_code": {
      "title": "Station Code",
      "description": "插件内 station/工作位逻辑编码",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "carrier_capability": {
      "description": "货架停靠位承载能力",
      "required": true,
      "nullable": false,
      "ref": "RackPositionCarrierCapability"
    }
  }
} satisfies OpenApiSchemaMetadata
