<template>
  <v-main class="bg-blue-darken-4 d-flex justify-center align-center flex-column">
    <Alert/>

    <v-form @submit="resetPass" class="form bg-white">
        <h1 class="h1 text-title">Redefinir Senha</h1>

        <v-text-field 
            label="Email" 
            placeholder="Informe sue email"
            variant="solo-filled"
            class="textField"
            v-model="email"
            :error-messages="errors.email"
        ></v-text-field>

        <v-text-field 
          label="Nova senha" 
          placeholder="Informe sua senha"
          variant="solo-filled"
          :type="viewPassword ? 'text' : 'password'"
          :append-inner-icon="viewPassword ? 'mdi-eye' : 'mdi-eye-off'"
          class="textField"
          @click:append-inner="viewPassword = !viewPassword"
          v-model="senha"
          :error-messages="errors.senha"
        ></v-text-field>

        <v-text-field 
          label="Confrima nova senha" 
          placeholder="Confirme sua senha"
          variant="solo-filled"
          :type="confirmViewPassword ? 'text' : 'password'"
          :append-inner-icon="confirmViewPassword ? 'mdi-eye' : 'mdi-eye-off'"
          class="textField"
          @click:append-inner="confirmViewPassword = !confirmViewPassword"
          v-model="confirmaSenha"
          :error-messages="errors.confirmaSenha"
        ></v-text-field>

        <div class="div">
            <v-btn 
                color="blue-darken-4" 
                height="56" 
                width="150"
                type="submit"
                :loading="loading"
            >Salvar</v-btn>

            <v-btn 
                color="blue-darken-4" 
                height="56" 
                width="150"
                variant="tonal"
                to="/login"
            >Cancelar</v-btn>
        </div>
    </v-form>
  </v-main>
</template>
  
<script lang="ts" setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import { useRouter, useRoute } from 'vue-router';
import { useAlertStore } from '@/store/alert';
import Alert from '@/components/Alert.vue';
import { toTypedSchema } from '@vee-validate/zod';
import * as z from 'zod';
import { useField, useForm } from 'vee-validate'

  const authStore = useAuthStore()
  const useAlert = useAlertStore()
  const viewPassword = ref(false)
  const route = useRoute()
  const router = useRouter()
  const confirmViewPassword = ref(false)
  const loading = ref(false) 
  const validationSchema = toTypedSchema(
    z.object({
      email: z
        .string({required_error: 'Informe seu email.', invalid_type_error: 'O email deve ser informado.'})
        .min(1, {message: 'Informe seu email.'})
        .email({message: 'Informe um email válido.'}),
      senha: z
        .string({required_error: 'A senha deve ser informada.',invalid_type_error: 'A senha deve ser informada.'})
        .min(1, {message: 'A senha deve ser informada.'})
        .min(8, {message: 'A senha deve ter no minimo 8 caracteres.'}),
      confirmaSenha: z
        .string({required_error: 'A confirmação da nova senha deve ser informada.', invalid_type_error: 'A confirmação da nova senha deve ser informada.'})
        .min(1, {message: 'A confirmação da nova senha deve ser informada.'})
        .min(8, {message: 'A confirmação da nova senha deve ter no minimo 8 caracteres.'})
        .refine((value) => value === senha.value, {
          message: 'As senhas não são iguais.',
          path: ['confirmaSenha']
        })
    })
  )
  const { handleSubmit, errors } = useForm({
    validationSchema
  })
  const { value: email } = useField('email')
  const { value: senha } = useField('senha')
  const { value: confirmaSenha } = useField('confirmaSenha')
  
  const resetPass = handleSubmit(async (values) => {
    const response = await authStore.resetPass({
      email: values.email,
      senha: values.senha,
      resetPassToken: route.query.resetPassToken
    })
    
    if (response.status == 200) {
      useAlert.createAlert('Senha redefinida com sucesso.', 'success')
      router.push('/login')
    }
  })

</script>

<style>
    @import "@/styles/LoginView.css";
</style>