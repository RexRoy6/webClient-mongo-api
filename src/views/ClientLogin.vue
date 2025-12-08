<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const router = useRouter()
const auth = useAuthStore()

const roomNumber = ref('')
const roomKey = ref('')
const guestName = ref('')
const errorMsg = ref(null)

async function login() {
  errorMsg.value = null

  try {
    const response = await auth.loginClient(
      Number(roomNumber.value),
      Number(roomKey.value),
      guestName.value
    )

    console.log('Logged in:', response)

    // ⭐ Redirect to dashboard
    router.push('/client/dashboard')
  } catch (error) {
    errorMsg.value = error.message || 'Login failed'
  }
}
</script>

<template>
  <div>
    <h1>Client Login</h1>

    <div v-if="errorMsg" class="error-box">
      {{ errorMsg }}
    </div>

    <input v-model="roomNumber" placeholder="Room Number" />
    <input v-model="roomKey" placeholder="Room Key" />
    <input v-model="guestName" placeholder="Guest Name" />

    <button @click="login">Log in</button>
  </div>
</template>

<style>
.error-box {
  color: red;
  margin-bottom: 12px;
}
</style>
