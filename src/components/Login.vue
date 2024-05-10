<template>
  <div class="container mt-4">
    <h2>Iniciar sesión</h2>

    <!-- Mensajes de error -->
    <div v-if="alert.message" :class="['alert', alert.type]" role="alert">
      {{ alert.message }}
    </div>

    <form @submit.prevent="login">
      <div class="mb-3">
        <label for="email" class="form-label">Correo electrónico:</label>
        <input type="email" v-model="email" class="form-control" required />
      </div>

      <div class="mb-3">
        <label para="password" class="form-label">Contraseña:</label>
        <input type="password" v-model="password" class="form-control" required />
      </div>

      <div class="mb-3">
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">Iniciar sesión</button>
      </div>

      <div v-if="isSubmitting">
        <div class="spinner-border text-primary" role="status">
          <span class="visually-hidden">Cargando...</span>
        </div>
      </div>
    </form>
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
  methods: {
    async login() {
      this.isSubmitting = true;

      try {
        const response = await axios.post('/api/users/login/', {
          email: this.email,
          password: this.password,
        });
        const token = response.data.access_token;
        localStorage.setItem('authToken', token);
        this.$router.push('/');
        window.location.reload();
      } catch (error) {
        this.isSubmitting = false;
        const response = error.response;

        if (response && response.status === 400) {
          this.alert.message = 'Las credenciales no son válidas';
          this.alert.type = 'alert-danger';
        } else {
          this.alert.message = 'Error al iniciar sesión. Intente de nuevo más tarde.';
        }
      } finally {
        this.isSubmitting = false;
      }
    },
  },
};
</script>

<style scoped>
button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
