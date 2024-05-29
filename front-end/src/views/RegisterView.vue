<template>
    <v-main class="bg-blue-darken-4 d-flex justify-center align-center">
        <Alert/>

        <v-form class="form bg-white" @submit="createUser">
            <h1 class="h1 text-title">Cadastro</h1>

            <v-text-field 
                label="Nome" 
                placeholder="Informe sue nome"
                variant="solo-filled"
                class="textField"
                v-model="nome"
                :error-messages="errors.nome"
            ></v-text-field>

            <v-text-field 
                label="Email" 
                placeholder="Informe sue email"
                variant="solo-filled"
                class="textField"
                v-model="email"
                :error-messages="errors.email"
            ></v-text-field>

            <v-text-field 
                label="Senha" 
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
                label="Confrima Senha" 
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
                    @click="createUser"
                    type="submit"
                >Cadastrar</v-btn>

                <v-btn 
                    color="blue-darken-4" 
                    height="56" 
                    width="150"
                    variant="tonal"
                    to="/login"
                >Voltar</v-btn>
            </div>

        </v-form>
    </v-main>
</template>

<script lang="ts" setup>
    import { reactive, ref } from 'vue';
    import { useUserStore } from '@/store/user';
    import * as z from 'zod';
    import { useField, useForm } from 'vee-validate'
    import router from '@/router';
    import Alert from '@/components/Alert.vue';
    import { useAlertStore } from '@/store/alert';
    import { toTypedSchema } from '@vee-validate/zod';

    const useAlert = useAlertStore()
    const viewPassword = ref(false)
    const confirmViewPassword = ref(false)
    const userStore = useUserStore()
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
    const { value: nome } = useField('nome')
    const { value: email } = useField('email')
    const { value: senha } = useField('senha')
    const { value: confirmaSenha } = useField('confirmaSenha')

    const createUser = handleSubmit(async (values) => {
        const response = await userStore.create({
            nome: values.nome,
            email: values.email,
            senha: values.senha
        })
        
        if (response.status == 201) {
            useAlert.createAlert('Cadastro realizado com sucesso.', 'success')
            router.push('/login')
        }
    })

</script>

<style>
    @import "@/styles/LoginView.css";
</style>