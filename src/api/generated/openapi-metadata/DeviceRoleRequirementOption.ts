/**
 * 自动生成的 OpenAPI schema 字段元数据: DeviceRoleRequirementOption
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const DeviceRoleRequirementOptionMetadata = {
  "title": "DeviceRoleRequirementOption",
  "description": "设备角色要求明细。",
  "required": [
    "role",
    "min_count"
  ],
  "fields": {
    "role": {
      "title": "Role",
      "description": "必需角色名",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "min_count": {
      "title": "Min Count",
      "description": "最小数量限制",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "max_count": {
      "title": "Max Count",
      "description": "最大数量限制",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "capabilities": {
      "title": "Capabilities",
      "description": "要求能力声明",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
