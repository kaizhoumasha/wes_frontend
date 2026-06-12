/**
 * 自动生成的 OpenAPI schema 字段元数据: EventBinding
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const EventBindingMetadata = {
  "title": "EventBinding",
  "description": "插件声明的业务事件及来源设备角色。",
  "required": [
    "event",
    "category"
  ],
  "fields": {
    "event": {
      "title": "Event",
      "description": "事件类型",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "source_device_roles": {
      "title": "Source Device Roles",
      "description": "来源设备角色",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "category": {
      "title": "Category",
      "description": "事件分类",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "payload_schema_ref": {
      "title": "Payload Schema Ref",
      "description": "事件 payload schema 引用",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
