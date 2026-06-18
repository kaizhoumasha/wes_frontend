/**
 * 自动生成的 OpenAPI schema 字段元数据: CallbackLogSubjectResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const CallbackLogSubjectResponseMetadata = {
  "title": "CallbackLogSubjectResponse",
  "description": "回调主体维度回调日志列表响应。",
  "required": [
    "subject_code",
    "count",
    "items"
  ],
  "fields": {
    "subject_code": {
      "title": "Subject Code",
      "description": "回调主体编码",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "count": {
      "title": "Count",
      "description": "回调日志数量",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "items": {
      "title": "Items",
      "description": "回调日志列表",
      "type": "array",
      "required": true,
      "nullable": false,
      "items": {
        "ref": "CallbackLogResponse"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
