/**
 * 自动生成的 OpenAPI schema 字段元数据: PlaneResourceBinding
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const PlaneResourceBindingMetadata = {
  "title": "PlaneResourceBinding",
  "description": "Scene v2 资源行的实际绑定；只暴露编码、名称和启用状态。",
  "required": [
    "code"
  ],
  "additionalProperties": false,
  "fields": {
    "code": {
      "title": "Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 120
    },
    "enabled": {
      "title": "Enabled",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": true
    },
    "name": {
      "title": "Name",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 120
    },
    "type": {
      "title": "Type",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 40
    }
  }
} satisfies OpenApiSchemaMetadata
