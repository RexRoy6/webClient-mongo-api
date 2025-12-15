import { defineStore } from 'pinia'
import api from '/src/api/apiClient.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    userType: localStorage.getItem('userType') || null,
    guest: JSON.parse(localStorage.getItem('guest')) || null,
    kitchenUser: JSON.parse(localStorage.getItem('kitchenUser')) || null
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

    clearSession(token, userType){
      this.token = token
      this.userType = userType

      localStorage.removeItem('token', token)
      localStorage.removeItem('userType', userType)

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
          ...data.user,
          room_key
        }
        
        // Clear kitchen user if exists
        this.kitchenUser = null
        localStorage.removeItem('kitchenUser')

        localStorage.setItem('guest', JSON.stringify(this.guest))

        return data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    /* -------------------------------------------------------
     * KITCHEN LOGIN
     * Stores kitchen user details after login
     * ----------------------------------------------------- */
    async loginKitchen(number_kitchenNumber, kitchenUser_key) {
      const payload = { number_kitchenNumber, kitchenUser_key }

      try {
        const { data } = await api.post('api/auth/kitchen/login', payload)

        this.saveSession(data.access_token, 'kitchen')

        // Store kitchen user details
        this.kitchenUser = {
          ...data.guest, // Note: API returns "guest" object but contains kitchen user data
          kitchenUser_uuid: data.guest.kitchenUser_uuid,
          name_kitchenUser: data.guest.name_kitchenUser,
          number_kitchenNumber: number_kitchenNumber, // Store for logout
          kitchenUser_key: kitchenUser_key // Store for logout
        }
        
        // Clear guest if exists
        this.guest = null
        localStorage.removeItem('guest')

        localStorage.setItem('kitchenUser', JSON.stringify(this.kitchenUser))

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
                      // Clear guest if exists

        localStorage.removeItem('guest')

       //aqui meter quitar seesion
        this.clearSession(data.access_token, 'client')
      } catch (error) {
        console.error('Failed to reset room:', error)
      }

      // always perform local logout even if API fails
      this.logout()
    },

    /* -------------------------------------------------------
     * KITCHEN LOGOUT WITH API call
     * ----------------------------------------------------- */
    async logoutKitchen() {
      try {
        if (this.kitchenUser && this.kitchenUser.number_kitchenNumber && this.kitchenUser.kitchenUser_key) {
          const payload = {
            number_kitchenNumber: this.kitchenUser.number_kitchenNumber,
            kitchenUser_key: this.kitchenUser.kitchenUser_key
          }

          await api.put('api/auth/kitchen/logout', payload)
        }
      } catch (error) {
        console.error('Failed to logout kitchen:', error)
      }

      // always perform local logout even if API fails
      this.logout()
    },

    /* -------------------------------------------------------
     * LOCAL LOGOUT (for both client and kitchen)
     * ----------------------------------------------------- */
    logout() {
      this.token = null
      this.userType = null
      this.guest = null
      this.kitchenUser = null

      localStorage.removeItem('token')
      localStorage.removeItem('userType')
      localStorage.removeItem('guest')
      localStorage.removeItem('kitchenUser')
    },

    /* -------------------------------------------------------
     * SMART LOGOUT (automatically chooses correct method)
     * ----------------------------------------------------- */
    async smartLogout() {
      if (this.userType === 'client') {
        await this.logoutClient()
      } else if (this.userType === 'kitchen') {
        await this.logoutKitchen()
      } else {
        this.logout()
      }
    },

    /* -------------------------------------------------------
     * GET CURRENT USER (helper method)
     * ----------------------------------------------------- */
    getCurrentUser() {
      if (this.userType === 'client') {
        return this.guest
      } else if (this.userType === 'kitchen') {
        return this.kitchenUser
      }
      return null
    },

    /* -------------------------------------------------------
     * GET USER UUID (helper method)
     * ----------------------------------------------------- */
    getUserUuid() {
      if (this.userType === 'client' && this.guest) {
        return this.guest.guest_uuid
      } else if (this.userType === 'kitchen' && this.kitchenUser) {
        return this.kitchenUser.kitchenUser_uuid
      }
      return null
    }
  }
})