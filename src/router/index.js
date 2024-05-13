import Unauthorized from '@/components/Unauthorized.vue';
import CartCodeCreateEdit from '@/components/cartcodes/CartCodeCreateEdit.vue';
import CartCodeDetails from '@/components/cartcodes/CartCodeDetails.vue';
import CategoryCreateEdit from '@/components/categories/CategoryCreateEdit.vue';
import CategoryDetails from '@/components/categories/CategoryDetails.vue';
import DishCreateEdit from '@/components/dishes/DishCreateEdit.vue';
import RestaurantCreateEdit from '@/components/restaurants/RestaurantCreateEdit.vue';
import RestaurantDetails from '@/components/restaurants/RestaurantDetails.vue';
import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Login from '../components/Login.vue';
import SignUp from '../components/SignUp.vue';
import CartCodes from '../components/cartcodes/CartCodes.vue';
import Categories from '../components/categories/Categories.vue';
import Restaurants from '../components/restaurants/Restaurants.vue';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home,
    },
    {
        path: '/signup',
        name: 'SignUp',
        component: SignUp,
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
    },
    {
        path: '/401',
        name: 'Unauthorized',
        component: Unauthorized,
    },

    /* categories */
    {
        path: '/categories',
        name: 'Categories',
        component: Categories,
    },
    {
        path: '/categories/:id',
        name: 'CategoryDetails',
        component: CategoryDetails,
    },
    {
        path: '/categories/create',
        name: 'CategoryCreate',
        component: CategoryCreateEdit,
        props: {
            mode: 'create'
        }
    },
    {
        path: '/categories/:id/edit',
        name: 'CategoryEdit',
        component: CategoryCreateEdit,
        props: route => ({ mode: 'edit', categoryId: route.params.id })
    },
    /* restaurants */
    {
        path: '/restaurants',
        name: 'Restaurants',
        component: Restaurants,
    },
    {
        path: '/restaurants/:id',
        name: 'RestaurantDetails',
        component: RestaurantDetails,
    },
    {
        path: '/restaurants/create',
        name: 'RestaurantCreate',
        component: RestaurantCreateEdit,
        props: {
            mode: 'create'
        }
    },
    {
        path: '/restaurants/:id/edit',
        name: 'RestaurantEdit',
        component: RestaurantCreateEdit,
        props: route => ({ mode: 'edit', restaurantId: route.params.id })
    },
    /* cartcodes */
    {
        path: '/cartcodes',
        name: 'CartCodes',
        component: CartCodes,
    },
    {
        path: '/cartcodes/:id',
        name: 'CartCodeDetails',
        component: CartCodeDetails,
    },
    {
        path: '/cartcodes/create',
        name: 'CartCodeCreate',
        component: CartCodeCreateEdit,
        props: {
            mode: 'create'
        }
    },
    {
        path: '/cartcodes/:id/edit',
        name: 'CartCodeEdit',
        component: CartCodeCreateEdit,
        props: route => ({ mode: 'edit', cartCodeId: route.params.id })
    },
    /* dishes */
    {
        path: '/restaurant/:restaurantId/dish/create',
        name: 'DishCreate',
        component: DishCreateEdit,
        props: true
    },
    {
        path: '/restaurants/:restaurantId/dishes/:id/edit',
        name: 'DishEdit',
        component: DishCreateEdit,
        props: route => ({ mode: 'edit', dishId: route.params.id, restaurantId: route.params.restaurantId })
    },

];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

router.beforeEach((to, from, next) => {
    const isAuthenticated = localStorage.getItem('authToken') !== null;
    const isAdmin = localStorage.getItem('isAdmin') === 'true';

    if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: 'Login' });
    } else if (to.name === 'CategoryCreate' || to.name === 'CategoryEdit') {
        if (!isAdmin) {
            next({ name: 'Unauthorized' });
        } else {
            next();
        }
    } else {
        next();
    }
});


export default router;