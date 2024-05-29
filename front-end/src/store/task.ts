import { defineStore } from 'pinia'
import { useApi } from '@/plugins/clientHttp'

export const useTaskStore = defineStore('task', () => {

  async function create(dados: any) {
    return await useApi('post', 'tasks', dados)
  }

  async function findAll(queryString: any) {
    const response = await useApi('get', `tasks/?userId=${queryString.userId}${queryString.titleFilter}${queryString.queryStringFilter}`)
    return response
  }

  async function tasksCount(userId:number) {
    const response = await useApi('get', `tasks/tasksCount/?userId=${userId}`)
    return response
  }

  async function findOne(id: number, userId: number) {
    const response = await useApi('get', `tasks/${id}/${userId}`)
    return response
  }

  async function update(id:number, dados:any) {
    const response = await useApi('put', `tasks/${id}`, dados)
    return response
  }

  async function remove(id: number, userId: number) {
    const response = await useApi('delete', `tasks/${id}/${userId}`)
    return response
  }

  return {
    create,
    findAll,
    tasksCount,
    findOne,
    update,
    remove
  }
})