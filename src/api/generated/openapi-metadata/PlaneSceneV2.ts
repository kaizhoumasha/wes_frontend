/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneSceneV2
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneSceneV2Metadata = {
  "title": "PlaneSceneV2",
  "description": "资源中心的 WorkLine plane 静态 scene；与 plane.scene.v1 并存，互不改变语义。",
  "required": [
    "schema_version",
    "scene_revision",
    "workline",
    "generated_from",
    "resource_groups",
    "diagnostics"
  ],
  "additionalProperties": false,
  "fields": {
    "diagnostics": {
      "required": true,
      "nullable": false,
      "ref": "PlaneSceneDiagnostics"
    },
    "generated_from": {
      "required": true,
      "nullable": false,
      "ref": "PlaneSceneGeneratedFrom"
    },
    "resource_groups": {
      "required": true,
      "nullable": false,
      "ref": "PlaneResourceGroups"
    },
    "scene_revision": {
      "title": "Scene Revision",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 64
    },
    "schema_version": {
      "title": "Schema Version",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "workline": {
      "required": true,
      "nullable": false,
      "ref": "PlaneWorkLineIdentityV2"
    }
  }
} satisfies OpenApiSchemaMetadata
