/**
 * 自动生成的 OpenAPI schema 字段元数据: ResolveRuntimeHoldRequest
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const ResolveRuntimeHoldRequestMetadata = {
  "title": "ResolveRuntimeHoldRequest",
  "description": "Resolve Runtime Hold request.",
  "required": [
    "resolution",
    "checks",
    "operator_note",
    "material_disposition",
    "hold_version",
    "latest_evidence_hash"
  ],
  "additionalProperties": false,
  "fields": {
    "resolution": {
      "title": "Resolution",
      "description": "Session 结论",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "COMPLETED",
        "FAILED",
        "CANCELLED"
      ]
    },
    "checks": {
      "title": "Checks",
      "description": "服务端要求的 release checklist",
      "type": "object",
      "required": true,
      "nullable": false
    },
    "operator_note": {
      "title": "Operator Note",
      "description": "现场确认说明",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 1000
    },
    "material_disposition": {
      "title": "Material Disposition",
      "description": "物料处置",
      "type": "string",
      "required": true,
      "nullable": false,
      "enum": [
        "CONTINUE",
        "RETURN_TO_NG"
      ]
    },
    "ng_reason": {
      "description": "RETURN_TO_NG 时必填",
      "required": false,
      "nullable": true,
      "ref": "NgReasonInput"
    },
    "physical_handoff_evidence": {
      "description": "RETURN_TO_NG 时必填；只包含客户端可提交证据",
      "required": false,
      "nullable": true,
      "ref": "PhysicalHandoffEvidenceInput"
    },
    "result_payload": {
      "title": "Result Payload",
      "description": "CONTINUE/COMPLETED 可补充业务结果",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "hold_version": {
      "title": "Hold Version",
      "description": "RuntimeHold 乐观锁版本",
      "type": "integer",
      "required": true,
      "nullable": false,
      "minimum": 0
    },
    "latest_evidence_hash": {
      "title": "Latest Evidence Hash",
      "description": "页面看到的最新证据 hash",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 200
    }
  }
} satisfies OpenApiSchemaMetadata
