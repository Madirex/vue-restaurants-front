<template>
  <div class="container mt-4">
    <h2>Inicio</h2>
    <Restaurants></Restaurants>
  </div>
</template>

<!-- poner Restaurants.vue -->

<script>
import axios from 'axios';
import Restaurants from '@/components/restaurants/Restaurants.vue';

export default {
  components: {
    Restaurants,
  },
  data() {
    return {
      email: '',
      password: '',
      isSubmitting: false,
      alert: {
        message: '',
        type: '',
      },
    };
  },
};
</script>
