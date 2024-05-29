<template>
    <v-main class="bg-blue-darken-4 d-flex justify-center align-center flex-column">
        <Alert/>

        <v-form @submit="login" class="form bg-white">
            <div class="logo">
                <v-icon class="icon " icon="mdi-format-list-checks"></v-icon>
                <h1>My Task</h1>
            </div>
            <h2 class="h2 text-title">Login</h2>

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

            <div class="div">
                <v-btn 
                    color="blue-darken-4" 
                    height="56" 
                    width="150"
                    type="submit"
                    :loading="loading"
                >Login</v-btn>

                <v-btn 
                    color="blue-darken-4" 
                    height="56" 
                    width="150"
                    variant="tonal"
                    to="/register"
                >Cadastro</v-btn>
            </div>

            <p 
                class="resetPass" 
                @click="openModal = !openModal"
            >Esqueceu sua senha?</p>

        </v-form>

        <v-dialog v-model="openModal" class="containerModal">
            <v-container class="bg-background rounded">
                <h1 class="text-title">Recuperação de Senha</h1>
                <p class="text-textP my-5">Enviaremos um link de recuperação de senha para o email informado abaixo. Apos clicar em enviar verefique sua caixa de email.</p>
                <v-form @submit="forgotPassword">
                    <v-text-field 
                        variant="solo" 
                        label="Email" 
                        v-model="emailResetPass"
                        :error-messages="errorsResetPass.emailResetPass"
                    ></v-text-field>

                    <v-btn 
                        color="blue-darken-4" 
                        variant="tonal" 
                        type="submit"
                        :loading="btnModalLoading"
                    >Enviar</v-btn>

                    <v-btn 
                        variant="tonal" 
                        color="red-darken-4" 
                        class="ml-5"
                        @click="openModal = !openModal"
                    >Cancelar</v-btn>
                </v-form>
            </v-container>
        </v-dialog>
    </v-main>
</template>

<script lang="ts" setup>
    import { ref } from 'vue';
    import { useAuthStore } from '@/store/auth';
    import { useRouter } from 'vue-router';
    import { useAlertStore } from '@/store/alert';
    import * as z from 'zod';
    import { useField, useForm } from 'vee-validate'
    import { toTypedSchema } from '@vee-validate/zod';
    import Alert from '@/components/Alert.vue';

    const authStore = useAuthStore()
    const router = useRouter()
    const useAlert = useAlertStore()
    const viewPassword = ref(false)
    const loading = ref(false) 
    const openModal = ref(false)
    const btnModalLoading = ref(false)

    //Criando schema de validação dos campos do formulário com o zod validation
    const validationSchema = toTypedSchema(
        z.object({
            email: z
                .string({required_error: 'Informe seu email.'})
                .min(1, {message: 'Informe seu email.'})
                .email({message: 'Informe um email válido.'}),
            senha: z
                .string({required_error: 'Informe sua senha.'})
                .min(1, {message: 'Informe sua senha.'})
                .min(8, {message: 'A senha deve ter no minimo 8 caracteres.'})
        })
    )

    //Pegando a função handleSubmit e os erros dos campos que não passaram na validação
    const { handleSubmit, errors } = useForm({
        validationSchema,
    })

    //O useField do vee-validate atua como o ref do vue js nesse cenário
    const { value: email } = useField('email')
    const { value: senha } = useField('senha')

    const validationResetPassSchema = toTypedSchema(
        z.object({
            emailResetPass: z
                .string({required_error: 'Informe seu email.'})
                .min(1, {message: 'Informe seu email.'})
                .email({message: 'Informe um email válido.'}),
        })
    )
    const { handleSubmit: handleSubmitResetPass, errors: errorsResetPass } = useForm({
        validationSchema: validationResetPassSchema
    })
    const { value: emailResetPass } = useField('emailResetPass')

    const login = handleSubmit(async (values) => {
        loading.value = true
        const response = await authStore.login(values)

        if (response && response.status == 200) {
            loading.value = false
            router.push({path: '/'})
        }
        
        loading.value = false
    })

    const forgotPassword = handleSubmitResetPass(async (values) => {
        btnModalLoading.value = !btnModalLoading.value
        const response = await authStore.forgotPassword(values.emailResetPass)

        if (response.status == 200) {
            useAlert.createAlert('Email enviado com sucesso.', 'success')
            btnModalLoading.value = !btnModalLoading.value
            openModal.value = !openModal.value
        }
        btnModalLoading.value = !btnModalLoading
    })

</script>

<style>
    @import "@/styles/LoginView.css";
</style>