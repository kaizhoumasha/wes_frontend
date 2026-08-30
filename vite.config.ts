import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import VueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

function resolveElementPlusChunk(id: string): string {
  if (id.includes('@element-plus/icons-vue')) {
    return 'ui-icons'
  }
  return 'ui-vendor'
}

function resolveVendorChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) {
    return undefined
  }

  if (id.includes('element-plus') || id.includes('@element-plus')) {
    return resolveElementPlusChunk(id)
  }

  if (id.includes('/vue-router/')) {
    return 'router-vendor'
  }

  if (id.includes('/pinia/')) {
    return 'state-vendor'
  }

  if (id.includes('/vue-i18n/')) {
    return 'i18n-vendor'
  }

  if (id.includes('/vee-validate/') || id.includes('/@vee-validate/') || id.includes('/zod/')) {
    return 'form-vendor'
  }

  if (id.includes('/@vueuse/')) {
    return 'vueuse-vendor'
  }

  if (id.includes('/alova/')) {
    return 'api-vendor'
  }

  if (id.includes('/@iconify/') || id.includes('/@iconify-json/')) {
    return 'icon-vendor'
  }

  if (
    id.includes('/lodash-es/') ||
    id.includes('/date-fns/') ||
    id.includes('/date-fns-tz/') ||
    id.includes('/clsx/') ||
    id.includes('/tailwind-merge/')
  ) {
    return 'utils-vendor'
  }

  if (
    id.includes('/vue/') ||
    id.includes('/@vue/') ||
    id.includes('/vue-demi/') ||
    id.includes('/@babel/parser/') ||
    id.includes('/estree-walker/')
  ) {
    return 'vue-core'
  }

  return 'vendor'
}

export default defineConfig(({ mode, command }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET ?? 'http://localhost:8001'
  const enableVueDevTools = command === 'serve' && mode === 'development'
  const isDockerDev = process.env.FRONTEND_APP_DIR === '/app'

  return {
    // Docker 开发环境与宿主机本地开发会共享同一份源码目录。
    // 将容器内的 Vite 预构建缓存切到独立目录，避免复用宿主机生成的绝对路径缓存。
    cacheDir: isDockerDev ? '/tmp/wes-frontend-vite-cache' : 'node_modules/.vite',

    plugins: [
      tailwindcss(),
      vue(),
      enableVueDevTools ? VueDevTools() : undefined,
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        dts: 'src/types/auto-imports.d.ts',
        eslintrc: {
          enabled: true
        }
      }),
      Components({
        resolvers: [ElementPlusResolver({ importStyle: 'sass' })],
        dts: 'src/types/components.d.ts'
      })
    ],

    // 构建优化
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: false,
      chunkSizeWarningLimit: 1000,
      // 使用 esbuild 压缩（Vite 内置，无需额外依赖）
      minify: 'esbuild',

      rollupOptions: {
        output: {
          // 细粒度的代码分割 - 使用函数形式避免空 chunk
          manualChunks(id) {
            return resolveVendorChunk(id)
          },
          // 文件名模板，便于长期缓存
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]'
        }
      }
    },

    // 依赖优化
    optimizeDeps: {
      // 懒加载路由仍可能发现新的 Element Plus 深层依赖；刷新预构建产物时继续服务旧请求，
      // 避免冷启动导航收到 504 Outdated Optimize Dep。
      ignoreOutdatedRequests: true,
      include: [
        'vue',
        'vue-router',
        'pinia',
        'element-plus',
        'element-plus/es/components/**/style/index',
        'lodash-es',
        '@vueuse/core',
        'alova'
      ],
      exclude: [] // 需要排除预构建的依赖
    },

    // 路径解析
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },

    // CSS 配置
    css: {
      devSourcemap: true
    },

    // 开发服务器
    server: {
      port: 5173,
      host: true,
      open: false,
      // 预热常用文件
      warmup: {
        clientFiles: [
          './src/main.ts',
          './src/App.vue',
          './src/router/index.ts',
          './src/stores/**/*.ts'
        ]
      },
      proxy: {
        '^/api/': {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: path => path
        },
        '/ws': {
          target: apiProxyTarget.replace('http://', 'ws://').replace('https://', 'wss://'),
          ws: true
        }
      }
    },

    // 预览服务器
    preview: {
      port: 4173,
      host: true,
      open: false
    }
  }
})
