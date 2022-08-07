<script setup>
import { RouterLink, RouterView } from 'vue-router';
import Login from './components/Login.vue';
import {isLoggedIn, updateLoggedInStatus} from './apiclient';
import router from './router';

updateLoggedInStatus()

</script>

<template>
  <nav class="navbar navbar-light bg-light">
    <div class="container-fluid">
      <span class="navbar-brand mb-0 h1">AppName</span>
    </div>


  </nav>

  <RouterView></RouterView>
</template>

<style scoped>


</style>
