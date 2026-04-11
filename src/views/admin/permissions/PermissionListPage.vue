<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createPermissionPageConfig } from './config/pageConfig'

const config = createPermissionPageConfig()
</script>
