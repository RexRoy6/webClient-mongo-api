import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views
import LoginSelection from '@/views/LoginSelection.vue'
import ClientLogin from '@/views/ClientLogin.vue'
import KitchenLogin from '@/views/KitchenLogin.vue'
import ClientDashboard from '@/views/ClientDashboard.vue'
import KitchenDashboard from '@/views/KitchenDashboard.vue'

const routes = [
  // Home: Choose Client Login or Kitchen Login
  { path: '/', name: 'select-login', component: LoginSelection },

  // Login Pages
  { path: '/client/login', name: 'client-login', component: ClientLogin },
  { path: '/kitchen/login', name: 'kitchen-login', component: KitchenLogin },

  // Protected Client Dashboard
  {
    path: '/client/dashboard',
    name: 'client-dashboard',
    component: ClientDashboard,
    meta: { requiresAuth: true, role: 'client' }
  },

  // Protected Kitchen Dashboard
  {
    path: '/kitchen/dashboard',
    name: 'kitchen-dashboard',
    component: KitchenDashboard,
    meta: { requiresAuth: true, role: 'kitchen' }
  },

  // Fallback → redirect unknown URLs
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Middleware/Auth Guard
router.beforeEach((to) => {
  const auth = useAuthStore()

  if (to.meta.requiresAuth && !auth.token) {
    return '/'
  }

  return true
})

export default router
