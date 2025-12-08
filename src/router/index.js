import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import SelectLogin from '@/views/LoginSelection.vue'
import ClientLogin from '@/views/ClientLogin.vue'
import KitchenLogin from '@/views/KitchenLogin.vue'
import ClientDashboard from '@/views/ClientDashboard.vue'
import KitchenDashboard from '@/views/KitchenDashboard.vue'

const routes = [
  { path: '/', component: SelectLogin },

  { path: '/client-login', component: ClientLogin },
  { path: '/kitchen-login', component: KitchenLogin },

  // protected client area
  {
    path: '/client',
    component: ClientDashboard,
    meta: { requiresAuth: true }
  },

  // protected kitchen area
  {
    path: '/kitchen',
    component: KitchenDashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 🔐 Auth Guard
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {
    return '/'
  }
})

export default router
