<template>
  <nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
      <a class="navbar-brand" href="/">
        <img src="/favicon.ico" alt="App Logo" class="d-inline-block align-text-top" />
      </a>

      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav"
        aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
        <span class="navbar-toggler-icon"></span>
      </button>

      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <router-link to="/" class="nav-link">Inicio</router-link>
          </li>
          <li class="nav-item">
            <router-link to="/about" class="nav-link">Acerca de</router-link>
          </li>
          <div v-if="isAdmin">
            <li class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button" data-bs-toggle="dropdown"
                aria-expanded="false">
                Administración
              </a>
              <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                <li class="nav-item">
                  <router-link to="/categories" class="nav-link">Categorías</router-link>
                </li>
                <li class="nav-item">
                  <router-link to="/cartcodes" class="nav-link">Códigos de carrito</router-link>
                </li>
              </ul>
            </li>
          </div>
        </ul>
        <div v-if="isAuthTokenAvailable">
          <router-link to="/" class="nav-link" @click="logout">Cerrar sesión</router-link>
        </div>
        <div v-else>
          <router-link to="/login" class="nav-link me-4">Iniciar sesión</router-link>
          <router-link to="/signup" class="nav-link">Registro</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script>
export default {
  name: 'AppNavbar',
  data() {
    return {
      authToken: null
    }
  },
  computed: {
    isAuthTokenAvailable() {
      return this.authToken !== null;
    },
    isAdmin() {
      return this.authToken !== null && localStorage.getItem('isAdmin') === 'true';
    }
  },
  watch: {
    authToken() {
      this.authToken = typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('authToken');
    }
  },
  created() {
    this.authToken = typeof window !== 'undefined' && window.localStorage && window.localStorage.getItem('authToken');
  },
  methods: {
    logout() {
      window.localStorage.removeItem('authToken');
      this.authToken = null;
      this.$emit('logout');
    }
  }
};
</script>

<style scoped>
.nav-link:hover {
  color: #007bff;
  text-decoration: none;
}

.nav-item {
  transition: color 0.3s;
}

.navbar-brand {
  transition: transform 0.3s ease;
}

.navbar-brand:hover {
  transform: scale(1.2);
}

</style>
