/**
 * 自动生成的 OpenAPI schema 字段元数据: CommandBinding
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CommandBindingMetadata = {
  "title": "CommandBinding",
  "description": "插件命令及目标设备角色。",
  "required": [
    "command",
    "target_device_role"
  ],
  "fields": {
    "command": {
      "title": "Command",
      "description": "命令类型",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "target_device_role": {
      "title": "Target Device Role",
      "description": "目标设备角色",
      "type": "string",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
