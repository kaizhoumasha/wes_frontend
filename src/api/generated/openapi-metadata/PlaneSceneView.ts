/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneSceneView
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneSceneViewMetadata = {
  "title": "PlaneSceneView",
  "description": "WorkLine plane static scene view.",
  "required": [
    "schema_version",
    "workline_code",
    "nodes",
    "edges"
  ],
  "additionalProperties": false,
  "fields": {
    "schema_version": {
      "title": "Schema Version",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "workline_code": {
      "title": "Workline Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "nodes": {
      "title": "Nodes",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "PlaneNode"
      }
    },
    "edges": {
      "title": "Edges",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "PlaneEdge"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
