/**
 * 自动生成的 OpenAPI schema 字段元数据: CommandResultBinding
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CommandResultBindingMetadata = {
  "title": "CommandResultBinding",
  "description": "命令结果到事件的静态绑定。",
  "required": [
    "result",
    "event",
    "category"
  ],
  "fields": {
    "result": {
      "title": "Result",
      "description": "命令结果",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "event": {
      "title": "Event",
      "description": "派生事件",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "category": {
      "title": "Category",
      "description": "事件分类",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "classification": {
      "title": "Classification",
      "description": "结果分类",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "terminal": {
      "title": "Terminal",
      "description": "是否终止当前流程",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "next_event": {
      "title": "Next Event",
      "description": "后续事件",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
