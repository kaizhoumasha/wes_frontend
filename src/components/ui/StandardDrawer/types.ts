import type { DialogDirection, DialogSize } from '@/components/ui/StandardDialog'

export type DrawerSize = DialogSize
export type DrawerDirection = DialogDirection
export type DrawerClass = string | string[] | Record<string, boolean>
export type DrawerBodyPadding = 'none' | 'normal'

export interface StandardDrawerProps {
  modelValue: boolean
  title?: string
  size?: DrawerSize
  width?: string | number
  direction?: DrawerDirection
  customClass?: DrawerClass
  bodyPadding?: DrawerBodyPadding
  bodyScrollable?: boolean
  closeOnClickModal?: boolean
  closeOnPressEscape?: boolean
  destroyOnClose?: boolean
  appendToBody?: boolean
  modal?: boolean
  withHeader?: boolean
}

export interface StandardDrawerEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'open'): void
}
