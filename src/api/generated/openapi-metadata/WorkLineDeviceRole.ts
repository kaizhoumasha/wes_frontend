/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineDeviceRole
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineDeviceRoleMetadata = {
  "title": "WorkLineDeviceRole",
  "description": "插件声明的设备角色；前端仅展示名称并选择实体设备。",
  "required": [
    "role_key",
    "display_name"
  ],
  "additionalProperties": false,
  "fields": {
    "display_name": {
      "title": "Display Name",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "role_key": {
      "title": "Role Key",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
