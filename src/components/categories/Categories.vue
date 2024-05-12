<template>
  <div class="container mt-4">
    <h2>Categorías</h2>

    <button v-if="isAdmin" type="button" class="btn btn-success mb-3" @click="createCategory">Crear categoría</button>

    <div v-for="category in categories" :key="category.pk" class="category" @click="redirectToCategory(category.pk)">
      {{ category.name }}

      <!-- Botones de eliminar y editar -->
      <div class="buttons-container" v-if="isAdmin">
        <button type="button" class="btn btn-danger m-2 btn-sm" @click.stop="showDeleteModal(category)">
          <i class="fas fa-trash-alt"></i>
        </button>
        <button type="button" class="btn btn-primary m-2 btn-sm" @click.stop="editCategory(category.pk)">
          <i class="fas fa-edit"></i>
        </button>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <!-- Componente del modal de confirmación de eliminación -->
    <ConfirmDelete v-if="showModal" :type="'categories'" @cancel="closeDeleteModal"
      @confirm="handleDeleteConfirmation" />

    <div v-if="totalPages > 1" class="pagination">
      <button v-for="page in totalPages" :key="page" @click="goToPage(page)"
        :class="{ 'btn': true, 'btn-primary': currentPage === page, 'btn-outline-primary': currentPage !== page }">{{
          page }}</button>
    </div>

    <div v-if="loading && loadingSpinnerEnable" class="loading-indicator">
      <div class="spinner-border orange-spinner" role="status">
        <span>🍕</span>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import ConfirmDelete from '@/components/ConfirmDelete.vue';

export default {
  data() {
    return {
      categories: [],
      currentPage: 1,
      totalPages: 1,
      loading: false,
      loadingSpinnerEnable: false,
      showModal: false,
      isAdmin: localStorage.getItem('isAdmin') === 'true',
      cache: {},
      deleteId: null,
    };
  },
  components: {
    ConfirmDelete,
  },
  created() {
    this.fetchCategories();
  },
  methods: {
    /**
     * Obtiene las categorías de la API
     * @param page {number} - Número de página a obtener
     */
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
    /**
     * Navega a la página indicada
     * @param page {number} - Número de página a la que se quiere ir
     */
    async goToPage(page) {
      this.fetchCategories(page);
    },

    /**
     * Precarga los datos de la página indicada
     * @param page {number} - Número de página a precargar
     */
    async preloadCategories(page) {
      try {
        const preloadTimeout = 4000;
        const preloadResponse = await axios.get(`/api/categories/?limit=10&offset=${(page - 1) * 10}`);
        this.cache[page] = preloadResponse.data.results;
      } catch (error) {
        console.error('Error al precargar las categorías:', error);
      }
    },

    /**
     * Redirige a la página de la categoría seleccionada
     * @param categoryId {number} - ID de la categoría a la que se quiere redirigir
     */
    redirectToCategory(categoryId) {
      this.$router.push(`/categories/${categoryId}`);
    },
    /**
     * Redirige a la página de edición de la categoría
     * @param categoryId {number} - ID de la categoría a editar
     */
    editCategory(categoryId) {
      this.$router.push(`/categories/${categoryId}/edit`);
    },

    /**
     * Muestra el modal de confirmación de eliminación
     * @param category {Object} - Categoría a eliminar
     */
    showDeleteModal(category) {
      this.showModal = true;
      this.deleteId = category.pk;
    },

    /**
     * Cierra el modal de confirmación de eliminación
     */
    closeDeleteModal() {
      this.showModal = false;
    },

    /**
     * Maneja la confirmación de eliminación de la categoría
     * @param {Object} param0 - Objeto con la información de la categoría a eliminar
     */
    handleDeleteConfirmation({ type }) {
      axios.delete(`/api/${type}/${this.deleteId}/`)
        .then(response => {
          if (response.status === 204) {
            console.log(`Categoría con ID ${this.deleteId} eliminada exitosamente.`);
            window.location.reload();
            this.$router.push({ path: '/categories', query: { success: 'Categoría eliminada' } });
          } else {
            console.error('Error al eliminar la categoría:', response);
            this.$router.push({ path: '/categories', query: { error: 'Error al intentar eliminar la categoría' } });
          }
        })
        .catch(error => {
          console.error('Error al eliminar la categoría:', error);
          this.$router.push({ path: '/categories', query: { error: 'Error al intentar eliminar la categoría' } });
        })
        .finally(() => {
          this.showModal = false;
        });
    },
    /**
     * Redirige a la página de creación de categorías
     */
    async deleteCategory() {
      const categoryId = this.categoryToDelete.pk;
      try {
        const response = await axios.delete(`/api/categories/${categoryId}/`);
        if (response.status === 204) {
          console.log(`Categoría con ID ${categoryId} eliminada exitosamente.`);
          this.fetchCategories();
        }
      } catch (error) {
        console.error('Error al eliminar la categoría:', error);
      }
      this.closeModal();
    },
    /**
     * Cancela la eliminación de la categoría
     */
    cancelDelete() {
      this.closeModal();
    },
    /**
     * Cierra el modal de eliminación
     */
    closeModal() {
      this.showModal = false;
      this.categoryToDelete = null;
    },
    createCategory() {
      this.$router.push('/categories/create');
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
  cursor: pointer;
}

.category:hover {
  background-color: #eeeeee;
  transition: background-color 0.2s;
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
