/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeHoldReleaseEligibility
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeHoldReleaseEligibilityMetadata = {
  "title": "RuntimeHoldReleaseEligibility",
  "description": "Current release decision model.",
  "required": [
    "can_resolve",
    "latest_evidence_hash"
  ],
  "fields": {
    "can_resolve": {
      "title": "Can Resolve",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "required_checks": {
      "title": "Required Checks",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "allowed_resolutions": {
      "title": "Allowed Resolutions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "allowed_material_dispositions": {
      "title": "Allowed Material Dispositions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "latest_evidence_hash": {
      "title": "Latest Evidence Hash",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "reason": {
      "title": "Reason",
      "type": "string",
      "required": false,
      "nullable": true
    }
  }
} satisfies OpenApiSchemaMetadata
