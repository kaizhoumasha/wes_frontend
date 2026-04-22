#!/usr/bin/env tsx
/**
 * 菜单清单生成脚本
 *
 * 基于前端路由定义生成后端菜单同步所需的 manifest JSON。
 *
 * 使用方式：
 *   pnpm menu:generate
 *   pnpm exec tsx scripts/generate-menu-manifest.ts --out artifacts/menu-manifest.json
 */

import { generateMenuManifest } from './lib/menu-manifest'

interface CliOptions {
  out?: string
}

function parseArgs(argv: string[]): CliOptions {
  let out: string | undefined

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === '--out') {
      const value = argv[index + 1]
      if (!value) {
        throw new Error('`--out` 缺少文件路径参数')
      }
      out = value
      index += 1
      continue
    }

    throw new Error(`不支持的参数: ${arg}`)
  }

  return { out }
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2))

  console.log('🚀 菜单清单生成工具\n')

  const { entries, outputPath } = generateMenuManifest(options.out)
  console.log(`📄 输出文件: ${outputPath}`)
  console.log(`📊 已生成菜单 ${entries.length} 条`)
  console.log('\n✅ 菜单清单生成完成')
}

main().catch(error => {
  console.error('\n❌ 菜单清单生成失败:', error)
  process.exit(1)
})
