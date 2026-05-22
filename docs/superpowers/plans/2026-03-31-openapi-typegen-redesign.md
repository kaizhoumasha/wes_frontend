# OpenAPI Typegen Redesign Implementation Plan

> **⚠️ 历史文档说明（2026-04）**
>
> 本文档保留其原始设计/计划上下文，**不再作为当前实现基线**。
> 当前代码已完成 methods-first / request-adapter 收口，以下旧术语如 `userApi`、`useCrudApi`、`src/api/base/crud-api.ts`、`xxxApi` 等，均可能与现状不一致。
>
> 请优先参考：
>
> - `docs/CRUD_DEVELOPMENT_GUIDE.md`
> - `docs/CONTRACT_FRONTEND_DEVELOPMENT_MANUAL.md`
> - `src/api/base/crud-request-adapter.ts`
> - `src/composables/useCrudRequestAdapter.ts`
> - `src/components/common/crud-page/createCrudPageConfigFromResource.ts`

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite `scripts/generate-api-types.ts` so it generates `openapi-types.ts`, `openapi-metadata.ts`, and model-driven `src/api/modules/*.ts` directly from `/api/v1/{module}/{model}` paths without naming hardcodes, while preserving manual extension blocks across regenerations.

**Architecture:** Extract path-driven analysis and module-template generation into pure helpers inside `scripts/generate-api-types.ts`, then drive all outputs from grouped `{module}:{model}` endpoint data. Replace the old aggregate `api-clients.ts` layer with direct per-model module generation and guard manual sections using stable markers plus strict merge validation.

**Tech Stack:** TypeScript, tsx, openapi-typescript, Vitest, Vue TS type-checking

---

### Task 1: Add regression tests for path grouping, method naming, and manual block preservation

**Files:**

- Create: `tests/unit/scripts/generate-api-types.test.ts`
- Modify: `/Users/kaizhou/SynologyDrive/works/wes_frontend/scripts/generate-api-types.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { describe, expect, it } from 'vitest'
import {
  buildMethodNameFromRelativePath,
  classifyCrudCapabilities,
  groupEndpointsByModuleModel,
  mergeModuleWithCustomSections
} from '@/../scripts/generate-api-types'

describe('generate-api-types helpers', () => {
  it('groups endpoints by module and model from path', () => {
    const groups = groupEndpointsByModuleModel([
      { path: '/api/v1/admin/users', method: 'post', operation: {} },
      { path: '/api/v1/admin/users/query', method: 'post', operation: {} },
      { path: '/api/v1/admin/roles', method: 'post', operation: {} }
    ])

    expect(groups.map(group => group.key)).toEqual(['admin:roles', 'admin:users'])
    expect(groups[1]?.collectionPath).toBe('/api/v1/admin/users')
  })

  it('derives method names from relative paths instead of operationId heuristics', () => {
    expect(buildMethodNameFromRelativePath('reset-password', 'put')).toBe('resetPassword')
    expect(buildMethodNameFromRelativePath('stats/cache', 'get')).toBe('statsCache')
    expect(buildMethodNameFromRelativePath('{id}/assign-roles', 'post')).toBe('assignRoles')
  })

  it('detects soft-delete crud capabilities from path presence only', () => {
    const capabilities = classifyCrudCapabilities('/api/v1/admin/users', [
      { path: '/api/v1/admin/users', method: 'post', operation: {} },
      { path: '/api/v1/admin/users/{id}', method: 'get', operation: {} },
      { path: '/api/v1/admin/users/{id}', method: 'put', operation: {} },
      { path: '/api/v1/admin/users/{id}', method: 'delete', operation: {} },
      { path: '/api/v1/admin/users/query', method: 'post', operation: {} },
      { path: '/api/v1/admin/users/{id}/restore', method: 'post', operation: {} },
      { path: '/api/v1/admin/users/trash', method: 'get', operation: {} },
      { path: '/api/v1/admin/users/trash/restore', method: 'post', operation: {} },
      { path: '/api/v1/admin/users/trash/permanent', method: 'delete', operation: {} }
    ])

    expect(capabilities.kind).toBe('soft-delete')
    expect(capabilities.hasBulkDelete).toBe(false)
  })

  it('preserves custom blocks when regenerating module content', () => {
    const merged = mergeModuleWithCustomSections(
      [
        '/**',
        ' * header',
        ' */',
        '// ==================== AUTO GENERATED START ====================',
        'new auto',
        '// ==================== AUTO GENERATED END ====================',
        '// ==================== CUSTOM METHODS START ====================',
        '// custom methods',
        '// ==================== CUSTOM METHODS END ====================',
        '// ==================== CUSTOM CONFIG START ====================',
        '// custom config',
        '// ==================== CUSTOM CONFIG END ====================',
        ''
      ].join('\n'),
      [
        '/**',
        ' * old header',
        ' */',
        '// ==================== AUTO GENERATED START ====================',
        'old auto',
        '// ==================== AUTO GENERATED END ====================',
        '// ==================== CUSTOM METHODS START ====================',
        'export const keepMe = true',
        '// ==================== CUSTOM METHODS END ====================',
        '// ==================== CUSTOM CONFIG START ====================',
        'export const cacheFor = 3000',
        '// ==================== CUSTOM CONFIG END ====================',
        ''
      ].join('\n')
    )

    expect(merged).toContain('new auto')
    expect(merged).toContain('export const keepMe = true')
    expect(merged).toContain('export const cacheFor = 3000')
    expect(merged).not.toContain('old auto')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test tests/unit/scripts/generate-api-types.test.ts`
Expected: FAIL because helper exports do not exist yet.

- [ ] **Step 3: Add helper exports and minimal implementation**

Implement and export the smallest pure helpers from `scripts/generate-api-types.ts` needed to satisfy the tests:

- `groupEndpointsByModuleModel`
- `buildMethodNameFromRelativePath`
- `classifyCrudCapabilities`
- `mergeModuleWithCustomSections`

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test tests/unit/scripts/generate-api-types.test.ts`
Expected: PASS

### Task 2: Rewrite the script output flow around direct module generation

**Files:**

- Modify: `/Users/kaizhou/SynologyDrive/works/wes_frontend/scripts/generate-api-types.ts`

- [ ] **Step 1: Remove the old aggregate client generation path**

Delete the `api-clients.ts` generation branch, including:

- old `generateApiClientsFile`
- old aggregate client code assembly
- old module imports from generated aggregate clients

- [ ] **Step 2: Rebuild endpoint grouping and CRUD classification from path facts**

Implement pure path-driven logic for:

- parsing `/api/v1/{module}/{model}`
- grouping by `{module}:{model}`
- detecting standard CRUD, soft-delete CRUD, and bulk delete support
- identifying extra non-CRUD endpoints

- [ ] **Step 3: Generate direct module auto sections**

Generate `src/api/modules/<camelModel>.ts` auto content with:

- imports
- collection path constant
- CRUD type exports for CRUD resources
- direct `contractClient` methods for extra endpoints
- direct non-CRUD API object for pure action resources

- [ ] **Step 4: Merge regenerated auto sections with preserved custom sections**

For existing files:

- validate markers
- replace only `AUTO GENERATED` content
- preserve `CUSTOM METHODS` and `CUSTOM CONFIG`
- fail fast on malformed marker layouts or unknown content outside markers

- [ ] **Step 5: Stop writing `src/api/generated/api-clients.ts`**

Ensure the script no longer writes or validates the deleted aggregate file.

- [ ] **Step 6: Run targeted script test after the rewrite**

Run: `pnpm test tests/unit/scripts/generate-api-types.test.ts`
Expected: PASS

### Task 3: Regenerate contract outputs and migrate imports to mechanical model naming

**Files:**

- Modify: generated outputs under `/Users/kaizhou/SynologyDrive/works/wes_frontend/src/api/generated/`
- Create/Modify: `/Users/kaizhou/SynologyDrive/works/wes_frontend/src/api/modules/*.ts`
- Modify: business imports under `/Users/kaizhou/SynologyDrive/works/wes_frontend/src/composables/`
- Modify: business imports under `/Users/kaizhou/SynologyDrive/works/wes_frontend/src/views/`
- Modify: business imports under `/Users/kaizhou/SynologyDrive/works/wes_frontend/src/components/`

- [ ] **Step 1: Run the generator against the current backend contract**

Run: `pnpm generate:types`
Expected: generated `openapi-types.ts`, `openapi-metadata.ts`, and `src/api/modules/*.ts` are updated with the new structure.

- [ ] **Step 2: Update business imports to mechanical model naming**

Rename imports and symbols such as:

- `@/api/modules/user` -> `@/api/modules/users`
- `userApi` -> `usersApi`
- `User` -> `UsersItem`

Repeat for all touched models referenced by the generated module set.

- [x] **Step 3: Remove stale aggregate-client usage**

Delete any remaining imports or references to `@/api/generated/api-clients`.

- [x] **Step 3.5: Remove stale generated module files**

Delete auto-generated module files that are no longer produced by the current OpenAPI grouping,
while preserving non-generated/manual files in `src/api/modules/`.

- [ ] **Step 4: Run the script regression test again**

Run: `pnpm test tests/unit/scripts/generate-api-types.test.ts`
Expected: PASS

### Task 4: Verify generation, type safety, and preservation behavior end-to-end

**Files:**

- Verify only

- [ ] **Step 1: Re-run generation to verify idempotence**

Run: `pnpm generate:types`
Expected: second run reports no unexpected changes or only stable regenerated output.

- [ ] **Step 2: Run type checking**

Run: `pnpm type:check`
Expected: PASS

- [ ] **Step 3: Verify manual block preservation on at least one module**

Add a temporary line inside one module's `CUSTOM METHODS` or `CUSTOM CONFIG` section, re-run `pnpm generate:types`, confirm the custom line remains, then remove the temporary line and regenerate once more.

- [ ] **Step 4: Verify stale generated modules are auto-removed**

Confirm the script deletes stale auto-generated module files while leaving non-generated/manual files untouched.
