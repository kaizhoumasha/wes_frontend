/**
 * auth 管理 API
 *
 * ⚠️  此文件由 scripts/generate-api-types.ts 自动生成
 * 自动生成时间: 2026-03-30T06:42:06.044Z
 *
 * 如需添加自定义方法，请在以下占位符区域添加：
 * // ==================== CUSTOM METHODS ====================
 */

import type { components } from '@/api/generated/openapi-types'

// 类型导出
export type UserInfo = components['schemas']['UserSimpleResponse']
export type ApiPermissionInfo = components['schemas']['ApiPermissionInfo']

import {
} from '@/api/base/crud-api'
import { authGeneratedApi } from '@/api/generated/api-clients'

export const authApi = authGeneratedApi

// ==================== CUSTOM METHODS ====================
// 在此区域添加自定义方法（仅追加，不覆盖）
// ======================================================

// ==================== CUSTOM CONFIG START ====================
// 在此区域添加自定义配置（如缓存策略、超时设置等）
// ===========================================================
// ==================== CUSTOM CONFIG END ====================
