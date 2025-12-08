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

    // schedule token refresh 5 min before expiration
// const expiresMs = 86000 * 1000 // 24h - small buffer
// setTimeout(() => {
//   this.refreshToken()
// }, expiresMs - 5 * 60 * 1000)


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
//   async refreshToken() {
//   try {
//     const { data } = await api.post("api/auth/refresh")

//     this.saveSession(
//       data.access_token,
//       this.userType,
//       this.guest
//     )

//     return data.access_token
//   } catch (err) {
//     this.logout()
//     return null
//   }
// },

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
