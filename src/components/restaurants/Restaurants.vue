<template>
    <div class="container mt-4">
        <h2>Restaurantes</h2>

        <button v-if="isAdmin" type="button" class="btn btn-success mb-3" @click="createRestaurant">Crear
            restaurante</button>

        <div v-for="restaurant in restaurants" :key="restaurant.pk" class="restaurant"
            @click="redirectToRestaurant(restaurant.pk)">
            <div>{{ restaurant.name }}</div>
            <div v-if="restaurant.address" class="address">
                <span v-if="restaurant.address.street">{{ restaurant.address.street }}</span>
                <span v-if="restaurant.address.number">, {{ restaurant.address.number }}</span>
                <span v-if="restaurant.address.city">, {{ restaurant.address.city }}</span>
                <span v-if="restaurant.address.province">, {{ restaurant.address.province }}</span>
                <span v-if="restaurant.address.country">, {{ restaurant.address.country }}</span>
                <span v-if="restaurant.address.postal_code"> - {{ restaurant.address.postal_code }}</span>
            </div>

            <!-- Botones de eliminar y editar -->
            <div class="buttons-container" v-if="isAdmin">
                <button type="button" class="btn btn-danger m-2 btn-sm" @click.stop="showDeleteModal(restaurant)">
                    <i class="fas fa-trash-alt"></i>
                </button>
                <button type="button" class="btn btn-primary m-2 btn-sm" @click.stop="editRestaurant(restaurant.pk)">
                    <i class="fas fa-edit"></i>
                </button>
            </div>
        </div>

        <!-- Modal de confirmación de eliminación -->
        <!-- Componente del modal de confirmación de eliminación -->
        <ConfirmDelete v-if="showModal" :type="'restaurants'" @cancel="closeDeleteModal"
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
            restaurants: [],
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
        this.fetchRestaurants();
    },
    methods: {
        async fetchRestaurants(page = 1) {
            try {
                if (this.cache[page]) {
                    this.restaurants = this.cache[page];
                    this.currentPage = page;
                } else {
                    this.loadingSpinnerEnable = false;
                    setTimeout(() => {
                        this.loadingSpinnerEnable = true;
                    }, 1000);
                    this.loading = true;
                    const response = await axios.get(`/api/restaurants/?limit=10&offset=${(page - 1) * 10}`);
                    this.restaurants = response.data.results;
                    this.cache[page] = response.data.results;
                    this.totalPages = Math.ceil(response.data.count / 10);
                    this.currentPage = page;

                    if (page < this.totalPages && !this.cache[page + 1]) {
                        this.preloadRestaurants(page + 1);
                    }
                }
            } catch (error) {
                if (error.response && error.response.status === 401) {
                    this.$router.push('/401');
                } else {
                    console.error('Error al obtener los restaurantes:', error);
                }
            } finally {
                this.loading = false;
            }
        },
        async goToPage(page) {
            this.fetchRestaurants(page);
        },
        async preloadRestaurants(page) {
            try {
                const preloadTimeout = 4000;
                const preloadResponse = await axios.get(`/api/restaurants/?limit=10&offset=${(page - 1) * 10}`);
                this.cache[page] = preloadResponse.data.results;
            } catch (error) {
                console.error('Error al precargar los restaurantes:', error);
            }
        },
        redirectToRestaurant(restaurantId) {
            this.$router.push(`/restaurants/${restaurantId}`);
        },
        editRestaurant(restaurantId) {
            this.$router.push(`/restaurants/${restaurantId}/edit`);
        },
        showDeleteModal(restaurant) {
            this.showModal = true;
            this.deleteId = restaurant.pk;
        },
        closeDeleteModal() {
            this.showModal = false;
        },
        handleDeleteConfirmation({ type }) {
            axios.delete(`/api/${type}/${this.deleteId}/`)
                .then(response => {
                    if (response.status === 204) {
                        console.log(`Restaurante con ID ${this.deleteId} eliminado exitosamente.`);
                        window.location.reload();
                        this.$router.push({ path: '/restaurants', query: { success: 'Restaurante eliminado' } });
                    } else {
                        console.error('Error al eliminar el restaurante:', response);
                        this.$router.push({ path: '/restaurants', query: { error: 'Error al intentar eliminar el restaurante' } });
                    }
                })
                .catch(error => {
                    console.error('Error al eliminar el restaurante:', error);
                    this.$router.push({ path: '/restaurants', query: { error: 'Error al intentar eliminar el restaurante' } });
                })
                .finally(() => {
                    this.showModal = false;
                });
        },
        createRestaurant() {
            this.$router.push('/restaurants/create');
        },
    },
};
</script>

<style scoped>
.restaurant {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 10px;
    margin-bottom: 10px;
    max-width: 100%;
    word-wrap: break-word;
    cursor: pointer;
}

.restaurant:hover {
    background-color: #eeeeee;
    transition: background-color 0.2s;
}

.address {
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