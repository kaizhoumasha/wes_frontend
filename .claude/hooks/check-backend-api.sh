#!/bin/bash
# .claude/hooks/check-backend-api.sh
# Claude Code Hook: 检查后端 API 能力

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔍 检查后端 API 能力..."

# 1. 检查后端服务是否可访问
if ! curl -s http://localhost:8001/api/openapi.json > /dev/null 2>&1; then
    echo -e "${RED}❌ 后端服务未启动，无法检查 API 能力${NC}"
    echo "   请启动后端服务：cd ../wes_backend && poetry run python -m uvicorn app.main:app"
    exit 1
fi

# 2. 检查是否需要重新生成类型
BACKEND_MD5=$(curl -s http://localhost:8001/api/openapi.json | md5sum | cut -d' ' -f1)
CACHED_MD5_FILE=".cache/openapi.md5"

if [ -f "$CACHED_MD5_FILE" ]; then
    CACHED_MD5=$(cat "$CACHED_MD5_FILE")
    if [ "$BACKEND_MD5" != "$CACHED_MD5" ]; then
        echo -e "${YELLOW}⚠️  后端 API 已变更，需要重新同步契约${NC}"
        echo "   请执行："
        echo "     pnpm type:generate"
        echo "     pnpm zod:generate"
        echo "     pnpm permission:generate"
        echo ""
    fi
else
    echo -e "${YELLOW}⚠️  首次检查，建议执行契约同步${NC}"
fi

# 3. 检查用户是否正在开发新 API 模块
if ls src/api/modules/*.ts 1> /dev/null 2>&1; then
    echo -e "${GREEN}✓ 检测到 API 模块${NC}"
    echo ""
    echo "📝 API 能力检查清单："
    echo ""

    for file in src/api/modules/*.ts; do
        filename=$(basename "$file" .ts)

        # 单次读取文件内容，避免多次 I/O
        file_content=$(cat "$file" 2>/dev/null)

        # 检查使用了哪种 API 创建方式
        if echo "$file_content" | grep -q "createSoftDeleteCrudApi"; then
            echo "  📦 $filename: 软删除 CRUD (包含回收站)"

            # 检查是否有额外 API 能力
            extra_apis=$(echo "$file_content" | grep -E "^\s+async\s+\w+" | grep -v "createSoftDeleteCrudApi" | sed 's/.*async //; s/(.*//' | tr '\n' ', ' | sed 's/, $//')
            if [ -n "$extra_apis" ]; then
                echo "     └─ 额外能力: $extra_apis"
            fi
        elif echo "$file_content" | grep -q "createCrudApi"; then
            echo "  📦 $filename: 标准 CRUD"

            # 检查是否有额外 API 能力
            extra_apis=$(echo "$file_content" | grep -E "^\s+async\s+\w+" | sed 's/.*async //; s/(.*//' | tr '\n' ', ' | sed 's/, $//')
            if [ -n "$extra_apis" ]; then
                echo "     └─ 额外能力: $extra_apis"
            fi
        fi
    done

    echo ""
    echo "🔍 建议检查项："
    echo ""

    # 4. 检查是否有遗漏的能力
    for file in src/api/modules/*.ts; do
        filename=$(basename "$file" .ts)

        # 单次读取文件内容
        file_content=$(cat "$file" 2>/dev/null)

        # 检查是否有批量删除端点但未实现
        if echo "$file_content" | grep -q "bulk" && ! echo "$file_content" | grep -q "bulkDelete"; then
            echo "  ⚠️  $filename: 检测到 'bulk' 关键字，但未使用 bulkDelete"
        fi

        # 检查是否有软删除端点但用了标准 CRUD
        if echo "$file_content" | grep -q "trash\|restore" && echo "$file_content" | grep -q "createCrudApi"; then
            echo -e "  ${YELLOW}⚠️  $filename: 检测到软删除端点，但使用了 createCrudApi${NC}"
            echo "     建议改为 createSoftDeleteCrudApi 以启用回收站功能"
        fi

        # 检查是否有扩展但未使用
        if echo "$file_content" | grep -q "\.\.\.baseUserApi\|\.\.\.baseApi"; then
            config_file="src/views/admin/${filename}s/config/pageConfig.ts"
            if [ -f "$config_file" ] && ! grep -q "extensions" "$config_file" 2>/dev/null; then
                echo -e "  ${YELLOW}⚠️  $filename: API 有扩展能力，但页面配置未使用 extensions${NC}"
            fi
        fi
    done
fi

echo ""
