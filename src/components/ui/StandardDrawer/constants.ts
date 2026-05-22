import type { DialogSize, SizeConfig } from '@/components/ui/StandardDialog'

export const DRAWER_SIZE_CONFIG: Record<DialogSize, SizeConfig> = {
  xs: {
    width: 400,
    maxWidth: 92
  },
  sm: {
    width: 520,
    maxWidth: 92
  },
  md: {
    width: 640,
    maxWidth: 92
  },
  lg: {
    width: 800,
    maxWidth: 92
  },
  xl: {
    width: 960,
    maxWidth: 94
  },
  full: {
    width: 0,
    maxWidth: 96
  }
} as const

export function resolveDrawerSize(size: DialogSize = 'md'): string {
  const config = DRAWER_SIZE_CONFIG[size]
  if (size === 'full') return `${config.maxWidth}vw`
  return `min(${config.width}px, ${config.maxWidth}vw)`
}
