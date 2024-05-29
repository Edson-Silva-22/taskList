<template>
  <v-app 
    :theme="toggleTheme ? 'light' : 'dark'"
  >
    <default-bar @select-theme="toggleTheme = !toggleTheme"/>

    <alert class="divAlert"/>
    <router-view />
  </v-app>
</template>

<script lang="ts" setup>
  import { ref } from 'vue';
  import DefaultBar from './AppBar.vue'
  import DefaultView from './View.vue'
  import Alert from '@/components/Alert.vue';

  const toggleTheme = ref(true)
 
</script>

<style scoped>
  .divAlert{
    top: 5rem;
    z-index: 3000;
  }
</style>
