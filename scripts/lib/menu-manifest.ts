import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  buildCurrentMenuManifest,
  buildMenuManifestEntries,
  type MenuManifestEntry,
} from '../../src/router/menu-manifest'

const SCRIPT_DIR = dirname(fileURLToPath(import.meta.url))
export const FRONTEND_ROOT = resolve(SCRIPT_DIR, '../..')
export const DEFAULT_MENU_MANIFEST_PATH = resolve(FRONTEND_ROOT, 'artifacts/menu-manifest.json')

export function resolveMenuManifestOutputPath(outputPath?: string): string {
  return outputPath ? resolve(FRONTEND_ROOT, outputPath) : DEFAULT_MENU_MANIFEST_PATH
}

export function writeMenuManifestFile(entries: MenuManifestEntry[], outputPath: string): void {
  mkdirSync(dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, `${JSON.stringify(entries, null, 2)}\n`, 'utf-8')
}

export function generateMenuManifest(outputPath?: string): { entries: MenuManifestEntry[]; outputPath: string } {
  const entries = buildCurrentMenuManifest()
  const resolvedOutputPath = resolveMenuManifestOutputPath(outputPath)
  writeMenuManifestFile(entries, resolvedOutputPath)
  return {
    entries,
    outputPath: resolvedOutputPath,
  }
}

export { buildMenuManifestEntries }
export type { MenuManifestEntry } from '../../src/router/menu-manifest'
