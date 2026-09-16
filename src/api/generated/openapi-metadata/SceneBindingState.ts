/**
 * 自动生成的 OpenAPI schema 字段元数据: SceneBindingState
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const SceneBindingStateMetadata = {
  "title": "SceneBindingState",
  "description": "Scene v2 资源行的静态绑定状态；不表达动态过程状态。",
  "required": [],
  "fields": {
    "__enum": {
      "title": "SceneBindingState",
      "description": "Scene v2 资源行的静态绑定状态；不表达动态过程状态。",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "BOUND",
        "UNBOUND",
        "INVALID"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
