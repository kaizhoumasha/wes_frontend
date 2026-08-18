/**
 * Style Token Invariants
 *
 * 不变量测试 — 锁定当前全局颜色 token 契约。
 * 任一不变量失败即代表 token 体系被破坏。
 *
 * 实现注意:不能依赖单行 `rg` 正则匹配 — 必须解析完整 CSS 自定义属性声明
 * (从属性名到结束分号,包括跨行渐变),否则会漏掉多行声明的违规。
 */

import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join } from 'node:path'

const REPO_ROOT = resolve(__dirname, '../../..')
const GLOBALS_CSS_PATH = join(REPO_ROOT, 'src/assets/styles/globals.css')
const GLOBALS_CSS = readFileSync(GLOBALS_CSS_PATH, 'utf-8')
const SRC_DIR = join(REPO_ROOT, 'src')

const LEGACY_TOKEN_NAMES = [
  'body-bg',
  'body-color',
  'surface-bg',
  'surface-bg-elevated',
  'surface-bg-subtle',
  'border-color',
  'border-color-hover',
  'border-color-strong',
  'text-primary',
  'text-secondary',
  'text-muted',
  'text-disabled',
  'text-inverse'
]

/** 提取 selector 块内容(支持嵌套 {})。 */
function extractSelectorBlocks(css: string, selector: string): string[] {
  const out: string[] = []
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const startRegex = new RegExp(`${escaped}\\s*\\{`, 'g')
  let match: RegExpExecArray | null
  while ((match = startRegex.exec(css)) !== null) {
    let depth = 1
    let i = match.index + match[0].length
    const start = i
    while (i < css.length && depth > 0) {
      const ch = css[i]
      if (ch === '{') depth++
      else if (ch === '}') depth--
      i++
    }
    out.push(css.slice(start, i - 1))
  }
  return out
}

/** 提取 selector 块内 --xxx- 前缀的 token 名称集合(去重排序)。 */
function tokenNamesIn(blockText: string, prefix: string): string[] {
  const names = new Set<string>()
  const re = new RegExp(`(${prefix}[a-z0-9-]+)\\s*:`, 'g')
  let m: RegExpExecArray | null
  while ((m = re.exec(blockText)) !== null) names.add(m[1])
  return [...names].sort()
}

/** 递归遍历 src/ 收集 .vue / .css 文件。 */
function walkSrcCssAndVue(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    if (entry === 'node_modules' || entry === 'dist' || entry.startsWith('.')) continue
    const full = join(dir, entry)
    const stat = statSync(full)
    if (stat.isDirectory()) {
      out.push(...walkSrcCssAndVue(full))
    } else if (entry.endsWith('.vue') || entry.endsWith('.css')) {
      out.push(full)
    }
  }
  return out
}

describe('Style token invariants', () => {
  describe('#1 / #2 — Legacy tokens removed', () => {
    it('legacy theme token definitions absent from globals.css', () => {
      const violators: string[] = []
      for (const t of LEGACY_TOKEN_NAMES) {
        const re = new RegExp(`^\\s+--${t}\\s*:`, 'm')
        if (re.test(GLOBALS_CSS)) violators.push(t)
      }
      expect(violators, `globals.css 仍含旧 token 定义: ${violators.join(', ')}`).toEqual([])
    })

    it('legacy theme token references absent from src/**/*.{vue,css}', () => {
      const allFiles = walkSrcCssAndVue(SRC_DIR)
      const legacyRefRe = new RegExp(`var\\(--(?:${LEGACY_TOKEN_NAMES.join('|')})\\)`, 'g')
      const violators: string[] = []
      for (const file of allFiles) {
        const content = readFileSync(file, 'utf-8')
        const matches = content.match(legacyRefRe)
        if (matches) {
          violators.push(`${file.replace(REPO_ROOT, '.')}: ${matches.join(', ')}`)
        }
      }
      expect(violators, `仍引用旧 token:\n${violators.join('\n')}`).toEqual([])
    })
  })

  describe('#3 — RGB tuple format', () => {
    it('local --color-*-rgb tuples are space-separated, not comma-separated', () => {
      const re = /^\s*--color-[a-z0-9-]*-rgb:\s*[^;]*,/gm
      const violators = GLOBALS_CSS.match(re) || []
      expect(violators, `逗号分隔 RGB 残留:\n${violators.join('\n')}`).toEqual([])
    })
  })

  describe('#4 / #5 — Token name parity across selectors', () => {
    it('html.dark and html:not(.dark) expose the same theme-aware token names', () => {
      const darkBlocks = extractSelectorBlocks(GLOBALS_CSS, 'html.dark')
      const lightBlocks = extractSelectorBlocks(GLOBALS_CSS, 'html:not(.dark)')
      expect(darkBlocks.length).toBeGreaterThan(0)
      expect(lightBlocks.length).toBeGreaterThan(0)
      const darkTokens = tokenNamesIn(darkBlocks.join('\n'), '--color-')
      const lightTokens = tokenNamesIn(lightBlocks.join('\n'), '--color-')
      // 期望:dark 与 light selector 都定义这组主题感知 token,且名称集合一致
      expect(darkTokens, 'dark/light selector 暴露的 --color-* token 不一致').toEqual(lightTokens)
    })

  })

  describe('#8 — Vue <style> blocks contain no modeled hardcoded color', () => {
    it('SFC scoped styles 无已建模硬编码色裸值', () => {
      const allFiles = walkSrcCssAndVue(SRC_DIR).filter((f) => f.endsWith('.vue'))
      const violators: string[] = []

      const PATTERNS: Array<{ name: string; re: RegExp }> = [
        { name: '#F59E0B primary', re: /#[fF]59[eE]0[bB]\b/ },
        { name: '#D97706 primary-dark', re: /#[dD]97706\b/ },
        { name: '#FBBF24 primary-light', re: /#[fF][bB][bB][fF]24\b/ },
        { name: '#DC2626 danger', re: /#[dD][cC]2626\b/ },
        { name: '#16A34A success', re: /#16[aA]34[aA]\b/ },
        { name: '#EAB308 warning', re: /#[eE][aA][bB]308\b/ },
        { name: '#3B82F6 info', re: /#3[bB]82[fF]6\b/ },
        { name: '#0F172A industrial-dark-bg', re: /#0[fF]172[aA]\b/ },
        { name: '#1E293B industrial-dark-surface', re: /#1[eE]293[bB]\b/ },
        { name: '#334155 industrial-dark-surface-elevated', re: /#334155\b/ },
        { name: '#475569 light-text-secondary', re: /#475569\b/ },
        { name: '#64748B text-muted', re: /#64748[bB]\b/ },
        { name: '#94A3B8 text-secondary', re: /#94[aA]3[bB]8\b/ },
        { name: '#F8FAFC industrial-dark-text/light-bg', re: /#[fF]8[fF][aA][fF][cC]\b/ },
        { name: 'rgb(245 158 11) primary', re: /rgba?\(\s*245(?:\s*,\s*|\s+)158(?:\s*,\s*|\s+)11/ }
      ]

      for (const file of allFiles) {
        const content = readFileSync(file, 'utf-8')
        // 提取所有 <style> 块内容(包括 scoped 与非 scoped)
        const styleBlocks = content.match(/<style[^>]*>[\s\S]*?<\/style>/g) || []
        const styleText = styleBlocks.join('\n')
        for (const p of PATTERNS) {
          const matches = styleText.match(new RegExp(p.re.source, 'g')) || []
          if (matches.length > 0) {
            violators.push(`${file.replace(REPO_ROOT, '.')}: ${p.name} × ${matches.length}`)
          }
        }
      }

      expect(violators, `SFC <style> 残留:\n${violators.join('\n')}`).toEqual([])
    })
  })

  describe('#9 — No double-slash TODO comments in CSS', () => {
    it('globals.css contains no double-slash TODO', () => {
      const re = /\/\/\s*TODO/gi
      const matches = GLOBALS_CSS.match(re) || []
      expect(matches.length, `非法 // TODO 注释残留: ${matches.join(', ')}`).toBe(0)
    })
  })
})
