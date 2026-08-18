/**
 * 自动生成的 OpenAPI schema 字段元数据: ResolveEffectReconciliationRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResolveEffectReconciliationRequestMetadata = {
  "title": "ResolveEffectReconciliationRequest",
  "description": "人工 EFFECT 对账决议请求。",
  "required": [
    "operator_note"
  ],
  "additionalProperties": false,
  "fields": {
    "request_id": {
      "title": "Request Id",
      "description": "通用决议稳定幂等请求 ID",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "resolution": {
      "title": "Resolution",
      "description": "非 E03/E07 EFFECT 最终决议",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "obligation_resolution": {
      "description": "E03/E07 同步义务 typed 对账裁决",
      "required": false,
      "nullable": true,
      "ref": "WmsSyncObligationResolution"
    },
    "operator_note": {
      "title": "Operator Note",
      "description": "人工核验说明",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 1000
    }
  }
} satisfies OpenApiSchemaMetadata
