<script setup>
</script>

<template>
  <div id="nav">
    <AppNavbar @check-auth="isAuthenticated" @logout="logout" />
    <div v-if="$route.query.success" class="alert alert-success">
      {{ $route.query.success }}
    </div>
    <div v-if="$route.query.error" class="alert alert-danger">
      {{ $route.query.error }}
    </div>
    <router-view />
  </div>
  <!-- footer -->
  <AppFooter />
</template>

<script>
import '@fortawesome/fontawesome-free/css/all.css';
import SignUp from './components/SignUp.vue';
import Login from './components/Login.vue';
import Home from './components/Home.vue';
import AppNavbar from './components/AppNavbar.vue';
import AppFooter from './components/AppFooter.vue';

export default {
  components: {
    SignUp,
    Login,
    Home,
    AppNavbar,
    AppFooter,
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

.alert{
  margin: 1rem;
}
</style>
