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
    const res = await kitchenLogin({
      number_kitchenNumber: Number(number_kitchenNumber.value),
      kitchenUser_key: Number(kitchenUser_key.value)
    })

    const { access_token, kitchenUser } = res.data

    auth.login({
      access_token,
      kitchenUser_uuid: kitchenUser.kitchenUser_uuid
    })

    router.push('/kitchen') // kitchen dashboard later
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed'
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
