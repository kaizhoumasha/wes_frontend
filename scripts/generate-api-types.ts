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
import openapiTS, { astToString } from 'openapi-typescript'
import ts from 'typescript'

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

function writeFileIfChanged(path: string, content: string): boolean {
  const previous = existsSync(path) ? readFileSync(path, 'utf-8') : null
  if (previous === content) {
    return false
  }

  writeFileSync(path, content, 'utf-8')
  return true
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
async function generateTypesFile(spec: unknown, outputPath: string): Promise<boolean> {
  console.log(`🔧 正在生成类型定义文件...`)

  const ast = await openapiTS(spec as Parameters<typeof openapiTS>[0], {
    alphabetize: true
  })

  const generatedTypes = astToString(ast)
  const content = `/**
 * 自动生成的 OpenAPI 类型定义
 *
 * ⚠️  请勿手动编辑此文件
 * 此文件由 scripts/generate-api-types.ts 自动生成
 *
 * 后端 OpenAPI 端点: ${config.backendUrl}
 *
 * 更新类型: pnpm type:generate
 */

/* eslint-disable */
/* tslint:disable */

${generatedTypes}
`

  const changed = writeFileIfChanged(outputPath, content)
  if (changed) {
    console.log(`✅ 类型定义文件已更新: ${outputPath}`)
  } else {
    console.log(`✅ 类型定义无变化: ${outputPath}`)
  }

  return changed
}

/**
 * 验证生成的类型
 */
function validateTypes(outputPath: string): void {
  console.log(`🔍 正在验证生成的类型...`)

  if (!existsSync(outputPath)) {
    throw new Error(`类型文件不存在: ${outputPath}`)
  }

  const content = readFileSync(outputPath, 'utf-8')

  const result = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ESNext
    },
    fileName: outputPath,
    reportDiagnostics: true
  })

  if (result.diagnostics?.length) {
    const message = ts.formatDiagnosticsWithColorAndContext(result.diagnostics, {
      getCanonicalFileName: (fileName) => fileName,
      getCurrentDirectory: () => process.cwd(),
      getNewLine: () => '\n'
    })
    throw new Error(`生成的类型文件存在语法问题:\n${message}`)
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
    const changed = await generateTypesFile(spec, outputPath)

    // 验证类型
    validateTypes(outputPath)

    console.log(changed ? '\n✅ 类型生成完成！' : '\n✅ 类型无变化，未更新生成文件')
    console.log(`📁 输出目录: ${config.outputDir}`)
    console.log('\n💡 提示: 运行 pnpm type:check 验证类型正确性')
  } catch (error) {
    console.error('\n❌ 类型生成失败:', error)
    process.exit(1)
  }
}

// 运行主流程
main()
