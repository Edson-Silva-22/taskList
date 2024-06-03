<template>
  <v-app-bar color="blue-darken-4">
    <v-app-bar-title>
      <span class="cursor-pointer" @click="router.push('/')">My Task</span>
    </v-app-bar-title>

    <template v-slot:append>
      <v-btn 
        v-show="auth.userAuth.roles.some((role:string) => role === 'admin')"
        class="btnMenu" 
        to="/users"
      >usuários</v-btn>

      <!-- lista de notificações -->
      <v-menu>
        <template v-slot:activator="{props}">
          <v-btn 
            icon
            v-bind="props"
          >
            <v-badge
              content="3"
              color="red"
            >
              <v-icon icon="mdi-bell"></v-icon>
            </v-badge>
          </v-btn>
        </template>

        <v-list 
          max-width="300px" 
          max-height="350px"
        >
          <v-list-item>
            <v-list-item-title>Notificação 1</v-list-item-title>

            <p class="text-blue-grey-darken-1">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Consequatur dolor labore reiciendis laboriosam temporibus at ratione impedit sed.</p>

            <v-list-item-action>
              <v-btn 
                color="blue-darken-4" 
                variant="tonal"
                class="mt-2"
                height="30px"
                append-icon="mdi-open-in-new"
              >Ir</v-btn>
            </v-list-item-action>

          </v-list-item>

          <v-divider class="my-5"></v-divider>

          <v-list-item>
            <v-list-item-title>Notificação 2</v-list-item-title>

            <p class="text-blue-grey-darken-1">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Consequatur dolor labore reiciendis laboriosam temporibus at ratione impedit sed.</p>

            <v-list-item-action>
              <v-btn 
                color="blue-darken-4" 
                variant="tonal"
                class="mt-2"
                height="30px"
                append-icon="mdi-open-in-new"
              >Ir</v-btn>
            </v-list-item-action>

          </v-list-item>

          <v-divider class="my-5"></v-divider>

          <v-list-item>
            <v-list-item-title>Notificação 3</v-list-item-title>

            <p class="text-blue-grey-darken-1">Lorem ipsum dolor sit, amet consectetur adipisicing elit. Consequatur dolor labore reiciendis laboriosam temporibus at ratione impedit sed.</p>

            <v-list-item-action>
              <v-btn 
                color="blue-darken-4" 
                variant="tonal"
                class="mt-2"
                height="30px"
                append-icon="mdi-open-in-new"
              >Ir</v-btn>
            </v-list-item-action>

          </v-list-item>
        </v-list>

      </v-menu>

      <v-btn 
        @click="toggleTheme = !toggleTheme; $emit('selectTheme', toggleTheme)" :icon="toggleTheme ? 'mdi-white-balance-sunny' : 'mdi-moon-waning-crescent'"
        class="mr-2"
      ></v-btn>

      <!-- Menu do perfil -->
      <v-avatar 
        v-if="auth.userAuth?.photo" 
        @click="isOpenViewModal = !isOpenViewModal"
        class="cursor-pointer"
      >
        <v-img
          :src="auth.userAuth?.photo"
          alt="photo"
          cover
        ></v-img>
      </v-avatar>

      <v-btn 
        v-else
        icon="mdi-account" 
        class="mr-2"
        @click="isOpenViewModal = !isOpenViewModal"
      ></v-btn>

    </template>

  </v-app-bar>

  <!-- Modal de visualizar perfil -->
  <v-dialog v-model="isOpenViewModal" class="containerModal">
    <v-container class="bg-background rounded">
      <v-file-input 
        v-show="false" 
        ref="fileInput"
        v-model="selectedFile"
        @change="profilePicture"
      ></v-file-input>

      <v-img
        v-if="auth.userAuth?.photo"
        :src="auth.userAuth?.photo"
        alt="userPhoto"
        cover
        class="elevation-8 cursor-pointer"
        @click="fileInput?.click()"
      ></v-img>

      <div v-else class="d-flex justify-center">
        <v-btn
          width="300" height="300"
          class="mr-2 rounded-circle"
          @click="fileInput?.click()"
        >
          <v-icon size="150" icon="mdi-account"></v-icon>
        </v-btn>
      </div>

      <p class="text-textP mt-5">Nome</p>
      <v-card class="mb-5 bg-hover">
        <v-card-text class="text-subtitle-1">{{ auth.userAuth.nome }}</v-card-text>
      </v-card>

      <p class="text-textP">Email</p>
      <v-card class="mb-10 bg-hover">
        <v-card-text class="text-subtitle-1">{{ auth.userAuth.email }}</v-card-text>
      </v-card>

      <div class="divBtn">
        <v-btn 
          color="blue-darken-4" 
          variant="outlined" 
          @click="isOpenEditModal = !isOpenEditModal; isOpenViewModal = !isOpenViewModal"
        >Editar Perfil</v-btn>
  
        <v-btn 
           color="blue-darken-4"
          @click="logout"
        >Sair</v-btn>
      </div>
    </v-container>
  </v-dialog>
  
  <!-- Modal de editar perfil -->
  <v-dialog v-model="isOpenEditModal" class="containerModal">
    <v-container class="bg-background rounded">
      <v-form @submit="updateUser">
        <v-text-field 
          variant="solo-filled" 
          label="Nome" 
          clearable
          v-model="nome"
          :error-messages="errors.nome"
        ></v-text-field>

        <v-text-field 
          variant="solo-filled" 
          label="Email" 
          clearable
          v-model="email"
          :error-messages="errors.email"
        ></v-text-field>

        <v-switch 
          color="blue-darken-4" 
          label="Alterar Senha"
          v-model="changePassword"
        ></v-switch>

        <v-text-field 
          v-show="changePassword"
          variant="solo-filled" 
          label="Senha atual" 
          clearable
          :type="viewNewPassword ? 'text' : 'password'"
          :append-inner-icon="viewNewPassword ? 'mdi-eye' : 'mdi-eye-off'"
          v-model="senha"
          :error-messages="errors.senha"
          @click:append-inner="viewNewPassword = !viewNewPassword"
        ></v-text-field>

        <v-text-field 
          v-show="changePassword"
          variant="solo-filled" 
          label="Nova senha" 
          clearable
          :type="viewPassword ? 'text' : 'password'"
          :append-inner-icon="viewPassword ? 'mdi-eye' : 'mdi-eye-off'"
          v-model="senhaNova"
          :error-messages="errors.senhaNova"
          @click:append-inner="viewPassword = !viewPassword"
        ></v-text-field>

        <v-text-field 
          v-show="changePassword"
          variant="solo-filled" 
          label="Cofirma nova senha" 
          clearable
          :type="confirmViewPassword ? 'text' : 'password'"
          :append-inner-icon="confirmViewPassword ? 'mdi-eye' : 'mdi-eye-off'"
          v-model="confirmaSenha"
          :error-messages="errors.confirmaSenha"
          @click:append-inner="confirmViewPassword = !confirmViewPassword"
        ></v-text-field>

        <v-btn 
          color="blue-darken-4 mr-5" 
          variant="outlined" 
          type="submit"
        >Salvar</v-btn>
  
        <v-btn 
          color="red-darken-4" 
          variant="tonal" 
          @click="isOpenEditModal = !isOpenEditModal"
        >Cancelar</v-btn>
      </v-form>

    </v-container>
  </v-dialog>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue';
import router from '@/router';
import { useAuthStore } from '@/store/auth';
import { useUserStore } from '@/store/user';
import { useAlertStore } from '@/store/alert';
import * as z from 'zod';
import { useField, useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod';

  const auth = useAuthStore()
  const userStore = useUserStore()
  const useAlert = useAlertStore()
  const toggleTheme = ref(true)
  const drawer = ref(false)
  const isOpenViewModal = ref(false)
  const isOpenEditModal = ref(false)
  const viewPassword = ref(false)
  const viewNewPassword = ref(false)
  const confirmViewPassword = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)
  const selectedFile = ref()
  const changePassword = ref()
  const validationSchema = toTypedSchema(
    z.object({
      nome: z
        .string({required_error: 'O nome deve ser informado.', invalid_type_error: 'O nome deve ser informado.'})
        .min(1, {message: 'O nome deve ser informado.'}),
      email: z
        .string({required_error: 'Informe seu email.', invalid_type_error: 'O email deve ser informado.'})
        .min(1, {message: 'Informe seu email.'})
        .email({message: 'Informe um email válido.'}),
      senha: z
      .string({invalid_type_error: 'A senha atual deve ser informada.'})
      .min(1, {message: 'A senha atual deve ser informada.'})
      .min(8, {message: 'A senha atual deve ter no minimo 8 caracteres.'})
      .optional(),
      senhaNova: z
        .string({invalid_type_error: 'A nova senha deve ser informada.'})
        .min(1, {message: 'A nova senha deve ser informada.'})
        .min(8, {message: 'A nova senha deve ter no minimo 8 caracteres.'})
        .optional(),
      confirmaSenha: z
        .string({invalid_type_error: 'A confirmação da nova senha deve ser informada.'})
        .min(1, {message: 'A confirmação da nova senha deve ser informada.'})
        .min(8, {message: 'A confirmação da nova senha deve ter no minimo 8 caracteres.'})
        .refine((value) => value === senhaNova.value, {
          message: 'As senhas não são iguais.',
          path: ['confirmaSenha']
        })
        .optional(),
    })
    .superRefine((values, ctx) => {
      //Os campos de senha somente serão requeridos quando o usuário marca a opção de alterar senha
      if (changePassword.value) {
        if (!values.senha) { 
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'A senha atual deve ser informada.',
            path: ['senha']
          })
        }

        if (!values.senhaNova) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'A nova senha deve ser informada.',
            path: ['senhaNova']
          })
        }

        if (!values.confirmaSenha) { 
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'A confirmação da nova senha deve ser informada.',
            path: ['confirmaSenha']
          })
        }
      }
    })
  )

  const { handleSubmit, errors } = useForm({
    validationSchema
  })

  const { value: nome } = useField('nome')
  const { value: email } = useField('email')
  const { value: senha } = useField('senha')
  const { value: senhaNova } = useField('senhaNova')
  const { value: confirmaSenha } = useField('confirmaSenha')


  defineEmits(['selectTheme'])

  async function logout() {
    await auth.logout()
    router.replace({path: '/login'})
  }

  async function profilePicture() {
    const formData = new FormData()
    formData.append('profilePicture', selectedFile.value[0])
    selectedFile.value = []
    const response = await userStore.profilePicture(auth.userAuth.id, formData)

    if (response.status == 201) {
      useAlert.createAlert('Foto salva com sucesso.', 'success')
      window.location.reload()
    }
  }

  const updateUser = handleSubmit(async (values) => {
    let dados = {}
    if (values.senha && values.senhaNova && values.confirmaSenha) {
      dados = {
        nome: values.nome,
        email: values.email,
        senha: values.senha,
        senhaNova: values.senhaNova,
      }
    }

    else{
      dados = {
        nome: values.nome,
        email: values.email
      }
    }

    const response = await userStore.update(auth.userAuth.id, dados)

    if (response.status == 200) {
      useAlert.createAlert('Alterações salvas com sucesso.', 'success')
      window.location.reload()
    }
  })

  onMounted(() => {
    nome.value = auth.userAuth.nome
    email.value = auth.userAuth.email
  })

</script>

<style scoped>
  @import "@/styles/AppBar.css";
</style>
