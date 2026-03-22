<!--
StandardDialog 组件演示页面

展示所有尺寸和配置选项
-->

<script setup lang="ts">
import { ref } from 'vue'
import { UploadFilled } from '@element-plus/icons-vue'
import { StandardDialog } from '@/components/ui/StandardDialog'

// ==================== 对话框状态 ====================

const dialogState = ref({
  xs: false,
  sm: false,
  md: false,
  lg: false,
  xl: false,
  full: false,
  danger: false,
  loading: false,
  customFooter: false,
  noFooter: false
})

// 模拟提交
const submitting = ref(false)

async function handleSubmit() {
  submitting.value = true
  await new Promise(resolve => setTimeout(resolve, 2000))
  submitting.value = false
  dialogState.value.md = false
}

function handleDelete() {
  submitting.value = true
  setTimeout(() => {
    submitting.value = false
    dialogState.value.danger = false
  }, 1500)
}

// 表单数据
const formData = ref({
  username: '',
  email: '',
  phone: '',
  department: '',
  role: '',
  status: 'active'
})

// 高级搜索字段
const searchFields = ref([
  { field: 'username', operator: 'contains', value: '' },
  { field: 'email', operator: 'contains', value: '' },
  { field: 'createdAt', operator: 'between', value: '' }
])
</script>

<template>
  <div class="demo-page p-8">
    <h1 class="text-2xl font-bold mb-8">StandardDialog 组件演示</h1>

    <!-- ==================== 尺寸演示 ==================== -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-4">尺寸预设</h2>

      <div class="flex flex-wrap gap-3">
        <el-button @click="dialogState.xs = true">XS (400px)</el-button>
        <el-button @click="dialogState.sm = true">SM (520px)</el-button>
        <el-button @click="dialogState.md = true">MD (640px)</el-button>
        <el-button @click="dialogState.lg = true">LG (800px)</el-button>
        <el-button @click="dialogState.xl = true">XL (900px)</el-button>
        <el-button @click="dialogState.full = true">Full (95vw)</el-button>
      </div>
    </section>

    <!-- ==================== 特殊配置 ==================== -->
    <section class="mb-12">
      <h2 class="text-lg font-semibold mb-4">特殊配置</h2>

      <div class="flex flex-wrap gap-3">
        <el-button
          type="danger"
          @click="dialogState.danger = true"
        >
          危险操作
        </el-button>
        <el-button @click="dialogState.loading = true">加载状态</el-button>
        <el-button @click="dialogState.customFooter = true">自定义 Footer</el-button>
        <el-button @click="dialogState.noFooter = true">无 Footer</el-button>
      </div>
    </section>

    <!-- ==================== XS 尺寸 - 确认对话框 ==================== -->
    <StandardDialog
      v-model="dialogState.xs"
      size="xs"
      title="确认删除"
      title-icon="warning"
      confirm-type="danger"
      confirm-text="删除"
      @confirm="dialogState.xs = false"
    >
      <p class="text-gray-700">
        确定要删除用户
        <strong>张三</strong>
        吗？
      </p>
      <p class="text-gray-500 text-sm mt-2">此操作不可撤销。</p>
    </StandardDialog>

    <!-- ==================== SM 尺寸 - 简单表单 ==================== -->
    <StandardDialog
      v-model="dialogState.sm"
      size="sm"
      title="修改密码"
    >
      <el-form label-position="top">
        <el-form-item label="当前密码">
          <el-input
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            type="password"
            show-password
          />
        </el-form-item>
        <el-form-item label="确认密码">
          <el-input
            type="password"
            show-password
          />
        </el-form-item>
      </el-form>
    </StandardDialog>

    <!-- ==================== MD 尺寸 - 标准表单 ==================== -->
    <StandardDialog
      v-model="dialogState.md"
      size="md"
      title="创建用户"
      :confirm-loading="submitting"
      @confirm="handleSubmit"
    >
      <el-form
        :model="formData"
        label-width="80px"
      >
        <el-form-item label="用户名">
          <el-input v-model="formData.username" />
        </el-form-item>
        <el-form-item label="邮箱">
          <el-input v-model="formData.email" />
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="formData.phone" />
        </el-form-item>
        <el-form-item label="部门">
          <el-select
            v-model="formData.department"
            placeholder="请选择"
          >
            <el-option
              label="研发部"
              value="dev"
            />
            <el-option
              label="产品部"
              value="product"
            />
          </el-select>
        </el-form-item>
      </el-form>
    </StandardDialog>

    <!-- ==================== LG 尺寸 - 复杂表单 ==================== -->
    <StandardDialog
      v-model="dialogState.lg"
      size="lg"
      title="系统配置"
      :show-footer="false"
      auto-height
    >
      <el-tabs>
        <el-tab-pane label="基础配置">
          <el-form label-width="100px">
            <el-form-item label="系统名称">
              <el-input placeholder="请输入系统名称" />
            </el-form-item>
            <el-form-item label="系统Logo">
              <el-upload
                drag
                action="#"
              >
                <el-icon class="el-icon--upload">
                  <upload-filled />
                </el-icon>
                <div class="el-upload__text">
                  拖拽文件到此处或
                  <em>点击上传</em>
                </div>
              </el-upload>
            </el-form-item>
            <el-form-item label="时区设置">
              <el-select placeholder="请选择时区">
                <el-option
                  label="Asia/Shanghai"
                  value="Asia/Shanghai"
                />
                <el-option
                  label="UTC"
                  value="UTC"
                />
              </el-select>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="高级配置">
          <el-form label-width="120px">
            <el-form-item label="会话超时">
              <el-input-number :min="5" />
              <span class="ml-2 text-gray-500">分钟</span>
            </el-form-item>
            <el-form-item label="登录失败锁定">
              <el-switch />
            </el-form-item>
            <el-form-item label="审计日志保留">
              <el-input-number :min="30" />
              <span class="ml-2 text-gray-500">天</span>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>

      <template #footer>
        <div class="flex justify-between w-full">
          <el-button text>重置为默认</el-button>
          <div>
            <el-button @click="dialogState.lg = false">取消</el-button>
            <el-button
              type="primary"
              @click="dialogState.lg = false"
            >
              保存
            </el-button>
          </div>
        </div>
      </template>
    </StandardDialog>

    <!-- ==================== XL 尺寸 - 高级搜索 ==================== -->
    <StandardDialog
      v-model="dialogState.xl"
      size="xl"
      title="高级搜索"
      :show-footer="false"
    >
      <div class="space-y-4">
        <div
          v-for="(field, index) in searchFields"
          :key="index"
          class="flex items-center gap-3"
        >
          <el-select
            v-model="field.field"
            placeholder="选择字段"
            style="width: 150px"
          >
            <el-option
              label="用户名"
              value="username"
            />
            <el-option
              label="邮箱"
              value="email"
            />
            <el-option
              label="创建时间"
              value="createdAt"
            />
          </el-select>

          <el-select
            v-model="field.operator"
            placeholder="选择操作符"
            style="width: 120px"
          >
            <el-option
              label="包含"
              value="contains"
            />
            <el-option
              label="等于"
              value="eq"
            />
            <el-option
              label="介于"
              value="between"
            />
          </el-select>

          <el-input
            v-model="field.value"
            placeholder="输入值"
            style="width: 200px"
          />

          <el-button
            text
            type="danger"
          >
            删除
          </el-button>
        </div>

        <el-button text>+ 添加条件</el-button>
      </div>

      <template #footer>
        <div class="flex justify-between w-full">
          <el-button text>保存为收藏</el-button>
          <div>
            <el-button @click="dialogState.xl = false">取消</el-button>
            <el-button
              type="primary"
              @click="dialogState.xl = false"
            >
              应用搜索
            </el-button>
          </div>
        </div>
      </template>
    </StandardDialog>

    <!-- ==================== Full 尺寸 - 全屏内容 ==================== -->
    <StandardDialog
      v-model="dialogState.full"
      size="full"
      title="数据预览"
      :show-footer="false"
    >
      <el-table
        :data="[
          { id: 1, name: '张三', email: 'zhang@example.com', department: '研发部' },
          { id: 2, name: '李四', email: 'li@example.com', department: '产品部' },
          { id: 3, name: '王五', email: 'wang@example.com', department: '设计部' },
          { id: 4, name: '赵六', email: 'zhao@example.com', department: '运营部' },
          { id: 5, name: '孙七', email: 'sun@example.com', department: '市场部' }
        ]"
        border
        height="400"
      >
        <el-table-column
          prop="id"
          label="ID"
          width="80"
        />
        <el-table-column
          prop="name"
          label="姓名"
        />
        <el-table-column
          prop="email"
          label="邮箱"
        />
        <el-table-column
          prop="department"
          label="部门"
        />
      </el-table>

      <template #footer>
        <div class="flex justify-end gap-2">
          <el-button @click="dialogState.full = false">导出</el-button>
          <el-button
            type="primary"
            @click="dialogState.full = false"
          >
            关闭
          </el-button>
        </div>
      </template>
    </StandardDialog>

    <!-- ==================== 危险操作 ==================== -->
    <StandardDialog
      v-model="dialogState.danger"
      size="xs"
      title="确认删除"
      title-icon="danger"
      confirm-type="danger"
      confirm-text="删除"
      :confirm-loading="submitting"
      @confirm="handleDelete"
    >
      <p class="text-gray-700">确定要删除此用户吗？</p>
      <p class="text-gray-500 text-sm mt-2">删除后数据将无法恢复，请谨慎操作。</p>
    </StandardDialog>

    <!-- ==================== 加载状态 ==================== -->
    <StandardDialog
      v-model="dialogState.loading"
      size="sm"
      title="提交中"
      confirm-text="提交"
      :confirm-loading="true"
    >
      <p class="text-gray-600">正在处理您的请求，请稍候...</p>
    </StandardDialog>

    <!-- ==================== 自定义 Footer ==================== -->
    <StandardDialog
      v-model="dialogState.customFooter"
      size="md"
      title="自定义 Footer"
    >
      <p class="text-gray-600">这个对话框展示了自定义 Footer 的能力。</p>
      <p class="text-gray-500 text-sm mt-2">左侧可以放置辅助操作，右侧是主操作按钮。</p>

      <template #footer-left>
        <el-button text>查看帮助</el-button>
      </template>

      <template #footer>
        <el-button type="danger">删除</el-button>
        <el-button @click="dialogState.customFooter = false">取消</el-button>
        <el-button
          type="primary"
          @click="dialogState.customFooter = false"
        >
          保存
        </el-button>
      </template>
    </StandardDialog>

    <!-- ==================== 无 Footer ==================== -->
    <StandardDialog
      v-model="dialogState.noFooter"
      size="md"
      title="信息展示"
      :show-footer="false"
    >
      <el-descriptions
        :column="2"
        border
      >
        <el-descriptions-item label="用户名">admin</el-descriptions-item>
        <el-descriptions-item label="邮箱">admin@example.com</el-descriptions-item>
        <el-descriptions-item label="部门">研发部</el-descriptions-item>
        <el-descriptions-item label="角色">系统管理员</el-descriptions-item>
        <el-descriptions-item label="创建时间">2024-01-01 10:00:00</el-descriptions-item>
        <el-descriptions-item label="最后登录">2024-03-15 08:30:00</el-descriptions-item>
      </el-descriptions>
    </StandardDialog>
  </div>
</template>

<style scoped>
.demo-page {
  max-width: 1200px;
  margin: 0 auto;
}
</style>
