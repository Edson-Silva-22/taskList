import { RouteLocationNormalizedLoaded, createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import Default from '@/layouts/default/Default.vue'

declare module 'vue-router' {
  interface RouteMeta {
    //permissões para acessar
    roles?: string[]
    //exige autenticação
    requiresAuth?: boolean
  }
}

const routes = [
  {
    path: '/',
    component: Default,
    children: [
      {
        path: '',
        name: 'Home',
        meta: {
          requiresAuth: true,
          //roles: ['admi']
        },
        component: () => import(/* webpackChunkName: "home" */ '@/views/TaskList.vue'),
      },
      {
        path: 'users',
        name: 'users',
        meta: {
          requiresAuth: true,
          roles: ['admin']
        },
        component: () => import(/* webpackChunkName: "home" */ '@/views/UserView.vue'),
      },
    ],
  },

  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue')
  },

  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue')
  },

  {
    path: '/resetpass',
    name: 'resetpass',
    component: () => import('@/views/ResetPassView.vue')
  },

  {
    path: '/accessDenied',
    name: 'accessDenied',
    component: () => import(/* webpackChunkName: "home" */ '@/views/AccessDeniedView.vue'),
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

//Essa parte sera chamada antes de acessar cada rota que tiver o meta requiresAuth
router.beforeEach(async (to: RouteLocationNormalizedLoaded) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    //pegando o token no localStorage que foi definido no método de login
    const token = localStorage.getItem('token')
    
    if (token) {
      //usando o método verifyToken para verificar o token
      const isAuthenticated = await auth.verifyToken(token)

      //se o token for válido o vue router deixa prosseguir na rota solicitada
      if (isAuthenticated) {  
        if (to.meta.roles) { 
          //verificando se usuário logado tem uma das permissões de acesso para a rota     
          if (to.meta.roles?.some((role) => auth.userAuth.roles.includes(role))) {
            return true
          } 
  
          else{
            return {name: 'accessDenied'}
          }
        }

        else{
          return true
        }

      }

      //se não for válido sera redirecionado para a rota de login
      else {
        // next({name: 'login'})
        return {name: 'login'}
      }
    }

    else {
      // next({name: 'login'})
      return {name: 'login'}
    }
  }

  else {
    return true
  }
})

export default router
