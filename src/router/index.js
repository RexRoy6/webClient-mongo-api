import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useBusinessStore } from '@/stores/business'

// Views
import BusinessIdentification from '@/views/BusinessIdentification.vue'
import LoginSelection from '@/views/LoginSelection.vue'
import ClientLogin from '@/views/ClientLogin.vue'
import KitchenLogin from '@/views/KitchenLogin.vue'
import ClientDashboard from '@/views/ClientDashboard.vue'
import KitchenDashboard from '@/views/KitchenDashboard.vue'
import BaristaLogin from '@/views/BaristaLogin.vue'
import BaristaDashboard from '@/views/BaristaDashboard.vue'


const routes = [
  // First step: Identify business
  {
    path: '/',
    name: 'business-identification',
    component: BusinessIdentification
  },

  // Business identification route (also accessible directly)
  {
    path: '/business-identification',
    name: 'business-identification-page',
    component: BusinessIdentification
  },

  // Login selection (requires business context)
  {
    path: '/select-login',
    name: 'select-login',
    component: LoginSelection,
    meta: { requiresBusiness: true }
  },

  // Login Pages (require business context)
  {
    path: '/client/login',
    name: 'client-login',
    component: ClientLogin,
    meta: { requiresBusiness: true }
  },

  {
    path: '/kitchen/login',
    name: 'kitchen-login',
    component: KitchenLogin,
    meta: { requiresBusiness: true }
  },
  {
    path: '/barista/login',
    name: 'barista-login',
    component: BaristaLogin,
    meta: { requiresBusiness: true }
  },

  // Protected Client Dashboard
  {
    path: '/client/dashboard',
    name: 'client-dashboard',
    component: ClientDashboard,
    meta: {
      requiresAuth: true,
      requiresBusiness: true,
      role: 'client'
    }
  },

  // Protected Kitchen Dashboard
  {
    path: '/kitchen/dashboard',
    name: 'kitchen-dashboard',
    component: KitchenDashboard,
    meta: {
      requiresAuth: true,
      requiresBusiness: true,
      role: 'kitchen'
    }
  },

  {
    path: '/barista/dashboard',
    name: 'barista-dashboard',
    component: BaristaDashboard,
    meta: {
      requiresAuth: true,
      requiresBusiness: true,
      role: 'barista'
    }
  },

  // Fallback → redirect to business identification
  { path: '/:pathMatch(.*)*', redirect: '/' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.afterEach((to) => {
  if (to.meta.requiresAuth) {
    localStorage.setItem('last_route', to.fullPath)
  }
})



router.beforeEach(async (to) => {
  const auth = useAuthStore()
  const business = useBusinessStore()

  // 🔁 Restore business from localStorage
  if (!business.hasBusinessContext) {
    await business.init()
  }

  // 🏠 ROOT AUTO-REDIRECT
  if (to.path === '/' && business.hasBusinessContext && auth.token && auth.userType) {
    if (auth.userType === 'client') return '/client/dashboard'
    if (auth.userType === 'kitchen') return '/kitchen/dashboard'
    if (auth.userType === 'barista') return '/barista/dashboard'
  }

  // 🔐 BUSINESS GUARD
  if (to.meta.requiresBusiness && !business.hasBusinessContext) {
    const expired = localStorage.getItem('business_expired')

    if (expired) {
      localStorage.removeItem('business_expired')
      return {
        path: '/business-identification',
        query: { reason: 'expired' }
      }
    }

    return '/business-identification'
  }

  // 🔄 RESTORE LAST AUTH ROUTE
  if (to.path === '/select-login' && auth.token && auth.userType) {
    const lastRoute = localStorage.getItem('last_route')
    if (lastRoute) return lastRoute
  }

  // 🚀 AUTO-REDIRECT LOGGED-IN USERS
  if (to.path === '/select-login') {
    if (auth.token && auth.userType) {
      if (auth.userType === 'client') return '/client/dashboard'
      if (auth.userType === 'kitchen') return '/kitchen/dashboard'
      if (auth.userType === 'barista') return '/barista/dashboard'
    }
  }

  // 🔑 AUTH GUARD
  if (to.meta.requiresAuth) {
    if (!auth.token) {
      return '/client/login'
    }

    if (to.meta.role && auth.userType !== to.meta.role) {
      if (auth.userType === 'client') return '/client/dashboard'
      if (auth.userType === 'kitchen') return '/kitchen/dashboard'
      if (auth.userType === 'barista') return '/barista/dashboard'
      return '/select-login'
    }
  }

  return true
})





export default router