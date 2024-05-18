<template>
    <div class="closed-days-container">
        <h3>Días Cerrados</h3>

        <!-- Alertas de Bootstrap -->
        <div v-if="alert.message" :class="['alert', alert.type]" role="alert">
            {{ alert.message }}
        </div>

        <div v-if="loadingSpinnerEnable" class="loading-indicator">
            <div v-if="startTimeEnableSpinner" class="spinner-border orange-spinner" role="status">
                <span>🍕</span>
            </div>
        </div>
        <div v-else-if="!errorFetchingClosedDays">
            <!-- Tabla de días cerrados -->
            <table class="table table-striped">
                <thead>
                    <tr>
                        <th>Fecha</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="day in closedDays" :key="day">
                        <td>{{ day }}</td>
                        <td>
                            <button class="btn btn-danger" @click="confirmDelete(day)" :disabled="loading">
                                <i class="fas fa-trash-alt"></i> Eliminar
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>

            <!-- Selector de fecha y botón para agregar -->
            <div class="add-closed-day mt-4">
                <input type="date" v-model="newClosedDay" class="form-control" :disabled="loading" />
                <button class="btn btn-primary mt-2" @click="addClosedDay" :disabled="loading">
                    <i class="fas fa-plus"></i> Agregar día cerrado
                    <span v-if="loadingAdd" class="spinner-border spinner-border-sm" role="status">
                        <span></span>
                    </span>
                </button>
            </div>
        </div>

        <!-- Modal de confirmación -->
        <ConfirmDelete v-if="showModal" :type="'days'" :id="selectedDay" @cancel="closeDeleteModal"
            @confirm="deleteClosedDay" />
    </div>
</template>

<script>
import ConfirmDelete from '@/components/ConfirmDelete.vue';
import axios from 'axios';

export default {
    components: {
        ConfirmDelete,
    },
    props: {
        restaurantId: {
            type: Number,
            required: true
        }
    },
    data() {
        return {
            closedDays: [],
            newClosedDay: '',
            showModal: false,
            selectedDay: null,
            errorFetchingClosedDays: false,
            alert: {
                message: '',
                type: '',
            },
            loadingSpinnerEnable: true,
            startTimeEnableSpinner: false,
            loading: false,
            loadingAdd: false,
        };
    },
    created() {
        this.fetchClosedDays();
    },
    methods: {
        async fetchClosedDays() {
            this.loadingSpinnerEnable = true;
            setTimeout(() => {
                this.startTimeEnableSpinner = true;
            }, 1000);
            try {
                const response = await axios.get(`/api/calendars/${this.restaurantId}/`);
                this.closedDays = response.data.closed_days || [];
            } catch (error) {
                console.error('Error fetching closed days:', error);
                this.errorFetchingClosedDays = true;
                this.alert.type = 'alert-danger';
                this.alert.message = 'Error al obtener los días cerrados';
            } finally {
                this.loadingSpinnerEnable = false;
            }
        },
        async addClosedDay() {
            if (!this.newClosedDay) return;
            this.loading = true;
            this.loadingAdd = true;
            try {
                await axios.post(`/api/calendars/${this.restaurantId}/add-closed-day/`, { closed_day: this.newClosedDay });
                this.closedDays.push(this.newClosedDay);
                this.newClosedDay = '';
                this.alert.type = 'alert-success';
                this.alert.message = 'Día cerrado agregado exitosamente';
            } catch (error) {
                console.error('Error saving closed day:', error);
                this.alert.type = 'alert-danger';
                this.alert.message = error.response.data.detail;
            } finally {
                this.loading = false;
                this.loadingAdd = false;
            }
        },
        confirmDelete(day) {
            this.selectedDay = day;
            this.showModal = true;
        },
        closeDeleteModal() {
            this.showModal = false;
            this.selectedDay = null;
        },
        async deleteClosedDay() {
            this.loading = true;
            try {
                await axios.delete(`/api/calendars/${this.restaurantId}/remove-closed-day/`, { data: { closed_day: this.selectedDay } });
                this.closedDays = this.closedDays.filter(day => day !== this.selectedDay);
                this.closeDeleteModal();
                this.alert.type = 'alert-success';
                this.alert.message = 'Día cerrado eliminado exitosamente';
            } catch (error) {
                console.error('Error deleting closed day:', error);
                this.alert.type = 'alert-danger';
                this.alert.message = error.response.data.detail;
            } finally {
                this.loading = false;
            }
        },
    },
};
</script>

<style scoped>
.closed-days-container {
    margin: 20px;
}

.add-closed-day {
    display: flex;
    flex-direction: column;
    max-width: 300px;
}
</style>
