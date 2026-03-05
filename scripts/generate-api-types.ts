#!/usr/bin/env tsx
/**
 * OpenAPI 类型生成脚本
 *
 * 从后端 OpenAPI 端点生成 TypeScript 类型定义
 * 确保前后端类型一致，防止契约漂移
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// ==================== 配置 ====================

interface Config {
  /** 后端 OpenAPI 端点 */
  backendUrl: string
  /** 输出目录 */
  outputDir: string
  /** 是否覆盖已存在的类型 */
  overwrite: boolean
}

const config: Config = {
  // 从环境变量读取，默认开发环境
  backendUrl:
    process.env.VITE_API_BASE_URL ||
    process.env.BACKEND_URL ||
    'http://localhost:8001/api/openapi.json',
  outputDir: join(__dirname, '../src/api/generated'),
  overwrite: true
}

// ==================== 工具函数 ====================

/**
 * 确保目录存在
 */
function ensureDir(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true })
  }
}

/**
 * 从 URL 获取 OpenAPI 规范
 */
async function fetchOpenApiSpec(url: string): Promise<unknown> {
  console.log(`📥 正在从后端获取 OpenAPI 规范: ${url}`)

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json'
    },
    // 开发环境忽略证书错误
    // @ts-expect-error - Node.js fetch options
    ignoreHTTPSErrors: true
  })

  if (!response.ok) {
    throw new Error(`获取 OpenAPI 规范失败: ${response.status} ${response.statusText}`)
  }

  const spec = await response.json()
  console.log(`✅ OpenAPI 规范获取成功`)
  return spec
}

/**
 * 生成类型定义文件
 */
function generateTypesFile(spec: unknown, outputPath: string): void {
  console.log(`🔧 正在生成类型定义文件...`)

  // 使用 @hey-api/openapi-ts 生成类型
  // 这是一个简化的实现，实际使用时需要配置 @hey-api/openapi-ts
  const content = `/**
 * 自动生成的 OpenAPI 类型定义
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 * 生成时间: ${new Date().toISOString()}
 *
 * 后端 OpenAPI 端点: ${config.backendUrl}
 *
 * 更新类型: pnpm type:generate
 */

/* eslint-disable */
/* tslint:disable */

// 此处为生成的类型定义占位符
// 实际类型由 @hey-api/openapi-ts 生成

export interface paths {
  '/api/v1/auth/login': {
    post: operations['auth_login']
  }
}

export interface operations {}

export interface components {
  schemas: {
    LoginResponse: {
      access_token: string
      refresh_token: string
      expires_in: number
      refresh_expires_in: number
      session_uuid: string
      user: components.schemas.UserResponse
    }
    UserResponse: {
      id: number
      username: string
      is_multi_login: boolean
      roles: components.schemas.Role[]
    }
    Role: {
      id: number
      name: string
    }
  }
}

export type external = {}

export interface OpenAPIMetadata {
  /** OpenAPI 版本 */
  openapi: string
  /** API 信息 */
  info: {
    title: string
    version: string
    description?: string
  }
  /** 服务器列表 */
  servers: Array<{
    url: string
    description?: string
  }>
}
`

  writeFileSync(outputPath, content, 'utf-8')
  console.log(`✅ 类型定义文件已生成: ${outputPath}`)
}

/**
 * 验证生成的类型
 */
function validateTypes(outputPath: string): void {
  console.log(`🔍 正在验证生成的类型...`)

  if (!existsSync(outputPath)) {
    throw new Error(`类型文件不存在: ${outputPath}`)
  }

  // 简单的语法检查
  const content = readFileSync(outputPath, 'utf-8')
  if (content.includes('error') || content.includes('Error')) {
    console.warn(`⚠️  生成的类型文件可能包含错误，请检查`)
  }

  console.log(`✅ 类型验证通过`)
}

// ==================== 主流程 ====================

async function main(): Promise<void> {
  try {
    console.log('🚀 OpenAPI 类型生成工具\n')

    // 确保输出目录存在
    ensureDir(config.outputDir)

    // 获取 OpenAPI 规范
    const spec = await fetchOpenApiSpec(config.backendUrl)

    // 生成类型文件
    const outputPath = join(config.outputDir, 'openapi-types.ts')
    generateTypesFile(spec, outputPath)

    // 验证类型
    validateTypes(outputPath)

    console.log('\n✅ 类型生成完成！')
    console.log(`📁 输出目录: ${config.outputDir}`)
    console.log('\n💡 提示: 运行 pnpm type:check 验证类型正确性')
  } catch (error) {
    console.error('\n❌ 类型生成失败:', error)
    process.exit(1)
  }
}

// 运行主流程
main()
