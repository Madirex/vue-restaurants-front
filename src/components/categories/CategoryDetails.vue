<template>
    <div class="container mt-4">
        <div v-if="category">
            <h2 class="title">{{ category.name.charAt(0).toUpperCase() + category.name.slice(1) }}</h2>

            <!-- panel solo si es admin -->
            <div v-if="isAdmin">
                <!-- Botón de eliminación -->
                <button type="button" class="btn btn-danger m-2" @click="showDeleteModal">
                    <i class="fas fa-trash-alt"></i> Eliminar
                </button>

                <!-- Botón de editar -->
                <router-link :to="{ name: 'CategoryEdit', params: { id: category.id } }" class="btn btn-primary m-2">
                    <i class="fas fa-edit"></i> Editar
                </router-link>
            </div>

            <!-- Componente del modal de confirmación de eliminación -->
            <ConfirmDelete v-if="showModal" :type="'categories'" :id="this.$route.params.id" @cancel="closeDeleteModal"
                @confirm="handleDeleteConfirmation" />
        </div>
        <div v-else>
            <div v-if="loadingSpinnerEnable" class="loading-indicator">
                <div class="spinner-border orange-spinner" role="status">
                    <span>🍕</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import axios from 'axios';
import ConfirmDelete from '@/components/ConfirmDelete.vue';

export default {
    components: {
        ConfirmDelete,
    },
    data() {
        return {
            category: null,
            loadingSpinnerEnable: false,
            showModal: false,
            isAdmin: localStorage.getItem('isAdmin') === 'true',
            alert: {
                message: '',
                type: '',
            },
        };
    },
    created() {
        setTimeout(() => {
            this.loadingSpinnerEnable = true;
        }, 1000);
        this.fetchCategoryDetails();
    },
    methods: {
        async fetchCategoryDetails() {
            try {
                const id = this.$route.params.id;
                const res = await axios.get(`/api/categories/${id}/`);
                this.category = res.data;
            } catch (error) {
                this.loadingSpinnerEnable = false;
                this.$router.push({ path: '/categories', query: { error: 'Categoría no encontrada' } });
                console.error('Error al obtener los detalles de la categoría:', error);
            }
        },
        showDeleteModal() {
            this.showModal = true;
        },
        closeDeleteModal() {
            this.showModal = false;
        },
        handleDeleteConfirmation({ type, id }) {
            axios.delete(`/api/${type}/${id}/`)
                .then(response => {
                    if (response.status === 204) {
                        console.log(`Categoría con ID ${id} eliminada exitosamente.`);
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
    },
};
</script>

<style scoped>
.category-details {
    margin-top: 20px;
}
</style>
