/**
 * 自动生成的 OpenAPI schema 字段元数据: CreateRunRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CreateRunRequestMetadata = {
  "title": "CreateRunRequest",
  "required": [
    "workline_code",
    "profile",
    "environment_label",
    "device_code"
  ],
  "additionalProperties": false,
  "fields": {
    "device_code": {
      "title": "Device Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "environment_label": {
      "title": "Environment Label",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 80
    },
    "profile": {
      "required": true,
      "nullable": false,
      "enum": [
        "CONTRACT_SIMULATION",
        "DEVICE_INTEGRATION",
        "FULL_SITE_INTEGRATION"
      ],
      "ref": "IntegrationDebugProfile"
    },
    "rack_id": {
      "title": "Rack Id",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "workline_code": {
      "title": "Workline Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    }
  }
} satisfies OpenApiSchemaMetadata
