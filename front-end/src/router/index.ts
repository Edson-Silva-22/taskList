import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/store/auth'
import Default from '@/layouts/default/Default.vue'

const routes = [
  {
    path: '/',
    component: Default,
    children: [
      {
        path: '',
        name: 'Home',
        meta: {requiresAuth: true},
        component: () => import(/* webpackChunkName: "home" */ '@/views/TaskList.vue'),
      }
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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
})

//Essa parte sera chamada antes de acessar cada rota que tiver o meta requiresAuth
router.beforeEach(async (to, from, next) => {
  if (to.meta.requiresAuth) {
    const auth = useAuthStore()
    //pegando o token no localStorage que foi definido no método de login
    const token = localStorage.getItem('token')
    
    if (token) {
      //usando o método verifyToken para verificar o token
      const isAuthenticated = await auth.verifyToken(token)

      //se o token for válido o vue router deixa prosseguir na rota solicitada
      if (isAuthenticated) {        
        next()
      }

      //se não for válido sera redirecionado para a rota de login
      else {
        next({name: 'login'})
      }
    }

    else {
      next({name: 'login'})
    }
  }

  else {
    next()
  }
})

export default router
