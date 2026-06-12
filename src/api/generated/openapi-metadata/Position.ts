/**
 * 自动生成的 OpenAPI schema 字段元数据: Position
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PositionMetadata = {
  "title": "Position",
  "description": "插件声明的逻辑位置。",
  "required": [
    "code",
    "role",
    "station_code",
    "carrier_capability"
  ],
  "fields": {
    "code": {
      "title": "Code",
      "description": "位置编码",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "role": {
      "title": "Role",
      "description": "位置业务角色",
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
      "description": "位置承载能力",
      "required": true,
      "nullable": false,
      "ref": "PositionCarrierCapability"
    }
  }
} satisfies OpenApiSchemaMetadata
