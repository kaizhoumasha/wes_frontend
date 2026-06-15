/**
 * 自动生成的 OpenAPI schema 字段元数据: IntegrationDebugCaseResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://127.0.0.1:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const IntegrationDebugCaseResponseMetadata = {
  "title": "IntegrationDebugCaseResponse",
  "description": "集成调试案件定位结果。",
  "required": [
    "case_id",
    "status",
    "phase",
    "verdict",
    "owner",
    "severity",
    "recoverability",
    "summary"
  ],
  "fields": {
    "case_id": {
      "title": "Case Id",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "session_id": {
      "title": "Session Id",
      "type": "integer",
      "required": false,
      "nullable": true
    },
    "session_code": {
      "title": "Session Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "trace_id": {
      "title": "Trace Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "request_id": {
      "title": "Request Id",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "command_code": {
      "title": "Command Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "status": {
      "title": "Status",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "phase": {
      "title": "Phase",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "verdict": {
      "title": "Verdict",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "blocking_domain": {
      "title": "Blocking Domain",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "blocking_code": {
      "title": "Blocking Code",
      "type": "string",
      "required": false,
      "nullable": true
    },
    "owner": {
      "title": "Owner",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "severity": {
      "title": "Severity",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "recoverability": {
      "title": "Recoverability",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "summary": {
      "title": "Summary",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "facts": {
      "title": "Facts",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "stage_checks": {
      "title": "Stage Checks",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "IntegrationDebugStageCheck"
      }
    },
    "evidence_links": {
      "title": "Evidence Links",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "IntegrationDebugEvidenceLink"
      }
    },
    "next_actions": {
      "title": "Next Actions",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "IntegrationDebugNextAction"
      }
    },
    "trace_detail": {
      "required": false,
      "nullable": true,
      "ref": "TraceDetailResponse"
    }
  }
} satisfies OpenApiSchemaMetadata
