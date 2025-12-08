import { defineStore } from 'pinia'
import api from '/src/api/apiClient.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userType: localStorage.getItem('userType') || null,
    guest: JSON.parse(localStorage.getItem('guest')) || null
  }),

  actions: {

    /* -------------------------------------------------------
     * Save session (token + user type)
     * ----------------------------------------------------- */
    saveSession(token, userType) {
      this.token = token
      this.userType = userType

      localStorage.setItem('token', token)
      localStorage.setItem('userType', userType)
    },

    /* -------------------------------------------------------
     * CLIENT LOGIN
     * Stores guest AND room_key after login
     * ----------------------------------------------------- */
    async loginClient(room_number, room_key, guest_name) {
      const payload = { room_number, room_key, guest_name }

      try {
        const { data } = await api.post('api/auth/client/login', payload)

        this.saveSession(data.access_token, 'client')

        // Store guest details + room_key inside guest object
        this.guest = {
          ...data.guest,
          room_key
        }

        localStorage.setItem('guest', JSON.stringify(this.guest))

        return data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    /* -------------------------------------------------------
     * CLIENT LOGOUT WITH room reset API call
     * ----------------------------------------------------- */
    async logoutClient() {
      try {
        if (this.guest) {
          const payload = {
            room_number: this.guest.room_number,
            room_key: this.guest.room_key
          }

          await api.put('api/auth/client/reset-room', payload)
        }
      } catch (error) {
        console.error('Failed to reset room:', error)
      }

      // always perform local logout even if API fails
      this.logout()
    },

    /* -------------------------------------------------------
     * LOCAL LOGOUT
     * ----------------------------------------------------- */
    logout() {
      this.token = null
      this.userType = null
      this.guest = null

      localStorage.removeItem('token')
      localStorage.removeItem('userType')
      localStorage.removeItem('guest')
    }
  }
})
