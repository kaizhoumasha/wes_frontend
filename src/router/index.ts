import { createRouter, createWebHistory } from 'vue-router'
import { setRouterInstance } from '@/api/services/auth-error-handler'
import { createAuthGuard } from './guards/auth'
import { createPermissionGuard } from './guards/permission'
import { createRoutes } from './routes'
import { setTokenRefreshRouter } from '@/api/services/token-refresh'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: createRoutes()
})

setRouterInstance(router)
setTokenRefreshRouter(router)

router.beforeEach(createAuthGuard())
router.beforeEach(createPermissionGuard(router))

export default router
