/**
 * 自动生成的 OpenAPI schema 字段元数据: AuditLogResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const AuditLogResponseMetadata = {
  "title": "AuditLogResponse",
  "description": "AuditLog 响应 Schema",
  "required": [
    "trace_id",
    "method",
    "title",
    "path",
    "ip",
    "user_agent",
    "code",
    "cost_time",
    "id"
  ],
  "fields": {
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 64
    },
    "username": {
      "title": "Username",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 32
    },
    "method": {
      "title": "Method",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 10
    },
    "title": {
      "title": "Title",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 100
    },
    "path": {
      "title": "Path",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 200
    },
    "ip": {
      "title": "Ip",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 64
    },
    "country": {
      "title": "Country",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 64
    },
    "region": {
      "title": "Region",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 64
    },
    "city": {
      "title": "City",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 64
    },
    "user_agent": {
      "title": "User Agent",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 500
    },
    "os": {
      "title": "Os",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 64
    },
    "browser": {
      "title": "Browser",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 64
    },
    "device": {
      "title": "Device",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 64
    },
    "args": {
      "title": "Args",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "status": {
      "description": "操作状态",
      "required": false,
      "nullable": false,
      "default": "SUCCESS",
      "enum": [
        "FAIL",
        "SUCCESS"
      ],
      "ref": "OperaStatus"
    },
    "code": {
      "title": "Code",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 20
    },
    "msg": {
      "title": "Msg",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "object_type": {
      "title": "Object Type",
      "description": "审计对象类型",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    },
    "action": {
      "title": "Action",
      "description": "审计动作",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 50
    },
    "object_id": {
      "title": "Object Id",
      "description": "审计对象标识",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 64
    },
    "change_summary": {
      "title": "Change Summary",
      "description": "变更摘要",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 255
    },
    "cost_time": {
      "title": "Cost Time",
      "type": "number",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "opera_time": {
      "title": "Opera Time",
      "type": "string",
      "format": "date-time",
      "required": false,
      "nullable": false
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    }
  }
} satisfies OpenApiSchemaMetadata
