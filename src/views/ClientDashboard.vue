<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logoutClient()
  router.push('/')
}
</script>

<template>
  <div class="dashboard">
    <h1>Client Dashboard</h1>

    <div class="box">
      <h3>Logged in as:</h3>
      <p><strong>Name:</strong> {{ auth.guest?.guest_name }}</p>
      <p><strong>Room Number:</strong> {{ auth.guest?.room_number }}</p>
      <p><strong>UUID:</strong> {{ auth.guest?.guest_uuid }}</p>
    </div>

    <button @click="logout" class="logout-btn">Logout</button>

    <div class="box">
      <h3>Token Info:</h3>
      <p><strong>Token:</strong> {{ auth.token }}</p>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const router = useRouter()

async function logout() {
  await auth.logoutClient()
  router.push('/')
}
</script>


<style scoped>
.dashboard {
  padding: 20px;
}

.box {
  background: #f4f4f4;
  padding: 15px;
  margin-bottom: 20px;
  border-radius: 6px;
}

.logout-btn {
  background: #ff4d4d;
  color: white;
  border: none;
  padding: 10px 20px;
  cursor: pointer;
  border-radius: 5px;
  margin-bottom: 20px;
}
.logout-btn:hover {
  background: #e60000;
}
</style>
