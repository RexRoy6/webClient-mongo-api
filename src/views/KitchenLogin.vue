<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const number_kitchenNumber = ref('')
const kitchenUser_key = ref('')
const error = ref(null)

const submit = async () => {
  error.value = null

  try {
    const data = await auth.loginKitchen(
      Number(number_kitchenNumber.value),
      Number(kitchenUser_key.value)
    )

    console.log('Kitchen logged in:', data)

    // Redirect to kitchen dashboard
    router.push('/kitchen/dashboard')
  } catch (e) {
    error.value = e.response?.data?.message || e.message || 'Login failed'
    console.error('Login error:', e)
  }
}
</script>

<template>
  <div class="login-box">
    <h2>Kitchen Login</h2>

    <form @submit.prevent="submit">
      <label>Kitchen User Number</label>
      <input v-model="number_kitchenNumber" type="number" required />

      <label>Kitchen User Key</label>
      <input v-model="kitchenUser_key" type="number" required />

      <button type="submit">Login</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.login-box {
  width: 300px;
  margin: 60px auto;
  display: flex;
  flex-direction: column;
  gap: 18px;
}

form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

button {
  background: black;
  color: white;
  padding: 12px;
  border-radius: 6px;
  border: none;
  font-size: 16px;
  cursor: pointer;
}

.error {
  color: red;
  margin-top: 10px;
}
</style>