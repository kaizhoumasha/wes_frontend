/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineUpdate
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineUpdateMetadata = {
  "title": "WorkLineUpdate",
  "description": "作业线更新 Schema。",
  "required": [
    "version"
  ],
  "additionalProperties": false,
  "fields": {
    "config": {
      "title": "Config",
      "description": "工作线通用配置",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "description": {
      "title": "Description",
      "description": "作业线描述",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 500
    },
    "diagnostic_profile": {
      "title": "Diagnostic Profile",
      "description": "工作线诊断配置（软件/硬件分类偏好、展示策略等）",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "line_code": {
      "title": "Line Code",
      "description": "作业线编码（业务主键）",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 50
    },
    "line_name": {
      "title": "Line Name",
      "description": "作业线名称",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "line_type": {
      "description": "作业线类型",
      "required": false,
      "nullable": true,
      "enum": [
        "AUTO",
        "MANUAL",
        "HYBRID"
      ],
      "ref": "LineType"
    },
    "run_mode": {
      "description": "工作线运行模式",
      "required": false,
      "nullable": true,
      "enum": [
        "AUTO",
        "MANUAL",
        "SIMULATION"
      ],
      "ref": "WorkLineRunMode"
    },
    "runtime_config_json": {
      "title": "Runtime Config Json",
      "description": "工作线运行时配置（重试、超时、会话归属等）",
      "type": "object",
      "required": false,
      "nullable": true
    },
    "version": {
      "title": "Version",
      "description": "乐观锁版本号，更新时必传",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "zone_name": {
      "title": "Zone Name",
      "description": "区域名称",
      "type": "string",
      "required": false,
      "nullable": true,
      "maxLength": 100
    }
  }
} satisfies OpenApiSchemaMetadata
