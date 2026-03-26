import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * 合并 Tailwind CSS 类名
 *
 * 使用 clsx 处理条件类名，twMerge 解决 Tailwind 类名冲突
 *
 * @example
 * cn('px-2 py-1', 'p-4') // 'p-4' (p-4 覆盖 px-2 py-1)
 * cn('text-red-500', isDanger && 'text-red-700') // 条件类名
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}