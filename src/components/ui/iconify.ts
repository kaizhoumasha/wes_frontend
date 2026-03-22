import { addCollection } from '@iconify/vue/dist/offline'
import { icons as epIcons } from '@iconify-json/ep'
import { icons as lucideIcons } from '@iconify-json/lucide'

let isRegistered = false

export function ensureIconifyCollections(): void {
  if (isRegistered) {
    return
  }

  addCollection(epIcons)
  addCollection(lucideIcons)

  isRegistered = true
}
