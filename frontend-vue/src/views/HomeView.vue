<script setup>
import { isLoggedIn, updateLoggedInStatus } from '@/apiclient.js';
import Login from '@/components/Login.vue';
</script>

<template>
  <main>
    <div class="container mt-4" >
      <div class="row row-cols-1 row-cols-md-3 mb-3 text-center">
        <div class="col">
          <div class="card rounded-3">
            <div class="card-header py-3 bg-primary border-primary text-white">
              <h4 class="my-0 fw-bold">Logged in status</h4>
            </div>
            <div class="card-body">
               <p>isLoggedIn: {{isLoggedIn}}</p>
               <button @click="updateLoggedInStatus" type="button" class="btn btn-lg btn-outline-primary w-100">Refresh</button>
            </div>
          </div>
        </div>
        <div class="col">
          <Login @v-if="!isLoggedIn"></Login>
        </div> 
      </div>
  
    </div>

  </main>
</template>

<style scope>

</style>