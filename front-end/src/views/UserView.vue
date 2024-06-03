<template>
  <v-main>
    <v-container class="flex-colum">

      <v-container class="containerTask">

        <!-- componente de momento do carregamento dos users -->
        <div v-if="loading">
          <v-skeleton-loader 
            v-for="(item, index) in [0, 1, 2]" 
            type="card" 
            :key="index"
          ></v-skeleton-loader>
        </div>

        <div>
          <!-- caso nenhum user for encontrado -->
          <div class="divTaskEmpy" v-if="usersList?.length == 0 && loading == false">
            <p class="text-textP">Nenhuma usuário encontrado.</p>
          </div>

          <v-data-iterator 
            :items="usersList" 
            :page="pageCorrent" 
            :items-per-page="4"
            v-if="usersList && usersList.length > 0 && loading == false"
          >
            <template #default="{ items }">
              <div 
                v-for="(item, index) in items" 
                :key="index" 
                class="divTask"
              >
                <v-row>
                  <v-col cols="12" sm="6">
                    <h2 class="text-title">{{ item.raw.nome }}</h2>
                  </v-col>
                </v-row>

                <p class="text-textP mt-5">Email</p>
                <v-card class="mb-5 bg-hover">
                  <v-card-text class="text-subtitle-1">{{ item.raw.email }}</v-card-text>
                </v-card>

                <p class="text-textP mt-5">Permissões</p>
                <v-card class="mb-5 bg-hover">
                  <v-card-text class="text-subtitle-1">{{ item.raw.roles }}</v-card-text>
                </v-card>

                <div class="mt-7">
                  <v-btn 
                    color="red-darken-4" 
                    variant="tonal" 
                    class="mr-5 mb-5"
                    @click="remove(item.raw.id)"
                  >Excluir</v-btn>
                </div>
              </div>
            </template>

            <template v-slot:footer="{ pageCount }">
              <div class="text-center">
                <v-pagination 
                  v-model="pageCorrent" 
                  :length="pageCount" 
                  :total-visible="7" 
                  rounded="circle"
                  active-color="blue-darken-4"
                ></v-pagination>
              </div>
            </template>
          </v-data-iterator>
        </div>
      </v-container>
    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';
import { useAlertStore } from '@/store/alert';
import { useUserStore } from '@/store/user';

const useAlert = useAlertStore()
const authStore = useAuthStore()
const userStore = useUserStore()
const isOpenModal = ref(false)
const usersList = ref<{
  id:number,
  nome:string,
  email:string,
  roles: object[]
}[]>()
const pageCorrent = ref(1)
const nameFilter = ref('')
const taskView = ref<any>()
const loading = ref(false)
const sleep = (time:number) => new Promise((resolve) => {
  setTimeout(resolve, time)
})

async function findAll() {
  //Campos que poderão ser usados na queryString
  const queryString = {
    userId: authStore.userAuth!.id,
    nameFilter: nameFilter.value ? `&&nameFilter=${nameFilter.value}` : ''
  }
  loading.value = true

  const response = await userStore.findAll(queryString)
  await sleep(2000)

  if (response.status == 200) {
    loading.value = false
    usersList.value = response.result 
  }
  loading.value = false
}

async function findOne(taskId: number) {
  const response = await userStore.findOne(authStore.userAuth!.id)

  if (response.status == 200) {
    taskView.value = response.result
  }
}

async function remove(taskId: number) {
  if (confirm('Deseja realmente excluir esse usuário?')) {

    const response = await userStore.remove(authStore.userAuth!.id)

    if (response.status == 200) {
      useAlert.createAlert('Usuário removido com sucesso.', 'success')
    }
  }
}

onMounted(findAll)

</script>

<style scoped>
@import "@/styles/TaskList.css";

.divAlert {
  top: 5rem;
  z-index: 3000;
}
</style>