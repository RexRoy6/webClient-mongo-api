import api from './apiClient'

export const clientLoginOrRegister = (payload) =>
  api.post('/auth/client/login', payload)

export const kitchenLogin = (payload) =>
  api.post('/auth/kitchen/login', payload)
