<template>
  <v-main>
    <v-container class="flex-colum">

      <v-responsive class="mx-auto d-flex justify-center align-center" max-width="400" height="200">

        <v-btn 
          color="blue-darken-4" 
          variant="tonal" 
          width="100%" 
          height="50px" 
          class="mb-5 border"
          prepend-icon="mdi-plus" 
          @click="openAddTaskModal = true"
        >Criar Tarefa</v-btn>

        <!-- modal de criar tasks -->
        <v-dialog v-model="openAddTaskModal" class="containerModal">
          <v-container class="bg-background rounded">
            <v-form @submit="createTask">
              <v-text-field 
                variant="solo" 
                label="Título" 
                v-model="title" 
                :error-messages="errors.title"
              ></v-text-field>

              <v-textarea 
                variant="solo" 
                label="Descrição" 
                v-model="description"
                :error-messages="errors.description"
              ></v-textarea>

              <v-row>
                <v-col cols="12" sm="6">

                  <p class="text-textP">Data de Vencimanto</p>
                  <v-text-field 
                    variant="solo" 
                    type="date" 
                    id="inputDate" 
                    v-model="expirationDate"
                    :error-messages="errors.expirationDate"
                  ></v-text-field>

                </v-col>

                <v-col cols="12" sm="6">

                  <p class="text-textP">Prioridade</p>
                  <v-select 
                    :items="priorities" 
                    :item-props="(item: any) => {
                      return { title: item.text, prependIcon: item.icon, value: item.value }
                    }" 
                    variant="solo" 
                    placeholder="Nenhuma opção selecionada" 
                    v-model="priority"
                    :error-messages="errors.priority"></v-select>
                </v-col>
              </v-row>

              <v-btn 
                color="blue-darken-4" 
                variant="tonal" 
                type="submit"
                :loading="createLoading"
              >Criar</v-btn>

              <v-btn 
                variant="tonal" 
                color="red-darken-4" 
                class="ml-5"
                @click="openAddTaskModal = !openAddTaskModal"
              >Cancelar</v-btn>

            </v-form>
          </v-container>
        </v-dialog>

        <v-text-field 
          hide-details="auto" 
          label="" 
          variant="solo-filled" 
          append-inner-icon="mdi-magnify" 
          flat
          placeholder="Buscar" 
          clearable 
          v-model="titleFilter" 
          @keydown.enter="findAll(selectedBtn)"
          @click:append-inner="findAll(selectedBtn)"
        ></v-text-field>

      </v-responsive>

      <div class="menuFilter">
        <v-btn
          prepend-icon="mdi-calendar-check"
          class="itemFilter"
          :class="{'custom-btn': selectedBtn === 'allTasks'}"
          variant="text"
          @click="selectedBtn = 'allTasks'; findAll()"
        >Minhas Tarefas</v-btn>

        <v-btn
          prepend-icon="mdi-check-all"
          class="itemFilter"
          :class="{'custom-btn': selectedBtn === 'completedFilter'}"
          variant="text"
          @click="selectedBtn = 'completedFilter'; findAll(selectedBtn)"
        >Tarefas Concluidas</v-btn>

        <v-btn
          prepend-icon="mdi-calendar-today"
          class="itemFilter"
          :class="{'custom-btn': selectedBtn === 'expirationTodayFilter'}"
          variant="text"
          @click="selectedBtn = 'expirationTodayFilter'; findAll(selectedBtn)"
        >  
          Hoje
          <div class="v-badge" v-show="expirationTodayTaksCount">
            <span>{{ expirationTodayTaksCount > 9 ? '9+' : expirationTodayTaksCount }}</span>
          </div>
        </v-btn>

        <v-btn
          prepend-icon="mdi-alert-circle-outline"
          class="itemFilter"
          :class="{'custom-btn': selectedBtn === 'expirationFilter'}"
          variant="text"
          @click="selectedBtn = 'expirationFilter'; findAll(selectedBtn)"
        >
          Tarefas Pendentes
          <div class="v-badge" v-show="expirationTaksCount">
            <span>{{ expirationTaksCount > 9 ? '9+' : expirationTaksCount }}</span>
          </div>
        </v-btn>
      </div>

      <v-container class="containerTask">

        <!-- componente de momento do carregamento das tarefas -->
        <div v-if="loading">
          <v-skeleton-loader
            v-for="(item, index) in [0,1,2]"
            type="card"
            :key="index"
          ></v-skeleton-loader>
        </div>

        <div>
          <!-- caso nenhuma tarefa for encontrada -->
          <div class="divTaskEmpy" v-if="taskList?.length == 0 && loading == false">
            <p class="text-textP">Nenhuma tarefa encontrada</p>
          </div>

          <v-data-iterator 
            :items="taskList" 
            :page="pageCorrent" 
            :items-per-page="4"
            v-if="taskList && taskList.length > 0 && loading == false"
          >
            <template #default="{ items }">
              <div 
                v-for="(item, index) in items" 
                :key="index" 
                class="divTask"
              >
                <v-row>
                  <v-col cols="12" sm="6" class="d-flex align-center">
                    <h2 class="text-title">{{ item.raw.title }}</h2>
                  </v-col>
  
                  <v-col 
                    cols="12" 
                    sm="6" 
                    class="d-flex justify-sm-end"
                  >
                    <v-btn 
                      color="blue-darken-4" 
                      class="taskCompletBtn" 
                      @click="completeTask(item.raw.id, index)"
                      :loading="item.raw.loading"
                    >
                      {{ item.raw.completed ? 'Restaurar Tarefa' : 'Concluir Tarefa' }}
                    </v-btn>
                  </v-col>
                </v-row>
  
                <p class="text-textP pTask mt-5">{{ item.raw.description }}</p>
  
                <div class="mt-7">
                  <v-btn 
                    color="blue-darken-4" 
                    variant="text" 
                    class="mr-5 mb-5 border"
                    @click="isOpenModal = true; findOne(item.raw.id)"
                  >Detalhes</v-btn>
  
                  <v-btn 
                    color="blue-darken-4" 
                    variant="tonal" 
                    class="mr-5 mb-5"
                    @click="openEditTaskModal = true; findOne(item.raw.id)"
                  >Editar</v-btn>
  
                  <v-btn 
                    color="red-darken-4" 
                    variant="tonal" 
                    class="mr-5 mb-5" 
                    @click="remove(item.raw.id)"
                  >Excluir</v-btn>
                </div> 
              </div>
            </template>
  
            <template v-slot:footer="{pageCount}">
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

      <!-- modal de exibir detalhes -->
      <v-dialog v-model="isOpenModal" class="containerModal">
        <v-container class="bg-background rounded">
          <v-row>
            <v-col cols="12" sm="6">
              <h2 class="text-title">{{ taskView?.title }}</h2>
            </v-col>

            <v-col cols="12" sm="6" class="d-flex justify-sm-end">
              <v-btn 
                color="blue-darken-4" 
                class="taskCompletBtn"
                @click="completeTask(taskView.id)"
                :loading="completedLoading"
              >
                {{ taskView?.completed ? 'Restaurar Tarefa' : 'Concluir Tarefa' }}
              </v-btn>
            </v-col>
          </v-row>

          <p class="text-textP mt-5">Descrição</p>
          <v-card class="mb-5 bg-hover">
            <v-card-text class="text-subtitle-1 cardText">{{ taskView?.description }}</v-card-text>
          </v-card>

          <v-row>
            <v-col cols="12" sm="6">

              <p class="text-textP">Data de Vencimanto</p>
              <v-card class="bg-hover">
                <v-card-text class="text-subtitle-1">{{ taskView?.expirationDate }}</v-card-text>
              </v-card>

            </v-col>

            <v-col cols="12" sm="6">

              <p class="text-textP">Prioridade</p>
              <v-card class="bg-hover">
                <v-card-text class="text-subtitle-1">Prioridade {{ taskView?.priority }}</v-card-text>
              </v-card>
            </v-col>
          </v-row>

          <div class="mt-7 divBtn">
            <v-btn 
              color="blue-darken-4" 
              variant="tonal" 
              class="mr-5"
              @click="isOpenModal = false; openEditTaskModal = true; findOne(taskView.id)"
            >Editar</v-btn>

            <v-btn 
              color="red-darken-4" 
              variant="tonal" 
              @click="remove(taskView.id)"
            >Excluir</v-btn>
          </div>
        </v-container>
      </v-dialog>

      <!-- modal de editar task -->
      <v-dialog v-model="openEditTaskModal" class="containerModal">
        <v-container class="bg-background rounded">
          <v-form @submit="update">
            <v-text-field 
              variant="solo-filled" 
              label="Título" 
              clearable 
              v-model="titleUpdate"
              :error-messages="errorsUpdates.titleUpdate"
            ></v-text-field>

            <v-textarea 
              variant="solo-filled" 
              label="Descrição" 
              clearable v-model="descriptionUpdate"
              :error-messages="errorsUpdates.descriptionUpdate"
            ></v-textarea>

            <v-row>
              <v-col cols="12" sm="6">

                <p class="text-textP">Data de Vencimanto</p>
                <v-text-field 
                  variant="solo-filled" 
                  type="date" 
                  id="inputDate" 
                  v-model="expirationDateUpdate"
                  :error-messages="errorsUpdates.expirationDateUpdate"
                ></v-text-field>

              </v-col>

              <v-col cols="12" sm="6">

                <p class="text-textP">Prioridade</p>
                <v-select 
                  :items="priorities" 
                  :item-props="(item: any) => {
                    return { title: item.text, prependIcon: item.icon, value: item.value }
                  }" 
                  variant="solo-filled" 
                  placeholder="Nenhuma opção selecionada" 
                  v-model="priorityUpdate"
                  :error-messages="errorsUpdates.priorityUpdate"
                ></v-select>
              </v-col>
            </v-row>

            <v-btn 
              color="blue-darken-4" 
              variant="tonal" 
              type="submit"
              :loading="updateLoading"
            >Salvar</v-btn>

            <v-btn 
              variant="tonal" 
              color="red-darken-4" 
              class="ml-5"
              @click="openEditTaskModal = !openEditTaskModal"
            >Cancelar</v-btn>
          </v-form>
        </v-container>
      </v-dialog>

    </v-container>
  </v-main>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useTaskStore } from '@/store/task';
import { useRouter } from 'vue-router';
import * as z from 'zod';
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod';
import { useAlertStore } from '@/store/alert';

const useAlert = useAlertStore()

//schema que valida o formulário de creação de tarefas
const validationSchema = toTypedSchema(
  z.object({
    title: z
      .string({
        required_error: 'Um título deve ser informado.',
        invalid_type_error: 'O título deve ser uma string'
      })
      .min(1, { message: 'Um título deve ser informado.' }),
    description: z
      .string({ required_error: 'Informe uma descrição.' })
      .min(1, { message: 'Informe uma descrição.' }),
    expirationDate: z
      .string({ required_error: 'A data de expiração da tarefa deve ser informada.' })
      .min(1, { message: 'A data de expiração da tarefa deve ser informada.' }),
    priority: z
      .number({ required_error: 'Uma prioridade deve selecionada.' })
      .min(1, { message: 'Uma prioridade deve selecionada.' })
  })
)

//schema que valida o formulário de atualização de tarefas
const validationUpdadteSchema = toTypedSchema(
  z.object({
    titleUpdate: z
      .string({
        required_error: 'Um título deve ser informado.',
        invalid_type_error: 'O título deve ser uma string'
      })
      .min(1, { message: 'Um título deve ser informado.' }),
    descriptionUpdate: z
      .string({ required_error: 'Informe uma descrição.' })
      .min(1, { message: 'Informe uma descrição.' }),
    expirationDateUpdate: z
      .string({ required_error: 'A data de expiração da tarefa deve ser informada.' })
      .min(1, { message: 'A data de expiração da tarefa deve ser informada.' }),
    priorityUpdate: z
      .number({ required_error: 'Uma prioridade deve selecionada.' })
      .min(1, { message: 'Uma prioridade deve selecionada.' })
  })
)

const { handleSubmit, errors } = useForm({
  validationSchema
})

const { value: title } = useField('title')
const { value: description } = useField('description')
const { value: priority } = useField('priority')
const { value: expirationDate } = useField('expirationDate')

const { handleSubmit: handleSubmitUpdate, errors: errorsUpdates } = useForm({
  validationSchema: validationUpdadteSchema
})

const { value: titleUpdate } = useField('titleUpdate')
const { value: descriptionUpdate } = useField('descriptionUpdate')
const { value: priorityUpdate } = useField('priorityUpdate')
const { value: expirationDateUpdate } = useField('expirationDateUpdate')

const authStore = useAuthStore()
const taskStore = useTaskStore()
const isOpenModal = ref(false)
const openAddTaskModal = ref(false)
const openEditTaskModal = ref(false)
const priorities = ref([
  {
    text: 'Prioridade 1',
    icon: 'mdi-flag',
    value: 1
  },
  {
    text: 'Prioridade 2',
    icon: 'mdi-flag',
    value: 2
  },
  {
    text: 'Prioridade 3',
    icon: 'mdi-flag',
    value: 3
  }
])
const taskList = ref<{
  id: number,
  title: string,
  description: string,
  priority: string,
  expirationDate: string,
  completed: boolean,
  loading: boolean
}[]>()
const selectedBtn = ref<'completedFilter' | 'expirationFilter' | 'expirationTodayFilter' | 'allTasks'>('allTasks')
const pageCorrent = ref(1)
const titleFilter = ref('')
const taskView = ref<any>()
const loading = ref(false)
const updateLoading = ref(false)
const createLoading = ref(false)
const completedLoading = ref(false)
const expirationTaksCount = ref()
const expirationTodayTaksCount = ref()

const sleep = (time:number) => new Promise((resolve) => {
  setTimeout(resolve, time)
})

const createTask = handleSubmit(async (values) => {
  createLoading.value = true
  const response = await taskStore.create(
    {
      title: values.title,
      description: values.description,
      priority: values.priority,
      expirationDate: values.expirationDate,
      completed: false,
      userId: authStore.userAuth!.id
    }
  )

  if (response.status == 201) {
    useAlert.createAlert('Tarefa cadastrada com sucesso.', 'success')
    createLoading.value = false
    openAddTaskModal.value = !openAddTaskModal
    selectedBtn.value = 'allTasks'
    await findAll()
  }
  createLoading.value = false
})

async function findAll(queryFilter?: 'completedFilter' | 'expirationFilter' | 'expirationTodayFilter' | 'allTasks') {
  //Campos que poderão ser usados na queryString
  const queryString = {
    userId: authStore.userAuth!.id,
    titleFilter: titleFilter.value ? `&&titleFilter=${titleFilter.value}` : '',
    queryStringFilter: queryFilter && queryFilter != 'allTasks' ? `&&queryFilter=${queryFilter}` : ''
  }
  loading.value = true

  const response = await taskStore.findAll(queryString)
  await sleep(2000)

  if (response.status == 200) {
    loading.value = false
    taskList.value = response.result 
    await tasksCount()
  }
  loading.value = false
}

async function tasksCount() {
  const response = await taskStore.tasksCount(authStore.userAuth.id)

  if (response.status == 200) {
    expirationTaksCount.value = response.result.expirationTasksCount
    expirationTodayTaksCount.value = response.result.expirationTodayTasksCount 
  }
}

async function findOne(taskId: number) {
  const response = await taskStore.findOne(taskId, authStore.userAuth!.id)

  if (response.status == 200) {
    taskView.value = response.result
    const dataFormat = taskView.value.expirationDate.split('/')

    titleUpdate.value = taskView.value.title
    descriptionUpdate.value = taskView.value.description
    priorityUpdate.value = taskView.value.priority
    //formatando data para ser recolhecida pelo textField do tipo date
    expirationDateUpdate.value = `${(dataFormat[2])}-${dataFormat[1] < 10 ? '0' + dataFormat[1] : dataFormat[1]}-${dataFormat[0]}`
  }
}

const update = handleSubmitUpdate(async (values) => {
  updateLoading.value = true
  const response = await taskStore.update(taskView.value.id, {
    title: values.titleUpdate,
    description: values.descriptionUpdate,
    priority: values.priorityUpdate,
    expirationDate: values.expirationDateUpdate,
    userId: authStore.userAuth!.id
  })

  if (response.status == 200) {
    useAlert.createAlert('Tarefa atualizada com sucesso.', 'success')
    updateLoading.value = false
    openEditTaskModal.value = !openEditTaskModal
    await findAll(selectedBtn.value)
  }

  updateLoading.value = false
})

async function remove(taskId: number) {
  if (confirm('Deseja realmente excluir essa tarefa?')) {

    const response = await taskStore.remove(taskId, authStore.userAuth!.id)

    if (response.status == 200) {
      useAlert.createAlert('Tarefa removida com sucesso.', 'success')
      await findAll(selectedBtn.value)
    }
  }
}

async function completeTask(taskId: number, index?: number) {
  const findTaskSelected = taskList.value?.find((t) => t.id == taskId)
  if (confirm(`Deseja realmente ${findTaskSelected!.completed ? 'restaurar' : 'concluir'} essa tarefa?`)) {
    Number.isInteger(index) ? taskList.value![index!].loading = true : completedLoading.value = true
    
    const response = await taskStore.update(taskId, {
      completed: !findTaskSelected!.completed,
      userId: authStore.userAuth!.id
    })
    await sleep(2000)

    if (response.status == 200) {
      useAlert.createAlert('Tarefa concluída com sucesso.', 'success')

      //Quando a função de concluir tarefa for feita pela lista de tarefa ou pelo modal de detalhes de uma tarefa
      Number.isInteger(index) ? taskList.value![index!].loading = false : completedLoading.value = false; isOpenModal.value = !isOpenModal

      await findAll(selectedBtn.value)
    }

    Number.isInteger(index) ? taskList.value![index!].loading = false : completedLoading.value = false; isOpenModal.value = !isOpenModal
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