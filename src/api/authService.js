import api from './apiClient'

export const clientLoginOrRegister = (payload) =>
  api.post('/auth/client/login', payload)

export const kitchenLogin = (payload) =>
  api.post('/auth/kitchen/login', payload)


export const clientLogin = (payload) =>
  api.post('/auth/client/login', payload) // returns token variant later
S
export const clientRegisterName = (payload) =>
  api.post('/auth/client/register-name', payload)
