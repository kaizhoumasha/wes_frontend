/**
 * 自动生成的 OpenAPI schema 字段元数据: IntegrationDebugStageCheck
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const IntegrationDebugStageCheckMetadata = {
  "title": "IntegrationDebugStageCheck",
  "description": "集成链路单阶段定位结果。",
  "required": [
    "key",
    "label",
    "state"
  ],
  "fields": {
    "key": {
      "title": "Key",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "label": {
      "title": "Label",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "state": {
      "title": "State",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "evidence_count": {
      "title": "Evidence Count",
      "type": "integer",
      "required": false,
      "nullable": false,
      "default": 0
    },
    "primary_evidence": {
      "title": "Primary Evidence",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "links": {
      "title": "Links",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
