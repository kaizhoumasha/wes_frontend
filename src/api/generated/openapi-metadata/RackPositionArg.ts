/**
 * 自动生成的 OpenAPI schema 字段元数据: RackPositionArg
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RackPositionArgMetadata = {
  "title": "RackPositionArg",
  "description": "命令中的货架位参数声明。",
  "required": [
    "name",
    "role"
  ],
  "fields": {
    "name": {
      "title": "Name",
      "description": "参数名",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "role": {
      "title": "Role",
      "description": "参数业务角色",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "required": {
      "title": "Required",
      "description": "是否必填",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": true
    },
    "rack_position_ref": {
      "title": "Rack Position Ref",
      "description": "静态货架位引用",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "source": {
      "description": "动态来源",
      "required": false,
      "nullable": true,
      "ref": "RackPositionArgSource"
    }
  }
} satisfies OpenApiSchemaMetadata
