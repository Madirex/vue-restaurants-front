<template>
  <div class="container mt-4">
    <h2>Códigos de Carrito</h2>

    <button v-if="isAdmin" type="button" class="btn btn-success mb-3" @click="createCartCode">Crear código de
      carrito</button>

    <div v-for="code in cartCodes" :key="code.id" class="code" @click="redirectToCartCode(code.id)">
      <div>{{ code.code }}</div>
      <div v-if="code.expiration_date" class="expiration">Expira: {{ code.expiration_date }}</div>

      <!-- Botones de eliminar y editar -->
      <div class="buttons-container" v-if="isAdmin">
        <button type="button" class="btn btn-danger m-2 btn-sm" @click.stop="showDeleteModal(code)">
          <i class="fas fa-trash-alt"></i>
        </button>
        <button type="button" class="btn btn-primary m-2 btn-sm" @click.stop="editCartCode(code.id)">
          <i class="fas fa-edit"></i>
        </button>
      </div>
    </div>

    <!-- Modal de confirmación de eliminación -->
    <ConfirmDelete v-if="showModal" :type="'cartcodes'" @cancel="closeDeleteModal"
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
import ConfirmDelete from '@/components/ConfirmDelete.vue';
import axios from 'axios';

export default {
  data() {
    return {
      cartCodes: [],
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
    this.fetchCartCodes();
  },
  methods: {
    async fetchCartCodes(page = 1) {
      try {
        if (this.cache[page]) {
          this.cartCodes = this.cache[page];
          this.currentPage = page;
        } else {
          this.loadingSpinnerEnable = false;
          setTimeout(() => {
            this.loadingSpinnerEnable = true;
          }, 1000);
          this.loading = true;
          const response = await axios.get(`/api/cartcodes/?limit=10&offset=${(page - 1) * 10}`);
          this.cartCodes = response.data.results;
          this.cache[page] = response.data.results;
          this.totalPages = Math.ceil(response.data.count / 10);
          this.currentPage = page;

          if (page < this.totalPages && !this.cache[page + 1]) {
            this.preloadCartCodes(page + 1);
          }
        }
      } catch (error) {
        if (error.response && error.response.status === 401) {
          this.$router.push('/401');
        } else {
          console.error('Error al obtener los códigos de carrito:', error);
        }
      } finally {
        this.loading = false;
      }
    },
    async goToPage(page) {
      this.fetchCartCodes(page);
    },
    async preloadCartCodes(page) {
      try {
        const preloadResponse = await axios.get(`/api/cartcodes/?limit=10&offset=${(page - 1) * 10}`);
        this.cache[page] = preloadResponse.data.results;
      } catch (error) {
        console.error('Error al precargar los códigos de carrito:', error);
      }
    },
    editCartCode(codeId) {
      this.$router.push(`/cartcodes/${codeId}/edit`);
    },
    createCartCode() {
      this.$router.push('/cartcodes/create');
    },
    showDeleteModal(code) {
      this.showModal = true;
      this.deleteId = code.id;
    },
    closeDeleteModal() {
      this.showModal = false;
    },
    handleDeleteConfirmation({ type }) {
      axios.delete(`/api/${type}/${this.deleteId}/`)
        .then(response => {
          if (response.status === 204) {
            console.log(`Código de carrito con ID ${this.deleteId} eliminado exitosamente.`);
            window.location.reload();
            this.$router.push({ path: '/cartcodes', query: { success: 'Código de carrito eliminado' } });
          } else {
            console.error('Error al eliminar el código de carrito:', response);
            this.$router.push({ path: '/cartcodes', query: { error: 'Error al intentar eliminar el código de carrito' } });
          }
        })
        .catch(error => {
          console.error('Error al eliminar el código de carrito:', error);
          this.$router.push({ path: '/cartcodes', query: { error: 'Error al intentar eliminar el código de carrito' } });
        })
        .finally(() => {
          this.showModal = false;
        });
    },
    redirectToCartCode(codeId) {
      this.$router.push(`/cartcodes/${codeId}`);
    },
  },
};
</script>

<style scoped>
.code {
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 10px;
  margin-bottom: 10px;
  max-width: 100%;
  word-wrap: break-word;
  cursor: pointer;
}

.code:hover {
  background-color: #eeeeee;
  transition: background-color 0.2s;
}

.expiration {
  font-style: italic;
}

.pagination {
  margin-top: 10px;
  margin-bottom: 30px;
}

.pagination button {
  margin-right: 5px;
  cursor: pointer;
}

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