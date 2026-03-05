import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig(({ mode }) => {
  // 加载环境变量
  const env = loadEnv(mode, process.cwd(), '')
  const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8001/api/v1'

  return {
  plugins: [
    vue(),
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
    // 使用 esbuild 压缩（Vite 内置，无需额外依赖）
    minify: 'esbuild',

    rollupOptions: {
      output: {
        // 细粒度的代码分割 - 使用函数形式避免空 chunk
        manualChunks(id) {
          // node_modules 包分割
          if (id.includes('node_modules')) {
            // Vue 核心
            if (id.includes('vue') || id.includes('pinia') || id.includes('vue-router')) {
              return 'vue-vendor'
            }
            // UI 框架
            if (id.includes('element-plus')) {
              return 'ui-vendor'
            }
            // 工具库
            if (id.includes('lodash-es') || id.includes('date-fns') || id.includes('@vueuse')) {
              return 'utils-vendor'
            }
            // 其他第三方
            return 'vendor'
          }
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
    include: [
      'vue',
      'vue-router',
      'pinia',
      'element-plus',
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
      '/api': {
        target: apiBaseUrl.replace('/api/v1', ''),
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      },
      '/ws': {
        target: apiBaseUrl.replace('http://', 'ws://').replace('/api/v1', ''),
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
