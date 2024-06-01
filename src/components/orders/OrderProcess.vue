<template>
    <div id="toast-container"></div>
    <div class="container mt-4 order-process">
        <div class="steps">
            <div v-for="(step, index) in steps" :key="index" :class="{ 'active': currentStep === index }"
                @click="goToStep(index)">
                {{ step }}
            </div>
        </div>
        <div v-if="currentStep === 0">
            <!-- Primera fase: Calendario -->
            <h2 class="title">Selecciona el día y hora de tu reserva</h2>
            <div v-if="loadingSchedules && !waitingLoadingDelay" class="loading-overlay">
                <div class="spinner-border text-light" role="status">
                    <span class="sr-only">Loading...</span>
                </div>
            </div>
            <div v-if="selectedRanges.length === 0">
                <vue-cal :events="schedules" class="vuecal" @view-change="handleViewChange">
                    <template #event="{ event }">
                        <div :style="{ backgroundColor: event.class === 'schedule-open' ? '#82bc82' : 'red', color: 'white', fontSize: 'smaller' }"
                            class="clickable" @click="handleEventClick(event)">{{ event.title }}</div>
                    </template>
                    <template #events-count="{ events }">
                        <span :style="{ fontWeight: 'bold' }">{{ events.length }}</span>
                    </template>
                    <template #cell="{ event }">
                    </template>
                </vue-cal>
            </div>
            <div v-else>
                <div class="selected-ranges">
                    <div v-for="range in selectedRanges" :key="range.start" class="range">
                        <p>{{ range.start.toLocaleString() }} - {{ range.end.toLocaleString() }}</p>
                    </div>
                </div>
                <button type="button" class="btn btn-primary" @click="resetRanges">Cambiar hora</button>
            </div>
        </div>
        <RestaurantMap v-if="showTableMap" v-show="currentStep === 1" :restaurant="restaurant"
            :selectedRanges="selectedRanges" @slot-clicked="handleSlotClicked" />
        <div v-if="currentStep === 1">
            <!-- Segunda fase: Plano del Restaurante -->
            <p>Selecciona las mesas que deseas reservar</p>



            <div class="continue-button">
                <div v-if="selectedTables.length === 0" class="alert alert-info" role="alert">
                    No hay mesas seleccionadas</div>
                <button type="button" class="btn btn-primary" @click="goToStep(2)"
                    :disabled="selectedTables.length === 0">Continuar con la reserva</button>
            </div>

        </div>
        <div v-if="currentStep === 2">
            <!-- Tercera fase: Menú -->
            <h2 class="title">Selecciona el menú que quieres reservar</h2>
            <div class="dishes" :style="{ transform: `translateX(${translateValue}px)` }">
                <div v-for="dish in dishes" :key="dish.pk" class="dish">
                    <h3>{{ dish.name }}</h3>
                    <p>{{ dish.description }}</p>
                    <p>Precio: {{ dish.price }} €</p>
                    <p>Calorias: {{ dish.calories }}</p>
                    <p>Tiempo de preparación: {{ dish.preparation_time }} minutos</p>
                    <p>Categoría: {{ dish.category }}</p>
                    <p>Tipo de plato:
                        <span v-if="dish.dish_type === 'APPETIZER'">Aperitivo</span>
                        <span v-if="dish.dish_type === 'MAIN_COURSE'">Plato principal</span>
                        <span v-if="dish.dish_type === 'DESSERT'">Postre</span>
                        <span v-if="dish.dish_type === 'DRINK'">Bebida</span>
                        <span v-if="dish.dish_type === 'OTHER'">Otro</span>
                    </p>
                    <a class="dish-image">
                        <img v-if="dish.image" :src="'/api/' + dish.image" />
                    </a>
                    <div class="quantity-controls">
                        <button @click="decreaseQuantity(dish)" class="btn btn-secondary">-</button>
                        <input type="range" min="0" max="25" v-model="dish.quantity" @input="updateTotalPrice" />
                        <button @click="increaseQuantity(dish)" class="btn btn-secondary">+</button>
                    </div>
                    <p>Cantidad: {{ dish.quantity }}</p>
                    <div v-if="isAdmin" class="admin-panel">
                        <button type="button" class="btn btn-danger m-2">
                            <i class="fas fa-trash-alt"></i>
                        </button>
                        <router-link :to="{ name: 'DishEdit', params: { id: dish.pk, restaurantId: restaurant.pk } }"
                            class="btn btn-primary m-2">
                            <i class="fas fa-edit"></i>
                        </router-link>
                    </div>
                </div>
                <div v-if="dishes.length === 0" class="alert alert-info" role="alert">
                    No hay platos disponibles
                </div>
            </div>

            <div class="dish-summary">
                <h3>Resumen de Platos</h3>
                <ul>
                    <div v-for="dish in dishes" :key="dish.pk">
                        <li v-if="dish.quantity > 0">
                            {{ dish.name }} - {{ (dish.price * dish.quantity).toFixed(2) }} €
                        </li>
                    </div>
                </ul>
                <h4>Total: {{ totalPrice.toFixed(2) }} €</h4>
                <button type="button" class="btn btn-primary" :disabled="totalPrice === 0 || pushingOrder"
                    @click="placeOrder">Realizar
                    pedido</button>
                <!-- loading con icono de pizza si pushingOrder es true -->
                <div v-if="pushingOrder" class="spinner-border orange-spinner" role="status">
                    <span>🍕</span>
                </div>

            </div>
        </div>
    </div>
</template>

<script>
import RestaurantMap from '@/components/restaurants/RestaurantMap.vue';
import axios from 'axios';
import VueCal from 'vue-cal';
import 'vue-cal/dist/vuecal.css';

export default {
    props: {
        restaurantId: {
            type: String,
            required: true,
        },
    },
    components: {
        VueCal,
        RestaurantMap,
    },
    data() {
        return {
            currentStep: 0,
            steps: ['1', '2', '3'],
            schedules: [],
            loadingSchedules: false,
            waitingLoadingDelay: false,
            restaurant: null,
            dishes: [],
            translateValue: 0,
            isAdmin: localStorage.getItem('isAdmin') === 'true',
            startDate: new Date(),
            endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
            selectedRanges: [],
            selectedTables: [],
            showTableMap: true,
            totalPrice: 0,
            pushingOrder: false,
        };
    },
    methods: {
        formatDateToUTC(date) {
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            const hours = String(date.getHours()).padStart(2, '0');
            const minutes = String(date.getMinutes()).padStart(2, '0');
            const seconds = String(date.getSeconds()).padStart(2, '0');

            return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        },
        increaseQuantity(dish) {
            if (dish.quantity < 100) {
                dish.quantity++;
                this.updateTotalPrice();
            }
        },
        decreaseQuantity(dish) {
            if (dish.quantity > 0) {
                dish.quantity--;
                this.updateTotalPrice();
            }
        },
        updateTotalPrice() {
            this.totalPrice = this.dishes.reduce((total, dish) => total + dish.price * dish.quantity, 0);
        },
        async placeOrder() {
            const orderLines = this.dishes
                .filter(dish => dish.quantity > 0)
                .map(dish => ({ dish: dish.pk, quantity: dish.quantity }));

            const tableIds = this.selectedTables.map(table => table.id);
            const orderData = {
                restaurant: this.restaurant.pk,
                start_reserve: this.formatDateToUTC(this.selectedRanges[0].start),
                finish_reserve: this.formatDateToUTC(this.selectedRanges[0].end),
                tables: tableIds,
                assigned_chairs: this.selectedTables[0].chairs,
                order_lines: orderLines,
            };

            this.pushingOrder = true;
            try {
                const response = await axios.post('/api/users/order/', orderData);
                //ir a /orders/id con el pk de response.data.pk
                this.$router.push({ name: 'OrderDetails', params: { orderId: response.data.pk } });
            } catch (error) {
                console.error('Error realizando el pedido:', error);
                this.showToast('Error realizando el pedido');
            }
            this.pushingOrder = false;
        },
        handleSlotClicked(slot) {
            const tableIndex = this.selectedTables.findIndex(t => t.x === slot.x && t.y === slot.y);
            if (tableIndex === -1) {
                this.selectedTables.push({ x: slot.x, y: slot.y, id: slot.pk });
            } else {
                this.selectedTables.splice(tableIndex, 1);
            }
        },
        resetRanges() {
            this.selectedRanges = [];
            this.currentStep = 0;
        },
        showToast(message) {
            const toastContainer = document.getElementById('toast-container');
            const toast = document.createElement('div');
            toast.classList.add('toast');
            toast.textContent = message;
            toastContainer.appendChild(toast);
            setTimeout(() => {
                toast.classList.add('show');
                setTimeout(() => {
                    toast.classList.remove('show');
                    setTimeout(() => {
                        toast.remove();
                    }, 500);
                }, 3000);
            }, 100);
        },
        goToStep(index) {
            if (this.selectedRanges.length === 0) {
                this.currentStep = 0;
            } else if (this.selectedTables.length === 0 && index > 1) {
                this.currentStep = 1;
            } else {
                this.currentStep = index;
            }
        },
        handleEventClick(event) {
            if (event.class === 'event-clicked') {
                event.class = event.originalClass || '';
                const index = this.selectedRanges.findIndex(range => range.start === event.start && range.end === event.end);
                if (index !== -1) {
                    this.selectedRanges.splice(index, 1);
                }
            } else {
                let addToRanges = true;
                if (this.selectedRanges.length > 0) {
                    const firstRangeDate = this.selectedRanges[0].start;
                    const selectedEventDate = event.start;
                    if (
                        firstRangeDate.getFullYear() !== selectedEventDate.getFullYear() ||
                        firstRangeDate.getMonth() !== selectedEventDate.getMonth() ||
                        firstRangeDate.getDate() !== selectedEventDate.getDate()
                    ) {
                        addToRanges = false;
                    }
                }
                if (addToRanges) {
                    event.originalClass = event.class;
                    event.class = 'event-clicked';
                    const index = this.selectedRanges.findIndex(range => range.start === event.start && range.end === event.end);
                    if (index === -1) {
                        this.selectedRanges.push({ start: event.start, end: event.end });
                        this.currentStep = 1;
                        this.showTableMap = false;
                        //timeout
                        setTimeout(() => {
                            this.showTableMap = true;
                        }, 100);
                    }
                } else {
                    console.error('No puedes seleccionar eventos de diferentes días');
                    this.showToast('No puedes seleccionar eventos de diferentes días');
                }
            }
        },
        handleViewChange({ startDate, endDate }) {
            this.startDate = new Date(startDate);
            this.endDate = new Date(endDate);
            this.fetchSchedules();
        },
        async fetchRestaurantDetails() {
            try {
                const response = await axios.get(`/api/restaurants/${this.restaurantId}/`);
                this.restaurant = response.data;
            } catch (error) {
                console.error('Error fetching restaurant details:', error);
            }
        },
        async fetchDishes() {
            try {
                const response = await axios.get(`/api/restaurants/${this.restaurantId}/menu/`);
                this.dishes = response.data.map(dish => ({ ...dish, quantity: 0 }));
                this.updateTotalPrice();
            } catch (error) {
                console.error('Error fetching dishes:', error);
            }
        },
        async fetchSchedules() {
            if (!this.startDate || !this.endDate) {
                return;
            }
            this.loadingSchedules = true;
            this.waitingLoadingDelay = true;
            setTimeout(() => {
                if (this.waitingLoadingDelay) {
                    this.waitingLoadingDelay = false;
                }
            }, 1000);
            try {
                const response = await axios.get(`/api/restaurants/${this.restaurantId}/schedules/`, {
                    params: {
                        start_date: this.startDate.toISOString().split('T')[0],
                        end_date: this.endDate.toISOString().split('T')[0],
                    },
                });
                if (Array.isArray(response.data)) {
                    const now = new Date();
                    this.schedules = response.data.flatMap(schedule => {
                        return schedule.schedule
                            .map(time => {
                                const start = new Date(`${schedule.date}T${time}`);
                                const end = new Date(start.getTime() + 30 * 60000);
                                return {
                                    start,
                                    end,
                                    title: time,
                                    class: 'schedule-open',
                                };
                            })
                            .filter(({ start }) => start >= now); // Filtrar solo las fechas y horas futuras
                    });
                }
                else {
                    console.error('response.data is not an array:', response.data);
                }
            } catch (error) {
                console.error('Error fetching schedules:', error);
            } finally {
                this.loadingSchedules = false;
                this.waitingLoadingDelay = false;
            }
        },
    },
    async mounted() {
        window.scrollTo(0, 0);
        await this.fetchRestaurantDetails();
        await this.fetchDishes();
        await this.fetchSchedules();
    },
};
</script>

<style scoped>
.vuecal {
    background-color: #fff;
}

.clickable {
    cursor: pointer;
}

.order-process {
    padding: 20px;
}

.steps {
    display: flex;
    justify-content: space-around;
    margin-bottom: 20px;
}

.steps div {
    padding: 10px;
    cursor: pointer;
    border: 1px solid #ddd;
    border-radius: 50%;
    text-align: center;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.steps div.active {
    background-color: #007bff;
    color: white;
}

.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
}

.dishes {
    display: flex;
    flex-wrap: wrap;
}

.dish {
    border: 1px solid #ddd;
    padding: 10px;
    margin: 10px;
    flex: 1 1 calc(33.333% - 20px);
    box-sizing: border-box;
    text-align: center;
    background-color: #e3e3e3;
}

.dish-image {
    display: block;
    text-align: center;
}

.dish-image img {
    max-width: 200px;
}

.admin-panel {
    display: flex;
    justify-content: space-between;
}

#toast-container {
    position: fixed;
    top: 20px;
    right: 20px;
    z-index: 9999;
    background-color: #ff4d4d;
    opacity: 0.8;
}

.quantity-controls {
    display: inline-flex;
    margin-top: 20px;
    align-items: center;
    gap: 10px;
}

.quantity-controls input[type="range"] {
    flex: 1;
}

.dish-summary {
    display: block;
    margin: auto;
    width: fit-content;
}
</style>