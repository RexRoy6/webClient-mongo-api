<template>
  <div class="login-box">
    <h2>Guest Login</h2>

    <form @submit.prevent="submit">
      <label>Room Number</label>
      <input v-model="room_number" type="number" required />

      <label>Room Key</label>
      <input v-model="room_key" type="number" required />

      <label>Guest Name</label>
      <input v-model="guest_name" type="text" required />

      <button type="submit">Login</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { clientLoginOrRegister } from '../api/authService'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const room_number = ref('')
const room_key = ref('')
const guest_name = ref('')

const error = ref(null)

const submit = async () => {
  error.value = null

  try {
    const res = await clientLoginOrRegister({
      room_number: Number(room_number.value),
      room_key: Number(room_key.value),
      guest_name: guest_name.value.trim()
    })

    const { access_token, guest } = res.data

    // save to pinia store
    auth.login({
      access_token,
      guest_uuid: guest.guest_uuid,
      guest_name: guest.guest_name
    })

    router.push('/menu')  // you will create this later
  } catch (e) {
    error.value = e.response?.data?.message || 'Login failed'
  }
}
</script>

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
