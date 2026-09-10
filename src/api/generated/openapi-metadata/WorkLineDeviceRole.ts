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
  "required": [
    "role_key",
    "display_name"
  ],
  "fields": {
    "display_name": {
      "title": "Display Name",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "role_key": {
      "title": "Role Key",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
