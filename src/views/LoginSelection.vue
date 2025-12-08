<template>
  <div class="login-selection">
    <h1>Welcome</h1>
    <p>Please choose your access type</p>

    <div class="buttons">
      <button @click="goClientLogin">Guest Login</button>
      <button @click="goKitchenLogin">Kitchen Login</button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

const goClientLogin = () => router.push('/client/login')
const goKitchenLogin = () => router.push('/kitchen/login')
</script>

<style scoped>
.login-selection {
  display: flex;
  flex-direction: column;
  gap: 20px;
  text-align: center;
  margin-top: 80px;
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

button {
  padding: 14px;
  border-radius: 8px;
  border: none;
  font-size: 18px;
  cursor: pointer;
  background: black;
  color: white;
}
</style>
