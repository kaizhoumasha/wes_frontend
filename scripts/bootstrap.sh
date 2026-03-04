#!/usr/bin/env bash
# WES Frontend 项目初始化脚本
# 用途：初始化前端项目，包括依赖安装、Git 配置、开发环境设置

set -e  # 遇到错误立即退出

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印带颜色的消息
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# 切换到项目根目录
cd "$PROJECT_ROOT"

print_info "================================================"
print_info "WES Frontend 项目初始化脚本"
print_info "项目目录: $PROJECT_ROOT"
print_info "================================================"

# ==================== 检查环境 ====================

print_info "检查开发环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

NODE_VERSION=$(node -v)
print_success "Node.js 版本: $NODE_VERSION"

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    print_warning "pnpm 未安装，正在安装..."
    npm install -g pnpm@latest
fi

PNPM_VERSION=$(pnpm -v)
print_success "pnpm 版本: $PNPM_VERSION"

# 检查 Git
if ! command -v git &> /dev/null; then
    print_error "Git 未安装，请先安装 Git"
    exit 1
fi

GIT_VERSION=$(git --version)
print_success "Git 版本: $GIT_VERSION"

# ==================== 安装依赖 ====================

print_info "安装项目依赖..."

if [ ! -f "package.json" ]; then
    print_error "package.json 不存在，请先创建项目"
    exit 1
fi

# 使用 pnpm 安装依赖
pnpm install

print_success "依赖安装完成"

# ==================== 创建必要的目录 ====================

print_info "创建项目目录结构..."

DIRECTORIES=(
    "src/api/auth"
    "src/api/admin"
    "src/api/warehousing"
    "src/api/device"
    "src/api/callback"
    "src/components/common"
    "src/components/business"
    "src/components/ui"
    "src/composables"
    "src/layouts"
    "src/router/routes"
    "src/router/guards"
    "src/stores"
    "src/types"
    "src/utils"
    "src/views/auth"
    "src/views/dashboard"
    "src/views/admin"
    "src/views/warehousing"
    "src/views/device"
    "src/locales"
    "src/constants"
    "public/images"
    "public/icons"
    "docs"
)

for dir in "${DIRECTORIES[@]}"; do
    if [ ! -d "$dir" ]; then
        mkdir -p "$dir"
        print_success "创建目录: $dir"
    fi
done

# ==================== 创建环境变量文件 ====================

print_info "创建环境变量文件..."

if [ ! -f ".env.development" ]; then
    cat > .env.development << 'EOF'
# 开发环境配置
VITE_APP_TITLE=P9 WES (开发环境)
VITE_API_BASE_URL=http://localhost:8001/api/v1
VITE_WS_URL=ws://localhost:8001/api/v1/ws
VITE_APP_MOCK=false
VITE_APP_DEV=true
EOF
    print_success "创建 .env.development"
fi

if [ ! -f ".env.production" ]; then
    cat > .env.production << 'EOF'
# 生产环境配置
VITE_APP_TITLE=P9 WES
VITE_API_BASE_URL=https://api.wes.example.com/api/v1
VITE_WS_URL=wss://api.wes.example.com/api/v1/ws
VITE_APP_MOCK=false
VITE_APP_DEV=false
EOF
    print_success "创建 .env.production"
fi

# ==================== 初始化 Git ====================

print_info "初始化 Git 仓库..."

if [ ! -d ".git" ]; then
    git init
    print_success "Git 仓库初始化完成"
else
    print_info "Git 仓库已存在"
fi

# 创建 .gitignore
if [ ! -f ".gitignore" ]; then
    cat > .gitignore << 'EOF'
# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

# Dependencies
node_modules
.pnp
.pnp.js

# Build outputs
dist
dist-ssr
*.local

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
.DS_Store
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Environment files
.env.local
.env.*.local

# Cache
.cache
.parcel-cache
.vite
.eslintcache
.stylelintcache

# TypeScript
*.tsbuildinfo

# Temporary files
*.tmp
*.temp
EOF
    print_success "创建 .gitignore"
fi

# ==================== 创建基础配置文件 ====================

print_info "创建基础配置文件..."

# 创建 TypeScript 配置
if [ ! -f "tsconfig.json" ]; then
    cat > tsconfig.json << 'EOF'
{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "compilerOptions": {
    "target": "ES2020",
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "jsx": "preserve",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "types": ["element-plus/global"],
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "moduleResolution": "bundler"
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "exclude": ["node_modules", "dist"]
}
EOF
    print_success "创建 tsconfig.json"
fi

# 创建 Vite 配置 (Vite 8+)
if [ ! -f "vite.config.ts" ]; then
    cat > vite.config.ts << 'EOF'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { resolve } from 'path'

export default defineConfig({
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
      resolvers: [ElementPlusResolver()],
      dts: 'src/types/components.d.ts'
    })
  ],

  // Vite 8 使用 Rolldown 引擎 (Rust 编写)
  build: {
    rollupOptions: {
      // Rolldown 配置
      acoin: true,  // 使用 Acorn 解析器（更快）

      output: {
        manualChunks(id) {
          // 分包策略
          if (id.includes('node_modules')) {
            return 'vendor'
          }
        }
      }
    }
  },

  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },

  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8001',
        changeOrigin: true
      },
      '/ws': {
        target: 'ws://localhost:8001',
        ws: true
      }
    }
  }
})
EOF
    print_success "创建 vite.config.ts (Vite 8+)"
fi

# ==================== 创建 README ====================

print_info "创建 README.md..."

if [ ! -f "README.md" ]; then
    cat > README.md << 'EOF'
# WES Frontend

> P9 智能仓储执行系统前端项目

## 技术栈

- **框架**: Vue 3.5+ (Composition API)
- **语言**: TypeScript 5.6+
- **构建工具**: Vite 6+
- **状态管理**: Pinia 2.3+
- **路由**: Vue Router 4.x
- **UI 组件**: Element Plus 2.9+、Tailwind CSS 3.4+
- **HTTP 客户端**: alova 3.2+
- **包管理器**: pnpm 10+

## 快速开始

### 安装依赖

```bash
pnpm install
```

### 开发模式

```bash
pnpm dev
```

访问: http://localhost:5173

### 构建生产版本

```bash
pnpm build
```

### 代码检查

```bash
pnpm lint
```

## Git Worktree 开发

### 创建新的 worktree

```bash
./scripts/git-worktree.sh add feature-your-feature
```

### 列出所有 worktree

```bash
./scripts/git-worktree.sh list
```

### 删除 worktree

```bash
./scripts/git-worktree.sh remove feature-your-feature
```

## 项目结构

```
src/
├── api/           # API 请求模块
├── assets/        # 静态资源
├── components/    # 组件
├── composables/   # 组合式函数
├── layouts/       # 布局组件
├── router/        # 路由配置
├── stores/        # Pinia 状态管理
├── types/         # TypeScript 类型
├── utils/         # 工具函数
└── views/         # 页面视图
```

## 环境变量

- `.env.development`: 开发环境配置
- `.env.production`: 生产环境配置

## 相关文档

- [技术选型文档](./docs/WES_FRONTEND_TECH_STACK.md)
- [后端 API 文档](../wes_backend/docs/SRS.md)
- [Git Worktree 使用指南](./scripts/git-worktree.sh)
EOF
    print_success "创建 README.md"
fi

# ==================== Git Worktree 初始化 ====================

print_info "初始化 Git Worktree 结构..."

# 检查是否已初始化主分支 worktree
if [ ! -d "main" ]; then
    # 如果是全新仓库，先创建初始提交
    if [ -z "$(git branch --show-current)" ]; then
        git checkout -b main
        git add .
        git commit -m "chore: initialize WES frontend project"
        print_success "创建初始提交"
    fi

    # 将当前目录转换为 worktree
    CURRENT_BRANCH=$(git branch --show-current)
    TEMP_DIR=".git_temp_$(date +%s)"

    # 创建临时目录
    mkdir -p "$TEMP_DIR"

    # 移动 .git 到临时目录
    mv .git "$TEMP_DIR/"

    # 创建主 worktree
    git worktree add main "$CURRENT_BRANCH"

    # 移动 .git 回来
    mv "$TEMP_DIR/.git" .

    # 清理临时目录
    rm -rf "$TEMP_DIR"

    print_success "初始化 Git Worktree 结构完成"
    print_info "主分支 worktree: ./main/"
    print_warning "请重新运行此脚本以完成初始化"
    exit 0
fi

# ==================== 完成 ====================

print_success "================================================"
print_success "项目初始化完成！"
print_success "================================================"
print_info ""
print_info "下一步操作："
print_info "  1. 启动开发服务器: pnpm dev"
print_info "  2. 创建新的 worktree: ./scripts/git-worktree.sh add <branch-name>"
print_info "  3. 查看项目文档: cat docs/WES_FRONTEND_TECH_STACK.md"
print_info ""
EOF
