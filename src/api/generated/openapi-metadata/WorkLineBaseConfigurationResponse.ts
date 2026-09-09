/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineBaseConfigurationResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineBaseConfigurationResponseMetadata = {
  "title": "WorkLineBaseConfigurationResponse",
  "description": "已保存基础配置，版本与业务装配共用。",
  "required": [
    "version",
    "device_codes",
    "positions",
    "workline_id",
    "is_active"
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
    "is_active": {
      "title": "Is Active",
      "type": "boolean",
      "required": true,
      "nullable": false
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
    },
    "workline_id": {
      "title": "Workline Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
