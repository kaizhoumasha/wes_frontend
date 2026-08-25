import 'vue-router'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    permission?: string
    permissions?: string[]
    title?: string
    menu?: {
      name: string
      title?: string
      icon?: string
      sortOrder?: number
      hidden?: boolean
    }
  }
}
