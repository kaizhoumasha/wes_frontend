/**
 * 自动生成的 OpenAPI schema 字段元数据: ExchangeSummary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ExchangeSummaryMetadata = {
  "title": "ExchangeSummary",
  "required": [
    "attempt_id",
    "observed_at",
    "direction"
  ],
  "additionalProperties": false,
  "fields": {
    "attempt_id": {
      "title": "Attempt Id",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 64
    },
    "business_reference": {
      "title": "Business Reference",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 128
    },
    "contract_status": {
      "title": "Contract Status",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "NOT_VALIDATED",
      "enum": [
        "PASS",
        "ERROR",
        "NOT_VALIDATED"
      ]
    },
    "direction": {
      "title": "Direction",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "WMS_TO_WES",
        "WES_TO_WMS"
      ]
    },
    "elapsed_ms": {
      "title": "Elapsed Ms",
      "type": "number",
      "required": false,
      "nullable": true
    },
    "error_code": {
      "title": "Error Code",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 128
    },
    "exchange_id": {
      "title": "Exchange Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "incomplete": {
      "title": "Incomplete",
      "type": "boolean",
      "required": false,
      "nullable": false,
      "default": false
    },
    "method": {
      "title": "Method",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "POST",
      "maxLength": 8
    },
    "observed_at": {
      "title": "Observed At",
      "type": "string",
      "required": true,
      "nullable": false,
      "maxLength": 40
    },
    "operation": {
      "title": "Operation",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 128
    },
    "operation_id": {
      "title": "Operation Id",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 128
    },
    "path": {
      "title": "Path",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 256
    },
    "result": {
      "title": "Result",
      "type": "string",
      "required": false,
      "nullable": false,
      "default": "NOT_OBSERVED",
      "maxLength": 64
    },
    "status_code": {
      "title": "Status Code",
      "type": "integer",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
