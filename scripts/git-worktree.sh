#!/usr/bin/env bash
# Git Worktree 管理脚本
# 用途：管理多个并行开发的 Git Worktree

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

print_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
print_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
print_warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
print_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# 获取脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Worktree 基础目录（放在项目外部，避免与源码混合）
WORKTREES_BASE_DIR="$(dirname "$PROJECT_ROOT")/wes_frontend-worktrees"

# 切换到项目根目录
cd "$PROJECT_ROOT"

# 显示帮助信息
show_help() {
    cat << EOF
Git Worktree 管理脚本

用法: ./scripts/git-worktree.sh <command> [arguments]

命令:
  add <branch>        创建新的 worktree
  list                列出所有 worktree
  remove <branch>     删除 worktree
  prune               清理无效的 worktree
  help                显示此帮助信息

示例:
  ./scripts/git-worktree.sh add feature-auth
  ./scripts/git-worktree.sh list
  ./scripts/git-worktree.sh remove feature-auth
  ./scripts/git-worktree.sh prune

Worktree 目录结构:
  ~/SynologyDrive/works/
  ├── wes_frontend/                    # 主仓库（develop 分支）
  │   ├── .git/                        # Git 仓库
  │   ├── src/
  │   └── scripts/
  └── wes_frontend-worktrees/          # Worktree 基础目录
      ├── feature-auth/                # 功能分支 worktree
      ├── feature-inbound/             # 功能分支 worktree
      └── hotfix-device-status/        # 热修复分支 worktree

注意:
  - 每个分支在独立的目录中开发
  - 共享同一个 .git 仓库
  - 切换分支只需切换目录
  - Worktree 存放在项目外部，避免与源码混合
EOF
}

# 检查是否在 Git 仓库中
check_git_repo() {
    if [ ! -d ".git" ]; then
        print_error "当前目录不是 Git 仓库"
        exit 1
    fi
}

# 创建新的 worktree
add_worktree() {
    local branch_name=$1
    local worktree_path="$WORKTREES_BASE_DIR/$branch_name"

    if [ -z "$branch_name" ]; then
        print_error "请指定分支名称"
        echo "用法: ./scripts/git-worktree.sh add <branch-name>"
        exit 1
    fi

    # 确保 worktree 基础目录存在
    mkdir -p "$WORKTREES_BASE_DIR"

    # 检查 worktree 是否已存在
    if [ -d "$worktree_path" ]; then
        print_error "Worktree 目录已存在: $worktree_path"
        exit 1
    fi

    print_info "创建 worktree: $branch_name"
    print_info "目标路径: $worktree_path"

    # 创建 worktree
    git worktree add "$worktree_path" -b "$branch_name"

    if [ $? -eq 0 ]; then
        print_success "Worktree 创建成功: $worktree_path"

        # 切换到新 worktree 并安装依赖
        print_info "安装依赖 (这可能需要几分钟)..."
        cd "$worktree_path"
        pnpm install --no-frozen-lockfile

        # 创建 .gitignore（排除 node_modules）
        cat > .gitignore << EOF
# Worktree 本地文件
node_modules
.env.local
.env.*.local
.cache
EOF

        cd "$PROJECT_ROOT"
        print_success "Worktree 初始化完成"
    else
        print_error "Worktree 创建失败"
        exit 1
    fi
}

# 列出所有 worktree
list_worktrees() {
    print_info "当前 Worktree 列表:"
    echo ""

    # 获取所有 worktree
    git worktree list --porcelain | while read -r line; do
        if [[ $line == worktree* ]]; then
            local path=${line#worktree }
            local branch=$(git worktree list --porcelain | grep -A1 "^worktree $path" | grep "^branch " | cut -d' ' -f2)
            local current_branch=$(git branch --show-current)

            # 转换为友好的相对路径
            local rel_path
            if [ "$path" == "$PROJECT_ROOT" ]; then
                rel_path="${GREEN}./${NC} (主仓库)"
            elif [[ "$path" == "$WORKTREES_BASE_DIR"/* ]]; then
                local branch_dir="${path#$WORKTREES_BASE_DIR/}"
                rel_path="../worktrees/$branch_dir"
            else
                rel_path="$path"
            fi

            # 检查是否是当前 worktree
            local current_dir="$(pwd)"
            if [ "$current_dir" == "$path" ] || [[ "$current_dir" == "$path"/* ]]; then
                echo -e "  ${GREEN}★${NC} $rel_path ${YELLOW}($branch)${NC} ${GREEN}[当前]${NC}"
            else
                echo -e "    $rel_path ($branch)"
            fi
        fi
    done

    echo ""
    print_info "提示: 使用 'cd <worktree-path>' 切换到不同的 worktree"
}

# 删除 worktree
remove_worktree() {
    local branch_name=$1
    local worktree_path="$WORKTREES_BASE_DIR/$branch_name"

    if [ -z "$branch_name" ]; then
        print_error "请指定分支名称"
        echo "用法: ./scripts/git-worktree.sh remove <branch-name>"
        exit 1
    fi

    # 检查 worktree 是否存在
    if [ ! -d "$worktree_path" ]; then
        print_error "Worktree 目录不存在: $worktree_path"
        exit 1
    fi

    # 检查是否是主分支
    if [ "$branch_name" == "main" ]; then
        print_error "不能删除主分支 worktree"
        exit 1
    fi

    print_warning "确定要删除 worktree: $branch_name?"
    read -p "请输入 'yes' 确认删除: " confirm

    if [ "$confirm" != "yes" ]; then
        print_info "取消删除"
        exit 0
    fi

    print_info "删除 worktree: $branch_name"

    # 移除 worktree
    git worktree remove "$worktree_path"

    if [ $? -eq 0 ]; then
        print_success "Worktree 删除成功"
    else
        print_error "Worktree 删除失败"

        # 手动清理
        print_warning "尝试手动清理..."
        rm -rf "$worktree_path"
        git worktree prune
        print_success "手动清理完成"
    fi
}

# 清理无效的 worktree
prune_worktrees() {
    print_info "清理无效的 worktree..."

    git worktree prune

    print_success "清理完成"
}

# 主函数
main() {
    check_git_repo

    case "${1:-}" in
        add)
            add_worktree "$2"
            ;;
        list)
            list_worktrees
            ;;
        remove)
            remove_worktree "$2"
            ;;
        prune)
            prune_worktrees
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            print_error "未知命令: $1"
            echo ""
            show_help
            exit 1
            ;;
    esac
}

main "$@"
