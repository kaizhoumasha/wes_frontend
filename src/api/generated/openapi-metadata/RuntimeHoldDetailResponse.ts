/**
 * 自动生成的 OpenAPI schema 字段元数据: RuntimeHoldDetailResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const RuntimeHoldDetailResponseMetadata = {
  "title": "RuntimeHoldDetailResponse",
  "description": "Runtime Hold detail response.",
  "required": [
    "summary",
    "source",
    "evidence_snapshot_json",
    "release_evidence_json",
    "release_eligibility"
  ],
  "fields": {
    "summary": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeHoldSummary"
    },
    "source": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeHoldSource"
    },
    "evidence_snapshot_json": {
      "title": "Evidence Snapshot Json",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "release_evidence_json": {
      "title": "Release Evidence Json",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "failed_command_evidence": {
      "required": false,
      "nullable": true,
      "ref": "FailedCommandEvidence"
    },
    "release_eligibility": {
      "required": true,
      "nullable": false,
      "ref": "RuntimeHoldReleaseEligibility"
    },
    "blockers": {
      "title": "Blockers",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "RuntimeHoldBlocker"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
