<template>
  <div class="container mt-4">
    <h2>Registro</h2>

    <!-- Alertas de Bootstrap -->
    <div v-if="alert.message" :class="['alert', alert.type]" role="alert">
      {{ alert.message }}
    </div>

    <form @submit.prevent="register">
      <div class="mb-3">
        <label for="email" class="form-label">Correo electrónico:</label>
        <input type="email" v-model="email" class="form-control" required />
        <div v-if="fieldErrors.email" class="text-danger">{{ fieldErrors.email }}</div>
      </div>

      <div class="mb-3">
        <label para="username" class="form-label">Nombre de usuario:</label>
        <input type="text" v-model="username" class="form-control" required />
        <div v-if="fieldErrors.username" class="text-danger">{{ fieldErrors.username }}</div>
      </div>

      <div class="mb-3">
        <label para="first_name" class="form-label">Nombre:</label>
        <input type="text" v-model="first_name" class="form-control" required />
        <div v-if="fieldErrors.first_name" class="text-danger">{{ fieldErrors.first_name }}</div>
      </div>

      <div class="mb-3">
        <label para="last_name" class="form-label">Apellido:</label>
        <input type="text" v-model="last_name" class="form-control" required />
        <div v-if="fieldErrors.last_name" class="text-danger">{{ fieldErrors.last_name }}</div>
      </div>

      <div class="mb-3">
        <label para="password" class="form-label">Contraseña:</label>
        <input type="password" v-model="password" class="form-control" required />
        <div v-if="fieldErrors.password" class="text-danger">{{ fieldErrors.password }}</div>
      </div>

      <div class="mb-3">
        <label para="password_confirmation" class="form-label">Confirmar Contraseña:</label>
        <input type="password" v-model="password_confirmation" class="form-control" required />
        <div v-if="fieldErrors.password_confirmation" class="text-danger">{{ fieldErrors.password_confirmation }}</div>
      </div>

      <div class="mb-3">
        <button type="submit" class="btn btn-primary" :disabled="isSubmitting">Registrar</button>
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
      username: '',
      first_name: '',
      last_name: '',
      password: '',
      password_confirmation: '',
      isSubmitting: false,
      alert: {
        message: '',
        type: '',
      },
      fieldErrors: {
        email: '',
        username: '',
        first_name: '',
        last_name: '',
        password: '',
        password_confirmation: '',
      },
    };
  },
  methods: {
    async register() {
      this.isSubmitting = true;

      const apiUrl = '/api/users/signup/';

      const userData = {
        email: this.email,
        username: this.username,
        first_name: this.first_name,
        last_name: this.last_name,
        password: this.password,
        password_confirmation: this.password_confirmation,
      };

      try {
        const response = await axios.post(apiUrl, userData, {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        localStorage.setItem('authToken', response.data.access_token);
        window.location.reload();

      } catch (error) {
        this.isSubmitting = false;
        const response = error.response;

        if (response && response.status === 400) {
          const errors = response.data;

          // Construir un mensaje detallado de error
          let errorMessage = 'Error al registrar:';
          for (const key in errors) {
            if (errors[key].length > 0) {
              errorMessage += `\n${key}: ${errors[key].join(', ')}`;
            }
          }

          this.alert.message = errorMessage;
        } else {
          this.alert.message = 'Error inesperado al registrar. Intente de nuevo más tarde.';
        }

        this.alert.type = 'alert-danger';
      } finally {
        this.isSubmitting = false;
      }
    },
  },
  created() {
    if (localStorage.getItem('authToken')) {
      this.$router.push({ path: '/', query: { success: 'Registro exitoso' } });        
    }
  },
};
</script>

<style scoped>
.sign-up {
  padding: 20px;
  border-radius: 10px;
}

button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>
