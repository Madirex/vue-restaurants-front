<script setup>
</script>

<template>
  <div id="nav">
    <AppNavbar @check-auth="isAuthenticated" @logout="logout" />
    <!-- Muestra el mensaje de éxito si el query param 'success' está presente -->
    <div v-if="$route.query.success" class="alert alert-success">
      {{ $route.query.success }}
    </div>
    <router-view />
  </div>
</template>

<script>
import SignUp from './components/SignUp.vue';
import Login from './components/Login.vue';
import Home from './components/Home.vue';
import AppNavbar from './components/AppNavbar.vue';

export default {
  components: {
    SignUp,
    Login,
    Home,
    AppNavbar,
  },
  data() {
    return {
      isAuthenticated: false,
    };
  },
};
</script>

<style scoped>
header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}



@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
