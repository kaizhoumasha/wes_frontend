/**
 * 自动生成的 OpenAPI schema 字段元数据: WorkLinePluginManifestSummary
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: http://localhost:8001/api/openapi.json
 *
 * 更新类型: pnpm generate:types
 */

import type { OpenApiSchemaMetadata } from '../openapi-metadata-types'

export const WorkLinePluginManifestSummaryMetadata = {
  "title": "WorkLinePluginManifestSummary",
  "description": "单插件 manifest 摘要。",
  "required": [
    "plugin_key",
    "contract_version"
  ],
  "fields": {
    "plugin_key": {
      "title": "Plugin Key",
      "description": "工作线执行插件标识",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "contract_version": {
      "title": "Contract Version",
      "description": "插件契约版本",
      "type": "string",
      "required": true,
      "nullable": false
    },
    "required_device_roles": {
      "title": "Required Device Roles",
      "description": "必需设备角色",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "DeviceRoleRequirementOption"
      }
    },
    "event_source_roles": {
      "title": "Event Source Roles",
      "description": "事件来源设备角色映射",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "command_target_roles": {
      "title": "Command Target Roles",
      "description": "命令目标设备角色映射",
      "type": "object",
      "required": false,
      "nullable": false
    },
    "supported_events": {
      "title": "Supported Events",
      "description": "支持的事件",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "supported_commands": {
      "title": "Supported Commands",
      "description": "支持的命令",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "type": "string"
      }
    },
    "single_layer_boundaries": {
      "title": "Single Layer Boundaries",
      "description": "插件声明的货架承接边界",
      "type": "array",
      "required": false,
      "nullable": false,
      "items": {
        "ref": "WorkLineSingleLayerRackBoundarySummary"
      }
    }
  }
} satisfies OpenApiSchemaMetadata
