import axios from "axios";
import { useAlertStore } from "@/store/alert";

export const endPoint = axios.create({
    baseURL: "http://localhost:8080/",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });

/**
 * Realiza requisições para o backend
 * @param method método da requisição
 * @param url URL de destino
 * @param data dados que devem ser enviados
 */
export async function useApi(method:'get'|'post'|'put'|'delete'|'options'|'patch', url:string, data?:any, headers?:any) {
    const useAlert = useAlertStore()

    try {
      const response = await endPoint.request({
        method,
        //possibilita o uso de query string, como por exemplo .../?name='Maria'
        url: url + ((data) ? ('?'+data) : ('')),
        data,
        headers,
      })
  
      if(response.status === 200 || response.status == 201){
        return response.data
      }
  
      else{
        console.log(response.data);
        
      }
      
    } catch (error:any) {
      //Quando houver várias mensagens de erro
      if (Array.isArray(error.response.data.message)) {
        error.response.data.message.map(async (m:string) => {
          useAlert.createAlert(m, 'error')
        })
      }

      //quando o erro for de sessão expirada
      else if (error.response.data.message == 'Sessão expirada.') {
        window.location.reload()
        useAlert.createAlert('Sessão expirada.', 'error')
      }

      //Quando houver uma mensagem de erro
      else{
        useAlert.createAlert(error.response.data.message, 'error')
        console.log(error.response.data);
        
      }
    }
}

//usando o interceptors do axios para interceptar todas as requisições 
endPoint.interceptors.request.use(function (config) {
  //pegando o token no localStorage que foi definido no método de login
  const token = localStorage.getItem('token')

  //colocando o campo Authorization com token de acesso no cabeçalho de todas as requisições que foram interceptadas
  if (!config.headers!.Authorization && (token != '')) {
    config.headers!.Authorization = `Bearer ${token}`
  }

  return config
}, function(error) {
  return Promise.reject(error)
})