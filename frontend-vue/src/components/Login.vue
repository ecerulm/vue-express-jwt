<script setup>
import {ref} from 'vue';
import {login} from '@/apiclient.js';

const username = ref('');
const password = ref('');
</script>

<template>
    <div  class="text-center">
      <form @submit.prevent="login(username, password)" class="form-login">
        <h1 class="h3 mt-3 mb-3">Please log in</h1>
        <label for="usernameField" class="visually-hidden">Email</label>
        <input id="usernameField" type="text" v-model="username" class="form-control" placeholder="username" required autofocus autocomplete="username">
        <label  class="visually-hidden">Password</label>
        <input type="password" class="form-control" v-model="password" placeholder="password" required autocomplete="current-password"> 
        <div class="d-grid gap-2 mt-3">

        <button type="submit" class="btn btn-outline-primary">Login</button>
        </div>

      </form>
    </div>
</template>



<style scoped>
.form-login {
  width: 100%;
  max-width: 350px;
  padding: 15px;
  margin: auto;
}
</style>