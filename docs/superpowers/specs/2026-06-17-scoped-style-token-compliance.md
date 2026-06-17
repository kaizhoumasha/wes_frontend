---
spec_kind: audit-and-cleanup
spec_filed_at: 2026-06-17
spec_eng_review_at: 2026-06-17
spec_eng_rereview_at: 2026-06-17
spec_codex_review_at: 2026-06-17
spec_round_3_resolved_at: 2026-06-17
spec_round_4_resolved_at: 2026-06-17
spec_branch: feature/style-token-compliance
spec_archive_source: ~/.claude/plans/plan-mode-abstract-gadget.md
spec_executed: false
status: ready-for-implementation
notes: |
  Canonical spec after strict /plan-eng-review cleanup.
  The project is unreleased, so this plan deliberately removes legacy token names
  instead of preserving old-name wrappers or soft migration paths.
  Runtime Monitor v3 is already merged into develop via v0.7.0.0 (#40).
  Implement P0 through P4 on feature/style-token-compliance as one coherent cleanup.
---

# SPEC: Scoped Style Token Compliance

## Verdict

**可进入实施阶段,但只能按本文执行。**

旧版本文档混合了初稿、三轮评审记录、已废弃的视觉自动化方案、旧 token 别名方案和最终决议。实施者不能再按旧段落搜索执行。本文件是唯一权威版本。

强约束:

- 未发布项目删除旧名,不保留旧名 wrapper。
- 不新增旧 token 别名。
- 不把 Stylelint 降级为 warning。
- 不引入新的浏览器视觉测试工具链。
- 不保留 `--body-bg`、`--surface-bg`、`--text-primary` 等旧主题 token。
- 自动门禁负责 CSS 文本不变量和 lint；人工截图只作为 PR 证据。

## Scope Challenge

### What already exists

| Existing asset                                    | Reuse decision                                                                          |
| ------------------------------------------------- | --------------------------------------------------------------------------------------- |
| `tailwind.config.js` industrial palette           | Reuse as L1 color authority. No new palette source.                                     |
| `src/assets/styles/globals.css :root`             | Extend as L2 static token mirror. Do not create another token file.                     |
| `html.dark` and `html:not(.dark)` theme selectors | Reuse as theme-aware L2b layer, but delete legacy token names.                          |
| Element Plus CSS variables                        | Keep `--el-*` integration. Map local overrides to new `--color-*` tokens where touched. |
| Vitest plus happy-dom                             | Reuse for style invariant tests. No new test framework.                                 |
| `pnpm smoke:runtime:agent-browser`                | Reuse for runtime smoke coverage after style cleanup.                                   |
| `DESIGN.md`                                       | Update as the public design contract after implementation.                              |

### Minimum complete change

The smallest complete implementation is:

1. Add missing static and theme-aware `--color-*` tokens in `globals.css`.
2. Replace all current legacy theme token definitions and references.
3. Rewrite `--runtime-*` definitions to derive from the `--color-*` layer.
4. Add invariant tests that fail on legacy token reintroduction.
5. Add strict Stylelint rules for modeled hardcoded colors.
6. Clean every existing violation covered by those strict rules before merge.
7. Update design docs.

Cleaning only Top 10 files is not complete once strict Stylelint is enabled. Top 10 can be the execution order, not the acceptance boundary.

## Current State

Baseline checked on `develop` at `850c72f v0.7.0.0 feat(runtime): 工作线监控 dashboard-v3 (#40)`.

| Metric                                              | Current value | Command                                                                                                                    |
| --------------------------------------------------- | ------------: | -------------------------------------------------------------------------------------------------------------------------- |
| SFC files with `<style scoped>`                     |           100 | `rtk rg -l '<style[^>]*scoped' src --glob '*.vue' \| wc -l`                                                                |
| SFC hex color lines                                 |           498 | `rtk rg -n '#[0-9a-fA-F]{3,8}\b' src --glob '*.vue' \| wc -l`                                                              |
| SFC `rgb()` / `rgba()` lines                        |           598 | `rtk rg -n 'rgba?\(' src --glob '*.vue' \| wc -l`                                                                          |
| Combined SFC hardcoded color hits                   |          1085 | `rtk rg -n '#[0-9a-fA-F]{3,8}\b\|rgba?\(' src --glob '*.vue' \| wc -l`                                                     |
| Primary-equivalent hardcoded SFC hits               |           279 | `rtk rg -n '#[fF]59[eE]0[bB]\|rgba?\(\s*245\s*[, ]\s*158\s*[, ]\s*11\|rgb\(\s*245\s+158\s+11' src --glob '*.vue' \| wc -l` |
| `var(--color-primary*)` SFC hits                    |             1 | `rtk rg -n 'var\(--color-primary' src --glob '*.vue' \| wc -l`                                                             |
| `var(--runtime-*)` SFC hits                         |           368 | `rtk rg -n 'var\(--runtime-' src --glob '*.vue' \| wc -l`                                                                  |
| `var(--el-*)` SFC hits                              |           367 | `rtk rg -n 'var\(--el-' src --glob '*.vue' \| wc -l`                                                                       |
| `@apply` / `@reference` SFC hits                    |            16 | `rtk rg -n '@apply\|@reference' src --glob '*.vue' \| wc -l`                                                               |
| Legacy theme token definitions                      |            24 | see legacy set below                                                                                                       |
| Legacy theme token references                       |            28 | see legacy set below                                                                                                       |
| `--runtime-*` definition lines                      |            84 | `rtk rg -n -- '^\s*--runtime-' src/assets/styles/globals.css \| wc -l`                                                     |
| `--runtime-*` definitions already using `--color-*` |            21 | `rtk rg -n -- '^\s*--runtime-.*var\(--color-' src/assets/styles/globals.css \| wc -l`                                      |

### Legacy Theme Token Set

These names must be deleted from `src/` definitions and references. `--text-inverse` is included as a denylist guard even though current `develop` does not define it.

```text
--body-bg
--body-color
--surface-bg
--surface-bg-elevated
--surface-bg-subtle
--border-color
--border-color-hover
--border-color-strong
--text-primary
--text-secondary
--text-muted
--text-disabled
--text-inverse
```

Current definition lines:

```text
src/assets/styles/globals.css:186 --body-bg
src/assets/styles/globals.css:187 --body-color
src/assets/styles/globals.css:190 --surface-bg
src/assets/styles/globals.css:191 --surface-bg-elevated
src/assets/styles/globals.css:192 --surface-bg-subtle
src/assets/styles/globals.css:195 --border-color
src/assets/styles/globals.css:196 --border-color-hover
src/assets/styles/globals.css:197 --border-color-strong
src/assets/styles/globals.css:200 --text-primary
src/assets/styles/globals.css:201 --text-secondary
src/assets/styles/globals.css:202 --text-muted
src/assets/styles/globals.css:203 --text-disabled
src/assets/styles/globals.css:365 --body-bg
src/assets/styles/globals.css:366 --body-color
src/assets/styles/globals.css:369 --surface-bg
src/assets/styles/globals.css:370 --surface-bg-elevated
src/assets/styles/globals.css:371 --surface-bg-subtle
src/assets/styles/globals.css:374 --border-color
src/assets/styles/globals.css:375 --border-color-hover
src/assets/styles/globals.css:376 --border-color-strong
src/assets/styles/globals.css:379 --text-primary
src/assets/styles/globals.css:380 --text-secondary
src/assets/styles/globals.css:381 --text-muted
src/assets/styles/globals.css:382 --text-disabled
```

## Target Architecture

The token contract has three layers.

```text
L1: tailwind.config.js
    Industrial palette authority.
    No runtime code reads from Tailwind directly.

        |
        v

L2a: globals.css :root
     Static token mirror:
     --color-primary, --color-success, --color-info, industrial dark/light tokens,
     RGB tuples for alpha composition.

        |
        v

L2b: globals.css html.dark / html:not(.dark)
     Theme-aware semantic tokens:
     --color-bg, --color-surface, --color-border, --color-text-primary, etc.
     These names are the only local theme contract.

        |
        v

L3: SFC scoped styles and runtime styles
    Allowed references:
    --color-* for brand, semantic, theme-aware values
    --runtime-* for runtime domain semantics
    --el-* for Element Plus integration
```

### L2a Static Token Additions

Add static mirrors for Tailwind industrial colors. Include RGB tuple tokens wherever alpha composition is needed. Local `--color-*-rgb` tuple tokens use space-separated components so alpha variants can use CSS Color 4 slash syntax: `rgb(var(--color-*-rgb) / alpha)`. Do not apply this rule to Element Plus library-facing `--el-*-rgb` variables unless their library consumption is audited.

```css
--color-industrial-dark-bg: #0f172a;
--color-industrial-dark-bg-rgb: 15 23 42;
--color-industrial-dark-surface: #1e293b;
--color-industrial-dark-surface-rgb: 30 41 59;
--color-industrial-dark-surface-elevated: #334155;
--color-industrial-dark-surface-elevated-rgb: 51 65 85;
--color-industrial-dark-border: rgb(var(--color-primary-rgb) / 0.15);
--color-industrial-dark-border-hover: rgb(var(--color-primary-rgb) / 0.3);
--color-industrial-dark-text: #f8fafc;
--color-industrial-dark-text-secondary: #94a3b8;
--color-industrial-dark-text-muted: #64748b;

--color-industrial-light-bg: #f8fafc;
--color-industrial-light-bg-rgb: 248 250 252;
--color-industrial-light-surface: #ffffff;
--color-industrial-light-surface-rgb: 255 255 255;
--color-industrial-light-surface-elevated: #f1f5f9;
--color-industrial-light-surface-elevated-rgb: 241 245 249;
--color-industrial-light-border: #e2e8f0;
--color-industrial-light-border-hover: #cbd5e1;
--color-industrial-light-text: #0f172a;
--color-industrial-light-text-secondary: #475569;
--color-industrial-light-text-muted: #94a3b8;
```

### L2b Theme-Aware Tokens

Replace the legacy token names with these names. Do not keep old names as derived wrappers.

```css
html.dark {
  --color-bg: linear-gradient(
    135deg,
    var(--color-industrial-dark-bg) 0%,
    var(--color-industrial-dark-surface) 100%
  );
  --color-bg-solid: var(--color-industrial-dark-bg);
  --color-body-text: var(--color-industrial-dark-text);
  --color-surface: var(--color-industrial-dark-surface);
  --color-surface-elevated: var(--color-industrial-dark-surface-elevated);
  --color-surface-subtle: rgb(var(--color-industrial-dark-surface-rgb) / 0.5);
  --color-border: var(--color-industrial-dark-border);
  --color-border-hover: var(--color-industrial-dark-border-hover);
  --color-border-strong: rgb(var(--color-primary-rgb) / 0.5);
  --color-text-primary: var(--color-industrial-dark-text);
  --color-text-secondary: var(--color-industrial-dark-text-secondary);
  --color-text-muted: var(--color-industrial-dark-text-muted);
  --color-text-disabled: #475569;
  --color-text-inverse: #0f172a;
  --color-shadow-rgb: 0 0 0;
}

html:not(.dark) {
  --color-bg: linear-gradient(
    135deg,
    var(--color-industrial-light-bg) 0%,
    var(--color-industrial-light-surface-elevated) 100%
  );
  --color-bg-solid: var(--color-industrial-light-bg);
  --color-body-text: var(--color-industrial-light-text);
  --color-surface: var(--color-industrial-light-surface);
  --color-surface-elevated: var(--color-industrial-light-surface-elevated);
  --color-surface-subtle: rgb(var(--color-industrial-light-surface-rgb) / 0.8);
  --color-border: var(--color-industrial-light-border);
  --color-border-hover: var(--color-industrial-light-border-hover);
  --color-border-strong: #cbd5e1;
  --color-text-primary: var(--color-industrial-light-text);
  --color-text-secondary: var(--color-industrial-light-text-secondary);
  --color-text-muted: var(--color-industrial-light-text-muted);
  --color-text-disabled: #cbd5e1;
  --color-text-inverse: #ffffff;
  --color-shadow-rgb: 15 23 42;
}
```

### Runtime Mapping Rules

`--runtime-*` remains as the runtime domain vocabulary, but every value must derive from `--color-*` tokens or the new `--color-shadow-rgb`.

Examples:

| Runtime token              | Required source                                                                |
| -------------------------- | ------------------------------------------------------------------------------ |
| `--runtime-surface`        | `rgb(var(--color-industrial-*-surface-rgb) / alpha)` or `var(--color-surface)` |
| `--runtime-surface-accent` | `rgb(var(--color-primary-rgb) / alpha)`                                        |
| `--runtime-border`         | `rgb(var(--color-primary-rgb) / alpha)` or `var(--color-border)`               |
| `--runtime-text-primary`   | `var(--color-text-primary)`                                                    |
| `--runtime-text-secondary` | `var(--color-text-secondary)`                                                  |
| `--runtime-text-muted`     | `var(--color-text-muted)`                                                      |
| `--runtime-tier-critical`  | `var(--color-danger)`                                                          |
| `--runtime-tier-watch`     | `var(--color-warning)`                                                         |
| `--runtime-tier-known`     | `var(--color-text-muted)`                                                      |
| `--runtime-shadow`         | `0 16px 40px rgb(var(--color-shadow-rgb) / alpha)`                             |
| `--runtime-badge-info-*`   | `var(--color-info*)` or `rgb(var(--color-info-rgb) / alpha)`                   |

Do not use `--color-safety-blue-rgb`; it does not exist. Use `--color-info-rgb`.

## Implementation Phases

### P0: Build the New Token Layer and Delete Legacy Names

Files:

- `src/assets/styles/globals.css`

Tasks:

1. Add L2a static industrial tokens in `:root`.
2. Add L2b theme-aware tokens in `html.dark` and `html:not(.dark)`.
3. Move `Runtime Light Theme Overrides` back into the same theme layer as the dark runtime definitions.
4. Replace all uses of legacy theme tokens inside `globals.css`.
5. Delete all legacy theme token definitions.

Required replacements:

| Legacy                       | Replacement                     |
| ---------------------------- | ------------------------------- |
| `var(--body-bg)`             | `var(--color-bg)`               |
| `var(--body-color)`          | `var(--color-body-text)`        |
| `var(--surface-bg)`          | `var(--color-surface)`          |
| `var(--surface-bg-elevated)` | `var(--color-surface-elevated)` |
| `var(--surface-bg-subtle)`   | `var(--color-surface-subtle)`   |
| `var(--border-color)`        | `var(--color-border)`           |
| `var(--border-color-hover)`  | `var(--color-border-hover)`     |
| `var(--border-color-strong)` | `var(--color-border-strong)`    |
| `var(--text-primary)`        | `var(--color-text-primary)`     |
| `var(--text-secondary)`      | `var(--color-text-secondary)`   |
| `var(--text-muted)`          | `var(--color-text-muted)`       |
| `var(--text-disabled)`       | `var(--color-text-disabled)`    |
| `var(--text-inverse)`        | `var(--color-text-inverse)`     |

### P1: Rewrite Runtime Tokens

Files:

- `src/assets/styles/globals.css`

Tasks:

1. Rewrite dark `--runtime-*` definitions to use `--color-*`.
2. Rewrite light `--runtime-*` definitions to use `--color-*`.
3. Remove hardcoded runtime colors except values that are part of token definitions in `:root`.
4. Normalize local `--color-*-rgb` tuple definitions to space-separated values and use `rgb(var(--color-*-rgb) / alpha)` consistently for alpha variants.
5. Ensure dark and light runtime selectors define the same runtime token names.

### P2: Add Invariant Tests

Files:

- `tests/unit/styles/style-token-invariants.test.ts`

Tests:

```text
style token invariants
├── legacy theme token definitions are absent from src/assets/styles/globals.css
├── legacy theme token references are absent from src/**/*.{vue,css}
├── local --color-*-rgb tuple definitions are space-separated, not comma-separated
├── html.dark and html:not(.dark) expose the same theme-aware token names
├── dark and light runtime selectors expose the same --runtime-* token names
├── every full --runtime-* declaration derives from --color-* or --color-shadow-rgb
├── --runtime-badge-info-* uses --color-info* and never a safety-blue RGB token
├── no modeled hardcoded color literal appears in Vue <style> blocks
└── no CSS line contains double-slash TODO comments
```

Use text parsing for these tests. The runtime derivation test must parse each complete CSS custom property declaration from property name through the terminating semicolon, including multi-line gradients. It must not rely on one-line `rg` matches. A runtime value is valid only when each color-bearing segment uses `var(--color-*)`, `rgb(var(--color-*-rgb) / alpha)`, or `rgb(var(--color-shadow-rgb) / alpha)`. Non-color syntax such as lengths, percentages, angles, keywords, `transparent`, `linear-gradient()`, and `radial-gradient()` is allowed only when every color stop inside it is token-derived.

The Vue style-block invariant extracts `<style>` blocks from `src/**/*.vue` and applies the same modeled-value denylist used by Stylelint. It intentionally ignores `<script>` and template literals; non-CSS canvas or SVG color constants need a separate rendering-token plan if they are cleaned later. happy-dom computed style tests are optional smoke only; they are not a visual guarantee.

### P3: Enable Strict Stylelint and Clean All Modeled Violations

Files:

- `stylelint.config.js`
- SFC files under `src/`

Tasks:

1. Add `declaration-property-value-disallowed-list` for modeled hardcoded colors in the Vue override.
2. Keep token source literals allowed in `src/assets/styles/globals.css`; do not enable the modeled-color denylist for that file.
3. Clean every current violation covered by the rule before merge.
4. Use Top 10 files as the first pass, then clear remaining modeled violations repo-wide.

Top files by hardcoded color hits:

| File                                                      | Hits |
| --------------------------------------------------------- | ---: |
| `src/views/auth/Login.vue`                                |  107 |
| `src/components/common/AppHeader.vue`                     |   67 |
| `src/components/runtime/sandbox/SandboxActionList.vue`    |   60 |
| `src/views/dashboard/Dashboard.vue`                       |   51 |
| `src/views/error/ErrorLayout.vue`                         |   48 |
| `src/components/runtime/trace/TraceTopologySummary.vue`   |   47 |
| `src/components/common/AppSidebar.vue`                    |   41 |
| `src/views/error/Unauthorized.vue`                        |   39 |
| `src/views/admin/worklines/config/WorkLineConfigPage.vue` |   34 |
| `src/views/error/NotFound.vue`                            |   33 |

Stylelint rule shape:

```js
const modeledHardcodedColorProperties =
  '/^(?:color|background(?:-color|-image)?|border(?:-(?:color|top|right|bottom|left|block|block-start|block-end|inline|inline-start|inline-end))?(?:-color)?|border-image(?:-source)?|box-shadow|text-shadow|filter|outline(?:-color)?|text-decoration(?:-color)?|caret-color|accent-color|fill|stroke|stop-color|flood-color|lighting-color|scrollbar-color|column-rule(?:-color)?|--.*(?:color|bg|background|border|shadow|surface|text|decoration|accent|fill|stroke).*)$/'

const modeledHardcodedColorValues = [
  '/#[fF]59[eE]0[bB]/',
  '/#[dD]97706/',
  '/rgba?\\(\\s*245(?:\\s*,\\s*|\\s+)158(?:\\s*,\\s*|\\s+)11\\b/',
  '/#[dD][cC]2626/',
  '/rgba?\\(\\s*220(?:\\s*,\\s*|\\s+)38(?:\\s*,\\s*|\\s+)38\\b/',
  '/#16[aA]34[aA]/',
  '/rgba?\\(\\s*22(?:\\s*,\\s*|\\s+)163(?:\\s*,\\s*|\\s+)74\\b/',
  '/#[eE][aA][bB]308/',
  '/rgba?\\(\\s*234(?:\\s*,\\s*|\\s+)179(?:\\s*,\\s*|\\s+)8\\b/',
  '/#3[bB]82[fF]6/',
  '/rgba?\\(\\s*59(?:\\s*,\\s*|\\s+)130(?:\\s*,\\s*|\\s+)246\\b/',
  '/#[fF]8[fF][aA][fF][cC]/',
  '/#0[fF]172[aA]/',
  '/#1[eE]293[bB]/',
  '/#334155/',
  '/#475569/',
  '/#64748[bB]/',
  '/#94[aA]3[bB]8/'
]

'declaration-property-value-disallowed-list': [
  {
    [modeledHardcodedColorProperties]: modeledHardcodedColorValues
  },
  { severity: 'error' }
]
```

### P4: Update Documentation

Files:

- `DESIGN.md`
- optional `docs/DESIGN_TOKEN_USAGE_GUIDE.md`

Tasks:

1. Add a `Token 引用契约` subsection under `DESIGN.md` color system.
2. Remove the `DESIGN.md` known limitation that says dark/light mode is not formalized at the design-token layer.
3. Document allowed usage:
   - `--color-*` for brand, semantic, and theme-aware UI values.
   - `--runtime-*` for runtime domain semantics only.
   - `--el-*` for Element Plus integration only.
   - hardcoded modeled colors only inside `globals.css` token definitions.

## Acceptance Criteria

All criteria are blocking for this spec.

| #   | Criterion                                                    | Verification                                                                                                                                                                          |
| --- | ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ---------- | --------------------------------------------------------------------- | ----------------- | ------------ | ------------------ | ------------------- | ------------ | -------------- | ---------- | ------------- | ----------------------------------------------------------------- |
| 1   | Legacy theme token definitions are zero                      | `rtk rg -n -- '^\s\*--(body-bg                                                                                                                                                        | body-color      | surface-bg | surface-bg-elevated                                                   | surface-bg-subtle | border-color | border-color-hover | border-color-strong | text-primary | text-secondary | text-muted | text-disabled | text-inverse):' src/assets/styles/globals.css` returns no matches |
| 2   | Legacy theme token references are zero                       | `rtk rg -n --glob '_.vue' --glob '_.css' -- 'var\(--(body-bg                                                                                                                          | body-color      | surface-bg | surface-bg-elevated                                                   | surface-bg-subtle | border-color | border-color-hover | border-color-strong | text-primary | text-secondary | text-muted | text-disabled | text-inverse)' src` returns no matches                            |
| 3   | Local `--color-*-rgb` tuples are slash-alpha ready           | Vitest invariant passes; `rtk rg -n -- '^\s*--color-[a-z0-9-]*-rgb:\s*[^;]*,' src/assets/styles/globals.css` returns no matches                                                       |
| 4   | full `--runtime-*` declarations are token-derived            | Vitest invariant passes                                                                                                                                                               |
| 5   | Dark/light runtime selectors expose the same runtime names   | Vitest invariant passes                                                                                                                                                               |
| 6   | `--color-info-rgb` is used for info badges                   | Vitest invariant passes; `rtk rg -n -- '--color-safety-blue-rgb' src/assets/styles/globals.css` returns no matches; `rtk rg -n -- '--runtime-badge-info-[^:]+:.\*(--color-safety-blue | safety-blue-rgb | #22d3ee    | 6[, ]+182[, ]+212)' src/assets/styles/globals.css` returns no matches |
| 7   | Modeled hardcoding in Vue style blocks is zero               | Vitest style-block invariant passes with the same value denylist as Stylelint                                                                                                         |
| 8   | Strict Stylelint passes without fix or cache                 | `rtk pnpm exec stylelint "./**/*.{vue,less,scss,css}" --no-cache` exits 0                                                                                                             |
| 9   | Project lint gate passes                                     | `rtk pnpm lint` exits 0                                                                                                                                                               |
| 10  | Unit tests pass                                              | `rtk pnpm test` exits 0                                                                                                                                                               |
| 11  | Runtime smoke passes                                         | `rtk pnpm smoke:runtime:agent-browser` exits 0                                                                                                                                        |
| 12  | Design doc limitation is removed                             | `rtk rg -n 'design tokens 层面形式化' DESIGN.md` returns no matches                                                                                                                   |
| 13  | PR includes manual screenshots for changed user-facing pages | PR description contains dark and light screenshots for Login, dashboard, runtime monitor, and error pages                                                                             |

## Testing Plan

```text
CODE PATHS                                            USER FLOWS
[+] globals.css token layer                           [+] Theme switch
  ├── [GAP] dark theme-aware tokens                    ├── [MANUAL] dark mode screenshots
  ├── [GAP] light theme-aware tokens                   ├── [MANUAL] light mode screenshots
  ├── [GAP] legacy token deletion                      └── [GAP] primary color one-point edit propagates
  └── [GAP] runtime token derivation

[+] stylelint.config.js                               [+] Developer workflow
  ├── [GAP] modeled hardcoded colors fail lint         ├── [GAP] raw stylelint no-fix/no-cache fails on violation
  ├── [GAP] filter/outline/custom-prop colors fail     └── [GAP] pnpm lint exits 0 after cleanup
  └── [GAP] globals.css token literals are allowed

[+] SFC style cleanup                                 [+] Main screens
  ├── [GAP] Login                                     ├── [MANUAL] Login dark/light
  ├── [GAP] AppHeader/AppSidebar                      ├── [MANUAL] navigation dark/light
  ├── [GAP] Runtime monitor and sandbox components    ├── [MANUAL] runtime monitor smoke
  └── [GAP] Dashboard and error pages                 └── [MANUAL] dashboard/error dark/light
```

Automated tests to add:

- `tests/unit/styles/style-token-invariants.test.ts`
- The invariant test must include a failing fixture for comma-separated local `--color-*-rgb` tuples, because `rgb(var(--color-primary-rgb) / 0.2)` only works with space-separated tuple values.
- Stylelint violation fixture can be inline through temporary CSS text if practical; otherwise rely on raw stylelint command in verification.
- The style invariant test must include positive fixtures for `filter: drop-shadow(...)`, `outline`, `border-image`, `scrollbar-color`, and color-bearing custom properties so future property-regex narrowing fails fast.

Manual checks:

- Run `rtk pnpm dev`.
- Capture dark and light screenshots for Login, dashboard, runtime monitor, and error pages.
- Temporarily change `--color-primary` and verify primary accents move together across global and runtime UI.

## Failure Modes

| Area            | Failure mode                                                                                              | Required mitigation                                                                                                                                    |
| --------------- | --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Token layer     | A legacy token name remains and becomes a second source of truth                                          | Vitest legacy definition/reference checks plus grep acceptance                                                                                         |
| Runtime mapping | Light and dark define different `--runtime-*` names                                                       | Vitest selector parity check                                                                                                                           |
| Runtime colors  | Info badge references nonexistent safety-blue RGB token                                                   | Vitest plus grep check for `--color-safety-blue-rgb`; do not forbid the valid static `--color-safety-blue` token                                       |
| Runtime parsing | Multi-line gradients pass a line-based token check while containing hardcoded stops                       | Vitest parses complete CSS declarations through semicolon                                                                                              |
| Stylelint       | Rule misses gradients, borders, shadows, filters, outlines, SVG paint, or color-bearing custom properties | Property regex includes background, border sides, shadows, filter, outline, SVG paint, and `--*color/bg/border/shadow/surface/text*` custom properties |
| Stylelint       | Rule blocks `globals.css` source literals                                                                 | Explicit override only for `src/assets/styles/globals.css`                                                                                             |
| SFC cleanup     | Mechanical replacement changes contrast or interaction affordance                                         | Manual dark/light screenshots for touched pages                                                                                                        |
| Tests           | happy-dom computed style gives false visual confidence                                                    | Treat happy-dom as smoke only; visual evidence stays manual                                                                                            |
| Docs            | `DESIGN.md` continues telling engineers token mode is not formalized                                      | Acceptance criterion checks that known limitation is removed                                                                                           |

## NOT in Scope

- Full removal of every hardcoded unmodeled color in all 100 SFC files. This spec blocks modeled design-system colors; arbitrary one-off colors need a separate design decision before linting.
- Full removal of non-CSS color literals in Vue `<script>` blocks, including canvas drawing constants. This spec is scoped to CSS token compliance and Vue style blocks.
- Reworking Tailwind utilities or converting SFC CSS to `@apply`.
- Refactoring Element Plus internals beyond references touched by old token deletion.
- Adding a new browser screenshot test framework.
- Preserving old token names as wrappers.
- Backend work. This is a frontend-only style-token cleanup.

## Parallelization

Foundation work must land first because every lane depends on the new token names.

| Step               | Modules touched                 | Depends on             |
| ------------------ | ------------------------------- | ---------------------- |
| P0 token layer     | `src/assets/styles/`            | none                   |
| P1 runtime mapping | `src/assets/styles/`            | P0                     |
| P2 invariant tests | `tests/unit/styles/`            | P0, P1                 |
| P3 stylelint rule  | repo config                     | P0                     |
| P3 SFC cleanup     | `src/views/`, `src/components/` | P0, P3 stylelint draft |
| P4 docs            | `DESIGN.md`, `docs/`            | P0 decisions           |

Execution:

- Lane A: P0 then P1, sequential because both edit `globals.css`.
- Lane B: P2 tests after Lane A has token names.
- Lane C: P3 SFC cleanup can split by module after Lane A.
- Lane D: P4 docs can run after Lane A decisions are stable.

Conflict flags:

- Do not run two worktrees that both edit `src/assets/styles/globals.css`.
- SFC cleanup can be split by directory, but avoid two workers touching `src/components/runtime/`.

## Implementation Tasks

Synthesized from this review's findings. Each task derives from a specific gap above.

- [ ] **T1 (P1, human: ~2h / CC: ~20min)** - `globals.css` - Add static and theme-aware `--color-*` token layers, then delete legacy theme definitions.
  - Surfaced by: Architecture review, legacy token system still has 24 definitions and 28 references.
  - Files: `src/assets/styles/globals.css`
  - Verify: Acceptance #1 and #2.

- [ ] **T2 (P1, human: ~2h / CC: ~20min)** - `globals.css` - Rewrite runtime theme definitions to derive from `--color-*`.
  - Surfaced by: Architecture review, only 21 of 84 runtime definition lines currently reference `--color-*`.
  - Files: `src/assets/styles/globals.css`
  - Verify: Acceptance #3, #4, and #5.

- [ ] **T3 (P1, human: ~1h / CC: ~15min)** - tests - Add style token invariant tests.
  - Surfaced by: Test review, no current test protects token architecture.
  - Files: `tests/unit/styles/style-token-invariants.test.ts`
  - Verify: Acceptance #3, #4, #5, #6, #7 and `rtk pnpm test`.

- [ ] **T4 (P1, human: ~2h / CC: ~25min)** - lint - Add strict modeled-color Stylelint rule for Vue files and clear every violation it reports.
  - Surfaced by: Code quality review, Stylelint currently has no modeled-color guard for gradients, borders, shadows, filters, outlines, SVG paint, or color-bearing custom properties.
  - Files: `stylelint.config.js`, affected SFC files.
  - Verify: Acceptance #7 and #8.

- [ ] **T5 (P2, human: ~4h / CC: ~45min)** - SFC styles - Replace modeled hardcoded colors across all affected SFC scoped styles.
  - Surfaced by: Code quality review, SFC styles currently have 279 primary-equivalent hardcoded hits plus additional modeled status/text/surface color hits.
  - Files: `src/views/**/*.vue`, `src/components/**/*.vue`.
  - Verify: Acceptance #7, #8, #9, #13.

- [ ] **T6 (P2, human: ~1h / CC: ~10min)** - docs - Update design token usage docs.
  - Surfaced by: Documentation review, `DESIGN.md` still says token-layer dark/light strategy is not formalized.
  - Files: `DESIGN.md`, optional `docs/DESIGN_TOKEN_USAGE_GUIDE.md`.
  - Verify: Acceptance #12.

## GSTACK REVIEW REPORT

| Review        | Trigger               | Why                             | Runs | Status  | Findings                                                                                                                                               |
| ------------- | --------------------- | ------------------------------- | ---- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| CEO Review    | `/plan-ceo-review`    | Scope & strategy                | 0    | not run | Not required for this style-token cleanup                                                                                                              |
| Codex Review  | `/codex review`       | Independent 2nd opinion         | 1    | CLEAR   | Prior 12 findings folded into this canonical spec                                                                                                      |
| Eng Review    | `/plan-eng-review`    | Architecture & tests (required) | 2    | CLEAR   | 7 issue classes resolved: prior 4 plus safety-blue false-positive gate, full runtime declaration parsing, and broader modeled-color lint/test coverage |
| Design Review | `/plan-design-review` | UI/UX gaps                      | 0    | not run | Manual screenshots required during implementation                                                                                                      |
| DX Review     | `/plan-devex-review`  | Developer experience gaps       | 0    | not run | Raw no-fix Stylelint command added for implementation verification                                                                                     |

- **VERDICT:** ENG CLEARED - ready to implement with strict no-legacy-token posture.

NO UNRESOLVED DECISIONS
