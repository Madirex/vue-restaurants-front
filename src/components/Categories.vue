<template>
  <div class="container mt-4">
    <h2>Categorías</h2>
    <div v-for="category in categories" :key="category.pk" class="category">
      {{ category.name }}
    </div>

    <div v-if="totalPages > 1" class="pagination">
      <button v-for="page in totalPages" :key="page" @click="goToPage(page)" :class="{ 'btn': true, 'btn-primary': currentPage === page, 'btn-outline-primary': currentPage !== page }">{{ page }}</button>
    </div>

    <div v-if="loading && loadingSpinnerEnable" class="loading-indicator">
      <!-- spinner naranja -->
      <div class="spinner-border orange-spinner" role="status">
        <span >🍕</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      categories: [],
      currentPage: 1,
      totalPages: 1,
      loading: false,
      loadingSpinnerEnable: false,
      cache: {},
    };
  },
  created() {
    this.fetchCategories();
  },
  methods: {
    async fetchCategories(page = 1) {
    try {
      if (this.cache[page]) {
        this.categories = this.cache[page];
        this.currentPage = page;
      } else {
        this.loadingSpinnerEnable = false;
        setTimeout(() => {
          this.loadingSpinnerEnable = true;
        }, 1000);
        this.loading = true;
        const response = await axios.get(`/api/categories/?limit=10&offset=${(page - 1) * 10}`);
        this.categories = response.data.results;
        this.cache[page] = response.data.results;
        this.totalPages = Math.ceil(response.data.count / 10);
        this.currentPage = page;

        // Precargar los datos de la página siguiente en segundo plano si no están en caché
        if (page < this.totalPages && !this.cache[page + 1]) {
          this.preloadCategories(page + 1);
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 401) {
        this.$router.push('/401');
      } else {
        console.error('Error al obtener las categorías:', error);
      }
    } finally {
      this.loading = false;
    }
  },

    async goToPage(page) {
      this.fetchCategories(page);
    },
    async preloadCategories(page) {
      try {
        const preloadTimeout = 4000;
        const preloadResponse = await axios.get(`/api/categories/?limit=10&offset=${(page - 1) * 10}`);
        this.cache[page] = preloadResponse.data.results;
      } catch (error) {
        console.error('Error al precargar las categorías:', error);
      }
    },
  },
};
</script>

<style scoped>
.category {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  max-width: 100%;
  word-wrap: break-word;
}

.pagination {
  margin-top: 10px;
  margin-bottom: 30px;
}

.pagination button {
  margin-right: 5px;
  cursor: pointer;
}

/* Estilo del botón activo */
.btn-primary {
  background-color: #007bff;
  border-color: #007bff;
}

.btn-outline-primary {
  color: #007bff;
  background-color: transparent;
  background-image: none;
  border-color: #007bff;
}

.btn-primary:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.btn-outline-primary:hover {
  color: #0056b3;
  background-color: #f8f9fa;
  border-color: #f8f9fa;
}

.orange-spinner {
  color: orange;
}
</style>
