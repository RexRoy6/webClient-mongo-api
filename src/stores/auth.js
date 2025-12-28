import { defineStore } from 'pinia'
import api from '@/api/apiClient'


function safeParse(key) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : null
  } catch {
    localStorage.removeItem(key)
    return null
  }
}


export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token'),
    userType: localStorage.getItem('userType'),
    guest: safeParse('guest'),
    staffUser: safeParse('staffUser')
  }),

  actions: {
    saveSession(token, userType) {
      this.token = token
      this.userType = userType
      localStorage.setItem('token', token)
      localStorage.setItem('userType', userType)
    },

    clearSession() {
      this.token = null
      this.userType = null
      localStorage.removeItem('token')
      localStorage.removeItem('userType')
    },

    async loginClient(room_number, room_key, guest_name) {
  const { data } = await api.post('api/auth/client/login', {
    room_number,
    room_key,
    guest_name
  })

  //console.log('[AUTH] loginClient response', data)

  const role = data.user.role
  this.saveSession(data.access_token, role)

  this.guest = {
    role,
    guest_name: data.user.guest_name,
    room_number: data.user.room_number,
    room_key
  }

  //console.log('[AUTH] guest saved', this.guest)

  localStorage.setItem('guest', JSON.stringify(this.guest))
  localStorage.removeItem('staffUser')

  return data
},


    async loginStaff(staff_number, staff_key) {
      const { data } = await api.post('api/auth/staff/login', {
        staff_number,
        staff_key
      })

      // 🔑 use role from backend
      const role = data.user.role // "kitchen" | "barista"

      this.saveSession(data.access_token, role)

      this.staffUser = {
        role,
        name: data.user.name,
        staff_number,
        staff_key
      }

      localStorage.setItem('staffUser', JSON.stringify(this.staffUser))
      localStorage.removeItem('guest')

      return data
    },



    async logoutClient() {
      try {
        if (this.guest) {
          await api.put('api/auth/client/reset-room', {
            room_number: this.guest.room_number,
            room_key: this.guest.room_key
          })
        }
      } catch (e) {
        console.error(e)
      }

      this.logout()
    },

    async logoutKitchen() {
      try {
        if (this.staffUser) {
          await api.put('api/auth/staff/logout', {
            staff_number: this.staffUser.staff_number,
            staff_key: this.staffUser.staff_key
          })
        }
      } catch (e) {
        console.error(e)
      }

      this.logout()
    },

    logout() {//aqui agarrar lo de logoutkitchen o logout user
      this.clearSession()
      this.guest = null
      this.staffUser = null
      localStorage.removeItem('guest')
      localStorage.removeItem('staffUser')
    },

    async smartLogout() {
      if (this.userType === 'client') {
        return await this.logoutClient()
      }

      if (this.userType === 'kitchen' || this.userType === 'barista' || this.userType === 'admin') {
        return await this.logoutKitchen()
      }

      // fallback
      this.logout()
    },


    getCurrentUser() {
      if (this.userType === 'client') return this.guest
      if (this.userType === 'kitchen') return this.staffUser
      return null
    }
  },


  //temp
  saveSession(token, userType) {
  console.log('[AUTH] saveSession', { token, userType })
  this.token = token
  this.userType = userType
  localStorage.setItem('token', token)
  localStorage.setItem('userType', userType)
}
//temp
})
