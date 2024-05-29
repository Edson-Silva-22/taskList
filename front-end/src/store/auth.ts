import { defineStore } from 'pinia'
import { useApi } from '@/plugins/clientHttp'
import { useUserStore } from './user'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const userStore = useUserStore()
  const loggedUser = ref()
  const userAuth = ref<any | null>(null)

  async function login(dados:any) {
    const response = await useApi('post', 'auth/login', dados)
    
    if (response && response.result) {
      localStorage.setItem('token', response.result)
      return response
    }

  }

  async function verifyToken(token:string) {
    const response = await useApi('get', 'auth/verify', null,{ Authorization: `Bearer ${token}`})
    
    if (response.result.valid) {
      userAuth.value = response.result.user
      return true
    }

    else{
      return false
    }
  }

  async function logout() {
    localStorage.removeItem('token')
  }

  async function forgotPassword(email:string) {
    const response = await useApi('post', `auth/forgotpass/?email=${email}`)
    return response
  }

  async function resetPass(dados:any) {
    const response = await useApi('post', 'auth/resetpass', dados)
    return response
  }

  return {
    login,
    verifyToken,
    logout,
    forgotPassword,
    resetPass,
    userAuth,
    loggedUser
  }
})