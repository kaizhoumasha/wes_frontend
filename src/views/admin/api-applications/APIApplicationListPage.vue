<template>
  <CrudPageContainer :config="config" />
</template>

<script setup lang="ts">
import CrudPageContainer from '@/components/common/CrudPageContainer.vue'
import { createAPIApplicationPageConfig } from './config/pageConfig'

const config = createAPIApplicationPageConfig()
</script>
