import { computed, ref, type ComputedRef } from 'vue'

import type { FilterGroup } from '@/api/base/crud-request-adapter'
import type { SearchConditionDraft, SearchFavorite, SearchFieldDef } from '@/types/search'
import { validateConditionDraft } from '@/types/search'
import { countFilterNodes } from '@/utils/advanced-search'
import { compileFilterGroup } from '@/utils/search-compiler'

interface UseSearchFavoritesOptions {
  resourceKey: string
  initialFavorites: SearchFavorite[]
  fields: SearchFieldDef[]
}

interface SaveSearchFavoritePayload {
  name: string
  filterGroup: FilterGroup
}

interface SaveSearchFavoriteResult {
  ok: boolean
  reason?: 'empty-name' | 'duplicate' | 'invalid-filter'
}

interface UseSearchFavoritesReturn {
  favorites: ComputedRef<SearchFavorite[]>
  saveFavorite: (payload: SaveSearchFavoritePayload) => SaveSearchFavoriteResult
}

const VALID_FILTER_COUPLES = new Set(['and', 'or', 'not'])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function parseConditionDraft(value: unknown, fields: SearchFieldDef[]): SearchConditionDraft | null {
  if (!isRecord(value) || typeof value.field !== 'string' || typeof value.operator !== 'string') {
    return null
  }

  const draft: SearchConditionDraft = {
    field: value.field,
    operator: value.operator as SearchConditionDraft['operator'],
    value: value.value
  }

  if (typeof value.source === 'string') {
    draft.source = value.source as SearchConditionDraft['source']
  }

  return validateConditionDraft(draft, fields, { context: '[useSearchFavorites]', silent: true })
    ? draft
    : null
}

function isValidFilterGroup(filterGroup: FilterGroup, fields: SearchFieldDef[]): boolean {
  if (!hasValidFilterGroupShape(filterGroup)) {
    return false
  }

  const compiledFilterGroup = compileFilterGroup(filterGroup, fields)
  if (!compiledFilterGroup) {
    return false
  }

  return countFilterNodes(compiledFilterGroup) === countFilterNodes(filterGroup)
}

function hasValidFilterGroupShape(value: unknown): value is FilterGroup {
  if (!isRecord(value) || !VALID_FILTER_COUPLES.has(String(value.couple))) {
    return false
  }

  if (!Array.isArray(value.conditions) || value.conditions.length === 0) {
    return false
  }

  return value.conditions.every(condition => {
    if (!isRecord(condition)) {
      return false
    }

    if ('conditions' in condition) {
      return hasValidFilterGroupShape(condition)
    }

    return typeof condition.field === 'string' && typeof condition.op === 'string'
  })
}

function parseSearchFavorite(value: unknown, fields: SearchFieldDef[]): SearchFavorite | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') {
    return null
  }

  const rawConditions = Array.isArray(value.conditions) ? value.conditions : []
  const conditions = rawConditions
    .map(condition => parseConditionDraft(condition, fields))
    .filter((condition): condition is SearchConditionDraft => condition !== null)

  if (conditions.length !== rawConditions.length) {
    return null
  }

  const rawFilterGroup = value.filterGroup
  const filterGroup =
    rawFilterGroup && isRecord(rawFilterGroup) ? (rawFilterGroup as FilterGroup) : undefined

  if (filterGroup && !isValidFilterGroup(filterGroup, fields)) {
    return null
  }

  if (conditions.length === 0 && !filterGroup) {
    return null
  }

  return {
    id: value.id,
    name: value.name,
    conditions,
    filterGroup,
    scope: typeof value.scope === 'string' ? value.scope : undefined
  }
}

function sanitizeFavorites(
  favorites: SearchFavorite[],
  fields: SearchFieldDef[]
): SearchFavorite[] {
  return favorites
    .map(favorite => parseSearchFavorite(favorite, fields))
    .filter((favorite): favorite is SearchFavorite => favorite !== null)
}

function mergeFavorites(
  baseFavorites: SearchFavorite[],
  userFavorites: SearchFavorite[]
): SearchFavorite[] {
  const mergedFavorites = [...baseFavorites]

  for (const favorite of userFavorites) {
    if (mergedFavorites.some(item => item.id === favorite.id)) {
      continue
    }

    mergedFavorites.push(favorite)
  }

  return mergedFavorites
}

function loadStoredFavorites(storageKey: string, fields: SearchFieldDef[]): SearchFavorite[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) {
      return []
    }

    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) {
      return []
    }

    return parsed
      .map(item => parseSearchFavorite(item, fields))
      .filter((favorite): favorite is SearchFavorite => favorite !== null)
  } catch (error) {
    console.warn('[useSearchFavorites] Failed to load favorites from localStorage', error)
    return []
  }
}

function persistFavorites(storageKey: string, favorites: SearchFavorite[]): void {
  if (typeof window === 'undefined') {
    return
  }

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(favorites))
  } catch (error) {
    console.warn('[useSearchFavorites] Failed to persist favorites to localStorage', error)
  }
}

export function useSearchFavorites(
  options: UseSearchFavoritesOptions
): UseSearchFavoritesReturn {
  const storageKey = `wes-smart-search-favorites:${options.resourceKey}`
  const baseFavorites = sanitizeFavorites(options.initialFavorites, options.fields)
  const userFavorites = ref<SearchFavorite[]>(loadStoredFavorites(storageKey, options.fields))
  const favorites = computed<SearchFavorite[]>(() => {
    return mergeFavorites(baseFavorites, userFavorites.value)
  })

  function saveFavorite(payload: SaveSearchFavoritePayload): SaveSearchFavoriteResult {
    const normalizedName = payload.name.trim()
    if (!normalizedName) {
      return { ok: false, reason: 'empty-name' }
    }

    if (!isValidFilterGroup(payload.filterGroup, options.fields)) {
      return { ok: false, reason: 'invalid-filter' }
    }

    const hasDuplicate = favorites.value.some(favorite => {
      return favorite.name.trim().toLocaleLowerCase() === normalizedName.toLocaleLowerCase()
    })
    if (hasDuplicate) {
      return { ok: false, reason: 'duplicate' }
    }

    userFavorites.value = [
      ...userFavorites.value,
      {
        id: `favorite_${Date.now()}`,
        name: normalizedName,
        conditions: [],
        filterGroup: payload.filterGroup,
        scope: options.resourceKey
      }
    ]
    persistFavorites(storageKey, userFavorites.value)

    return { ok: true }
  }

  return {
    favorites,
    saveFavorite
  }
}
