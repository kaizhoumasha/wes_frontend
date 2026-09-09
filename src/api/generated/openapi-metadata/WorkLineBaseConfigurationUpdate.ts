/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineBaseConfigurationUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineBaseConfigurationUpdateMetadata = {
  "title": "WorkLineBaseConfigurationUpdate",
  "description": "稳定的工作位与物理设备全集；不包含插件配置。",
  "required": [
    "version",
    "device_codes",
    "positions"
  ],
  "additionalProperties": false,
  "fields": {
    "device_codes": {
      "title": "Device Codes",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "positions": {
      "title": "Positions",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "WorkLinePositionInput"
      }
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
