/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneResourceGroups
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneResourceGroupsMetadata = {
  "title": "PlaneResourceGroups",
  "description": "按 Definition 资源类型分组，顺序即展示顺序。",
  "required": [],
  "additionalProperties": false,
  "fields": {
    "DEVICE_ROLE": {
      "title": "Device Role",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "PlaneResource"
      }
    },
    "POSITION_SLOT": {
      "title": "Position Slot",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "PlaneResource"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
