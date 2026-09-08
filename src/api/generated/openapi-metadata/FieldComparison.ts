/**
 * 自动生成的 OpenAPI schema 字段元数据: FieldComparison
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const FieldComparisonMetadata = {
  "title": "FieldComparison",
  "required": [
    "side",
    "path",
    "expected_rule",
    "actual_present",
    "verdict",
    "source"
  ],
  "additionalProperties": false,
  "fields": {
    "actual_present": {
      "title": "Actual Present",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "actual_value": {
      "title": "Actual Value",
      "required": false,
      "nullable": false
    },
    "expected_rule": {
      "title": "Expected Rule",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "expected_value": {
      "title": "Expected Value",
      "required": false,
      "nullable": false
    },
    "path": {
      "title": "Path",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "side": {
      "title": "Side",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "request",
        "response"
      ]
    },
    "source": {
      "title": "Source",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "verdict": {
      "title": "Verdict",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "PASS",
        "ERROR",
        "NOT_VALIDATED"
      ]
    }
  }
} satisfies OpenApiSchemaMetadata
