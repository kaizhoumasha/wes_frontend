/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneSceneGeneratedFrom
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneSceneGeneratedFromMetadata = {
  "title": "PlaneSceneGeneratedFrom",
  "description": "Scene v2 的重新生成触发依据；用于排查 revision 变化原因。",
  "required": [
    "workline_version"
  ],
  "additionalProperties": false,
  "fields": {
    "plugin_version": {
      "title": "Plugin Version",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "workline_version": {
      "title": "Workline Version",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
