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
    sourcemap: false, // 生产环境不生成 sourcemap
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // 生产环境移除 console
        drop_debugger: true
      }
    },

    rollupOptions: {
      output: {
        // 细粒度的代码分割
        manualChunks: {
          // Vue 核心
          'vue-vendor': ['vue', 'vue-router', 'pinia'],
          // UI 框架
          'ui-vendor': ['element-plus'],
          // 工具库
          'utils-vendor': ['lodash-es', 'date-fns', 'date-fns-tz', '@vueuse/core'],
          // 其他第三方
          'vendor': ['alova', 'clsx', 'tailwind-merge']
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
