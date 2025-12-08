import { defineStore } from 'pinia'
import api from '/src/api/apiClient.js' // import your axios instance

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userType: localStorage.getItem('userType') || null
  }),

  actions: {
    saveSession(token, userType) {
      this.token = token
      this.userType = userType

      localStorage.setItem('token', token)
      localStorage.setItem('userType', userType)
    },

    async loginClient(room_number, room_key, guest_name) {
      const payload = { room_number, room_key, guest_name }

      try {
        const { data } = await api.post('/auth/client/login', payload) // use `api` here
        this.saveSession(data.access_token, 'client')
        return data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    async loginKitchen(number_kitchenNumber, kitchenUser_key) {
      const payload = { number_kitchenNumber, kitchenUser_key }

      try {
        const { data } = await api.post('/auth/kitchen/login', payload) // use `api` here
        this.saveSession(data.access_token, 'kitchen')
        return data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    logout() {
      this.token = null
      this.userType = null
      localStorage.removeItem('token')
      localStorage.removeItem('userType')
    }
  }
})
