/**
 * 自动生成的 OpenAPI schema 字段元数据: APIApplicationResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const APIApplicationResponseMetadata = {
  "title": "APIApplicationResponse",
  "required": [
    "app_name",
    "app_id",
    "remaining_days"
  ],
  "fields": {
    "app_id": {
      "title": "App Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
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
    "created_at": {
      "title": "Created At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": false
    },
    "created_by": {
      "title": "Created By",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "deleted_at": {
      "title": "Deleted At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "deleted_by": {
      "title": "Deleted By",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "description": {
      "title": "Description",
      "description": "应用描述",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    },
    "expires_at": {
      "title": "Expires At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": false,
      "nullable": true
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
    "is_deleted": {
      "title": "Is Deleted",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "permissions": {
      "title": "Permissions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "PermissionResponse"
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
    "remaining_days": {
      "title": "Remaining Days",
      "description": "剩余天数",
      "type": "integer",
      "required": true,
      "nullable": true
    },
    "status": {
      "required": false,
      "nullable": false,
      "default": "active",
      "enum": [
        "active",
        "revoked",
        "expired"
      ],
      "ref": "AppStatus"
    },
    "updated_at": {
      "title": "Updated At",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": true
    },
    "updated_by": {
      "title": "Updated By",
      "type": "integer",
      "required": false,
      "nullable": true
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
    },
    "version": {
      "title": "Version",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    }
  }
} satisfies OpenApiSchemaMetadata
