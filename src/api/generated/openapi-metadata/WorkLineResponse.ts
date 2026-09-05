/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLineResponse
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLineResponseMetadata = {
  "title": "WorkLineResponse",
  "description": "作业线响应 Schema。",
  "required": [
    "line_code",
    "line_name",
    "line_type",
    "id",
    "version",
    "is_active"
  ],
  "fields": {
    "config": {
      "title": "Config",
      "description": "当前业务插件配置",
      "type": "object",
      "required": false,
      "nullable": false
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
      "nullable": false
    },
    "id": {
      "title": "Id",
      "type": "integer",
      "required": true,
      "nullable": false
    },
    "is_active": {
      "title": "Is Active",
      "type": "boolean",
      "required": true,
      "nullable": false
    },
    "line_code": {
      "title": "Line Code",
      "description": "作业线编码（业务主键）",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 50
    },
    "line_name": {
      "title": "Line Name",
      "description": "作业线名称",
      "type": "string",
      "required": true,
      "nullable": false,
      "minLength": 1,
      "maxLength": 100
    },
    "line_type": {
      "description": "作业线类型",
      "required": true,
      "nullable": false,
      "enum": [
        "AUTO",
        "MANUAL",
        "HYBRID"
      ],
      "ref": "LineType"
    },
    "plugin_key": {
      "title": "Plugin Key",
      "description": "业务插件标识",
      "type": "string",
      "required": false,
      "nullable": true,
      "minLength": 1,
      "maxLength": 100
    },
    "run_mode": {
      "description": "工作线运行模式",
      "required": false,
      "nullable": false,
      "default": "AUTO",
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
      "nullable": false
    },
    "version": {
      "title": "Version",
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
