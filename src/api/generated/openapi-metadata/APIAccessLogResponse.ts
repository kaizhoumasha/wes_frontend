/**
 * 自动生成的 OpenAPI schema 字段元数据: APIAccessLogResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const APIAccessLogResponseMetadata = {
  "title": "APIAccessLogResponse",
  "required": [
    "app_id",
    "app_name",
    "request_id",
    "method",
    "path",
    "status_code",
    "response_time_ms",
    "ip_address",
    "id",
    "created_at"
  ],
  "fields": {
    "app_id": {
      "title": "App Id",
      "description": "应用ID",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 50
    },
    "app_name": {
      "title": "App Name",
      "description": "应用名称",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 100
    },
    "request_id": {
      "title": "Request Id",
      "description": "请求ID",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 50
    },
    "method": {
      "title": "Method",
      "description": "HTTP方法",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 10
    },
    "path": {
      "title": "Path",
      "description": "请求路径",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 500
    },
    "status_code": {
      "title": "Status Code",
      "description": "响应状态码",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "response_time_ms": {
      "title": "Response Time Ms",
      "description": "响应时间(毫秒)",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "ip_address": {
      "title": "Ip Address",
      "description": "客户端IP",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 50
    },
    "user_agent": {
      "title": "User Agent",
      "description": "User-Agent",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    },
    "error_message": {
      "title": "Error Message",
      "description": "错误信息",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 1000
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "created_at": {
      "title": "Created At",
      "type": "string",
      "format": "date-time",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
