import { defineStore } from 'pinia'
import axios from 'axios'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: null,
    userType: null, // 'client' or 'kitchen'
  }),

  actions: {

    async loginClient(room_number, room_key, guest_name) {
      try {
        const payload = { room_number, room_key, guest_name }

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/client/login`,
          payload
        )

        this.token = data.access_token
        this.userType = 'client'

        return data
      } catch (error) {
        throw error.response?.data || error
      }
    },

    async loginKitchen(number_kitchenNumber, kitchenUser_key) {
      try {
        const payload = { number_kitchenNumber, kitchenUser_key }

        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/auth/kitchen/login`,
          payload
        )

        this.token = data.access_token
        this.userType = 'kitchen'

        return data
      } catch (error) {
        throw error.response?.data || error
      }
    }
  }
})
