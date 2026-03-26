<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createRolePageConfig } from './config/pageConfig'

const config = createRolePageConfig()
</script>
