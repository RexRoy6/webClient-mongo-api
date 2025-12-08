import { createRouter, createWebHistory } from 'vue-router'

import LoginSelection from '../pages/LoginSelection.vue'
import ClientLogin from '../pages/ClientLogin.vue'
import KitchenLogin from '../pages/KitchenLogin.vue'

const routes = [
  { path: '/', component: LoginSelection },

  // client
  { path: '/client/login', component: ClientLogin },

  // kitchen
  { path: '/kitchen/login', component: KitchenLogin },
]

export default createRouter({
  history: createWebHistory(),
  routes
})
