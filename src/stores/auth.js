import { defineStore } from 'pinia'
import api from '/src/api/apiClient.js' // import your axios instance

export const useAuthStore = defineStore('auth', {
  state: () => ({
  token: localStorage.getItem('token') || null,
  userType: localStorage.getItem('userType') || null,
  guest: JSON.parse(localStorage.getItem('guest')) || null
}),

actions: {
  saveSession(token, userType, guest) {
    this.token = token
    this.userType = userType
    this.guest = guest

    localStorage.setItem('token', token)
    localStorage.setItem('userType', userType)
    localStorage.setItem('guest', JSON.stringify(guest))
  },

  async loginClient(room_number, room_key, guest_name) {
    const payload = { room_number, room_key, guest_name }

    try {
      const { data } = await api.post('api/auth/client/login', payload)

      this.saveSession(data.access_token, 'client', data.guest)

      return data
    } catch (error) {
      throw error.response?.data || error
    }
  },

    async loginKitchen(number_kitchenNumber, kitchenUser_key) {
      const payload = { number_kitchenNumber, kitchenUser_key }

      try {
        const { data } = await api.post('api/auth/kitchen/login', payload) // use `api` here
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
