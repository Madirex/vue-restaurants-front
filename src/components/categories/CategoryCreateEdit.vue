<template>
    <div class="container mt-4">
        <h2>{{ mode === 'create' ? 'Crear' : 'Editar' }} Categoría</h2>

        <div class="alert" :class="[alert.type, { 'd-none': !alert.message }]">
            {{ alert.message }}
        </div>

        <form @submit.prevent="handleSubmit">
            <div class="form-group mb-4">
                <label for="name">Nombre:</label>
                <input type="text" v-model="categoryName" class="form-control" id="name" required>
            </div>
            <button type="submit" class="btn btn-primary">{{ mode === 'create' ? 'Crear' : 'Guardar' }}</button>
        </form>
    </div>
</template>

<script>
import axios from 'axios';

export default {
    data() {
        return {
            mode: 'create',
            categoryId: null,
            categoryName: '',
            alert: {
                message: '',
                type: '',
            },
        };
    },
    created() {
        // Verificar si se está editando una categoría existente
        const categoryId = this.$route.params.id;
        if (categoryId) {
            this.mode = 'edit';
            this.categoryId = categoryId;
            this.fetchCategoryDetails();
        }
    },
    methods: {
        async fetchCategoryDetails() {
            try {
                const response = await axios.get(`/api/categories/${this.categoryId}/`);
                this.categoryName = response.data.name;
            } catch (error) {
                console.error('Error al obtener los detalles de la categoría:', error);
            }
        },
        async handleSubmit() {
            try {
                const data = { name: this.categoryName };
                if (this.mode === 'create') {
                    await axios.post('/api/categories/', data);
                    this.$router.push({ path: '/categories', query: { success: 'Categoría creada exitosamente' } });
                } else if (this.mode === 'edit') {
                    await axios.put(`/api/categories/${this.categoryId}/`, data);
                    this.$router.push({ path: '/categories', query: { success: 'Categoría editada exitosamente' } });
                }
            } catch (error) {
                console.error('Error al guardar la categoría:', error.response.data);
                const errors = error.response.data;
                let errorMessage = 'Error al guardar la categoría.';
                for (const key in errors) {
                    if (Array.isArray(errors[key])) {
                        errors[key].forEach((errorMsg) => {
                            errorMessage += `\n${key}: ${errorMsg}`;
                        });
                    } else {
                        errorMessage += `\n${key}: ${errors[key]}`;
                    }
                }
                this.alert.message = errorMessage;
                this.alert.type = 'alert-danger';
            }
        },
    },
};
</script>