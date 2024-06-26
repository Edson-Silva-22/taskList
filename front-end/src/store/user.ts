// Utilities
import { defineStore } from 'pinia'
import { useApi } from '@/plugins/clientHttp'

export const useUserStore = defineStore('user', () => {
  async function create(dados: any) {
    const response = await useApi('post', 'users', dados)
    return response
  }

  async function findAll(queryString:any) {
    const response = await useApi('get', `users/?userId=${queryString.userId}${queryString.nameFilter ? `&&nameFilter=${queryString.nameFilter}` : ''}`)
    return response
  }

  async function findOne(id:number) {
    const response = await useApi('get', `users/${id}`)
    return response
  }

  async function update(id:number, dados:any) {
    const response = await useApi('put', `users/${id}`, dados)
    return response
  }

  async function profilePicture(id:number, photo:any) {
    const response = await useApi('post', `users/${id}`, photo, {
      'Content-Type': 'multipart/form-data'
    })
    return response
  }

  async function remove(id:number) {
    const response = await useApi('delete', `users/${id}`)
    return response
  }

  return {
    create,
    findAll,
    findOne,
    update,
    profilePicture,
    remove
  }
})
