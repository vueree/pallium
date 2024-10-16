<script setup>
import { ref } from "vue";
import axios from "axios";

const username = ref("");
const password = ref("");
const errorMessage = ref("");

const handleRegister = async () => {
  try {
    await axios.post("http://localhost:3000/register", {
      username: username.value,
      password: password.value
    });
    // Перенаправить пользователя на страницу входа
  } catch (error) {
    errorMessage.value = error.response.data.error || "Registration failed";
  }
};
</script>

<template>
  <div>
    <h1>Register</h1>
    <form @submit.prevent="handleRegister">
      <div>
        <label for="username">Username:</label>
        <input type="text" v-model="username" id="username" required />
      </div>
      <div>
        <label for="password">Password:</label>
        <input type="password" v-model="password" id="password" required />
      </div>
      <button type="submit">Register</button>
    </form>
    <p v-if="errorMessage">{{ errorMessage }}</p>
  </div>
</template>
