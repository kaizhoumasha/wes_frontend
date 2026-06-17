/**
 * Style Token Invariants
 *
 * 不变量测试 — 验证 SPEC `docs/superpowers/specs/2026-06-17-scoped-style-token-compliance.md`
 * 锁定的 token 三层契约。任一不变量失败即代表 token 体系被破坏。
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

/** 解析以指定前缀开头的完整 CSS 自定义属性声明(跨行 gradient/multi-stop 完整捕获)。 */
function parseFullDeclarations(
  css: string,
  prefix: string
): Array<{ name: string; value: string; offset: number }> {
  const out: Array<{ name: string; value: string; offset: number }> = []
  const tokenRegex = new RegExp(`(${prefix}[a-z0-9-]+)\\s*:`, 'g')
  let match: RegExpExecArray | null
  while ((match = tokenRegex.exec(css)) !== null) {
    const nameStart = match.index
    const name = match[1]
    const valueStart = nameStart + match[0].length
    // 找终止分号 (不在 () 内)
    let depth = 0
    let i = valueStart
    while (i < css.length) {
      const ch = css[i]
      if (ch === '(') depth++
      else if (ch === ')') depth--
      else if (ch === ';' && depth === 0) break
      i++
    }
    const rawValue = css.slice(valueStart, i).trim()
    out.push({ name, value: rawValue, offset: nameStart })
  }
  return out
}

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

/** 判定一个 --runtime-* 值是否完全派生自允许的 token 形式。 */
function hasNonTokenColor(value: string): boolean {
  let stripped = value
  // 允许的派生形式 — 反复剥离直到稳定
  let prev: string
  do {
    prev = stripped
    stripped = stripped
      // var(--color-xxx) 简单引用
      .replace(/var\(--color-[\w-]+\)/g, '')
      // var(--color-xxx, fallback) 形式 — 不允许 fallback,我们通过保留 fallback 让 #/rgb 检测捕获
      // rgb(var(--color-xxx-rgb) / N) slash alpha
      .replace(/rgb\(\s*var\(--color-[\w-]+-rgb\)\s*\/\s*[\d.]+\s*\)/g, '')
      // rgb(var(--color-shadow-rgb) / N)
      .replace(/rgb\(\s*var\(--color-shadow-rgb\)\s*\/\s*[\d.]+\s*\)/g, '')
      // CSS 关键字与几何值
      .replace(/\b(transparent|currentColor|inherit|initial|unset|none)\b/g, '')
      // gradient 关键字 + 角度/停止点
      .replace(
        /\b(linear-gradient|radial-gradient|conic-gradient|circle|at|top|bottom|left|right|center)\b/g,
        ''
      )
      .replace(/\b\d+(deg|%|px|em|rem|vh|vw)\b/g, '')
      // 长度数字(用于 box-shadow 的 0 16px 40px 形式) — 仅孤立的纯数字 token
      .replace(/\s\d+(\.\d+)?(px|em|rem|%)?(?=\s|,|\)|$)/g, ' ')
  } while (stripped !== prev)

  // 如果还存在 hex 或 rgb(数字…)/rgba(...) 字面量 → 违规
  const hexLeak = /#[0-9a-fA-F]{3,8}\b/.test(stripped)
  const rgbLeak = /\brgba?\(\s*\d/.test(stripped)
  return hexLeak || rgbLeak
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

describe('Style token invariants (SPEC 2026-06-17)', () => {
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

    it('dark and light runtime selectors expose the same --runtime-* token names', () => {
      const darkBlocks = extractSelectorBlocks(GLOBALS_CSS, 'html.dark')
      const lightBlocks = extractSelectorBlocks(GLOBALS_CSS, 'html:not(.dark)')
      const darkRuntime = tokenNamesIn(darkBlocks.join('\n'), '--runtime-')
      const lightRuntime = tokenNamesIn(lightBlocks.join('\n'), '--runtime-')
      expect(darkRuntime.length).toBeGreaterThanOrEqual(40)
      expect(lightRuntime, 'dark/light runtime token 名称不一致').toEqual(darkRuntime)
    })
  })

  describe('#6 — Runtime token derivation', () => {
    it('every --runtime-* declaration derives from --color-* or --color-shadow-rgb', () => {
      const decls = parseFullDeclarations(GLOBALS_CSS, '--runtime-')
      expect(decls.length).toBeGreaterThanOrEqual(80) // dark + light 共 ~84

      const violators: string[] = []
      for (const decl of decls) {
        if (hasNonTokenColor(decl.value)) {
          violators.push(`${decl.name} = ${decl.value.slice(0, 80)}...`)
        }
      }
      expect(violators, `非派生 runtime 声明:\n${violators.join('\n')}`).toEqual([])
    })
  })

  describe('#7 — Badge info uses --color-info, not safety-blue', () => {
    it('--runtime-badge-info-* references --color-info* (not --color-safety-blue*)', () => {
      const decls = parseFullDeclarations(GLOBALS_CSS, '--runtime-badge-info-')
      expect(decls.length).toBeGreaterThanOrEqual(6) // text/bg/border × dark/light

      const violators: string[] = []
      for (const decl of decls) {
        if (decl.value.includes('safety-blue')) {
          violators.push(`${decl.name} 误用 safety-blue: ${decl.value}`)
        }
        if (!decl.value.includes('--color-info')) {
          violators.push(`${decl.name} 未引用 --color-info*: ${decl.value}`)
        }
      }
      expect(violators).toEqual([])
    })
  })

  describe('#8 — Vue <style> blocks (informational baseline, not strict yet)', () => {
    // P3 启用 stylelint 后此测试转为 strict;当前仅记录 baseline
    it.todo('Vue <style> blocks contain no modeled hardcoded color (P3 启用)')
  })

  describe('#9 — No double-slash TODO comments in CSS', () => {
    it('globals.css contains no double-slash TODO', () => {
      const re = /\/\/\s*TODO/gi
      const matches = GLOBALS_CSS.match(re) || []
      expect(matches.length, `非法 // TODO 注释残留: ${matches.join(', ')}`).toBe(0)
    })
  })
})
