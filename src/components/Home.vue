<template>
  <div class="container mt-4">
    <h2>Inicio</h2>
  </div>
</template>

<script>
import axios from 'axios';

export default {
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
