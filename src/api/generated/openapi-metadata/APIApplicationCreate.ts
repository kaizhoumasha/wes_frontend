/**
 * 自动生成的 OpenAPI schema 字段元数据: APIApplicationCreate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const APIApplicationCreateMetadata = {
  "title": "APIApplicationCreate",
  "required": [
    "app_name"
  ],
  "additionalProperties": false,
  "fields": {
    "app_name": {
      "title": "App Name",
      "description": "应用名称",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 100
    },
    "app_type": {
      "description": "应用类型",
      "required": false,
      "nullable": false,
      "default": "ECS",
      "enum": [
        "ECS",
        "RCS",
        "WMS",
        "Third-Party"
      ],
      "ref": "AppType"
    },
    "description": {
      "title": "Description",
      "description": "应用描述",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    },
    "ip_whitelist": {
      "title": "Ip Whitelist",
      "description": "IP白名单",
      "type": "array",
      "required": false,
      "nullable": true,
      "items": {
        "type": "string"
      }
    },
    "rate_limit_per_hour": {
      "title": "Rate Limit Per Hour",
      "description": "每小时请求限制",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 5000,
      "minimum": 1,
      "maximum": 1000000
    },
    "rate_limit_per_minute": {
      "title": "Rate Limit Per Minute",
      "description": "每分钟请求限制",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 100,
      "minimum": 1,
      "maximum": 10000
    },
    "validity_period": {
      "description": "有效期时长",
      "required": false,
      "nullable": false,
      "default": "1y",
      "enum": [
        "1d",
        "1w",
        "1m",
        "6m",
        "1y",
        "never"
      ],
      "ref": "ValidityPeriod"
    }
  }
} satisfies OpenApiSchemaMetadata
