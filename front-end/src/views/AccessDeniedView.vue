<template>
  <v-main>
    <v-container class="container">
      <h1 class="text-title">Acesso Negado</h1>
      <p class="text-textP">Voçê não tem permissão para acessar essa página.</p>

      <div class="divBtn">
        <v-btn 
          class="btn" 
          color="blue-darken-4"
          prepend-icon="mdi-arrow-left"
          @click="router.back()"
        >voltar</v-btn>
      </div>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';

  const router = useRouter()
</script>

<style scoped>
  h1{
    margin: 1rem 0;
  }

  p{
    margin-bottom: 1rem;
  }

  .divBtn{
    display: flex;
    justify-content: center;
    align-items: center;
  }
</style>