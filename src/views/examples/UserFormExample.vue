<!--
  用户创建表单示例

  展示如何使用从后端 OpenAPI 自动生成的 Zod schemas 进行表单验证
-->
<script setup lang="ts">
import { useForm } from 'vee-validate'
import { UserCreateSchema } from '@/types/zod-extensions'
import { userApi, type CreateUserInput } from '@/api/modules/user'
import { ElMessage } from 'element-plus'

// 使用泛型类型，让 vee-validate 自动推断类型
const { handleSubmit, errors, defineField } = useForm<CreateUserInput>({
  validationSchema: UserCreateSchema
})

// 定义表单字段
const [username, usernameAttrs] = defineField('username')
const [email, emailAttrs] = defineField('email')
const [full_name, full_nameAttrs] = defineField('full_name')
const [password, passwordAttrs] = defineField('password')

// 提交处理
// values 类型自动推断为 CreateUserInput
const onSubmit = handleSubmit(async values => {
  try {
    await userApi.create(values)
    ElMessage.success('用户创建成功')
  } catch {
    ElMessage.error('用户创建失败')
  }
})
</script>

<template>
  <div class="user-form-container">
    <h2>创建用户</h2>

    <el-form
      label-width="100px"
      @submit.prevent="onSubmit"
    >
      <!-- 用户名 -->
      <el-form-item
        label="用户名"
        required
        :error="errors.username"
      >
        <el-input
          v-model="username"
          v-bind="usernameAttrs"
          placeholder="请输入用户名（3-50个字符）"
          autocomplete="username"
          autofocus
        />
      </el-form-item>

      <!-- 邮箱 -->
      <el-form-item
        label="邮箱"
        required
        :error="errors.email"
      >
        <el-input
          v-model="email"
          v-bind="emailAttrs"
          type="email"
          placeholder="请输入邮箱地址"
          autocomplete="email"
        />
      </el-form-item>

      <!-- 姓名（可选） -->
      <el-form-item
        label="姓名"
        :error="errors.full_name"
      >
        <el-input
          v-model="full_name"
          v-bind="full_nameAttrs"
          placeholder="请输入真实姓名（可选）"
        />
      </el-form-item>

      <!-- 密码 -->
      <el-form-item
        label="密码"
        required
        :error="errors.password"
      >
        <el-input
          v-model="password"
          v-bind="passwordAttrs"
          type="password"
          placeholder="请输入密码（6-100个字符）"
          show-password
          autocomplete="new-password"
        />
      </el-form-item>

      <!-- 提交按钮 -->
      <el-form-item>
        <el-button
          type="primary"
          native-type="submit"
        >
          创建用户
        </el-button>
        <el-button @click="$router.back()">取消</el-button>
      </el-form-item>
    </el-form>

    <!-- 验证规则说明 -->
    <el-divider />
    <div class="validation-info">
      <h3>验证规则（从后端自动获取）</h3>
      <ul>
        <li>用户名：3-50 个字符</li>
        <li>邮箱：最多 100 个字符</li>
        <li>密码：6-100 个字符</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.user-form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.validation-info {
  padding: 16px;
  background-color: var(--el-bg-color-page);
  border-radius: 4px;
}

.validation-info h3 {
  margin: 0 0 12px;
  font-size: 14px;
  font-weight: 600;
}

.validation-info ul {
  margin: 0;
  padding-left: 20px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.validation-info li {
  margin-bottom: 4px;
}
</style>
