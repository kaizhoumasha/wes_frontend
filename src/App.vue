<template>
  <router-view />
</template>

<script setup lang="ts">
// 根组件
</script>

<style>
/* ==================== 全局基础样式 ==================== */

/*
  注意：Element Plus 组件样式已统一到 src/assets/styles/globals.css
  此文件仅保留最基础的全局样式，避免重复维护导致不一致

  维护原则：
  - App.vue: 仅保留基础 HTML 元素样式
  - globals.css: 所有 Element Plus 组件样式和主题覆盖
*/

* {
  box-sizing: border-box;
}

html,
body,
#app {
  width: 100%;
  height: 100%;
  margin: 0;
  padding: 0;
}

body {
  font-family:
    'SF Pro Display',
    -apple-system,
    BlinkMacSystemFont,
    'Segoe UI',
    Roboto,
    Oxygen,
    Ubuntu,
    Cantarell,
    'Fira Sans',
    'Droid Sans',
    'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ==================== 全局滚动条样式 ==================== */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

/* 注意：滚动条的明暗模式样式已移至 globals.css，避免重复定义 */
</style>
