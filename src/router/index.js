import { createRouter, createWebHistory } from 'vue-router';
import SignUp from '../components/SignUp.vue';
import Home from '../components/Home.vue';
import Login from '../components/Login.vue';
import Categories from '../components/categories/Categories.vue';
import Restaurants from '../components/restaurants/Restaurants.vue';
import Unauthorized from '@/components/Unauthorized.vue';
import CategoryDetails from '@/components/categories/CategoryDetails.vue';
import RestaurantDetails from '@/components/restaurants/RestaurantDetails.vue';
import CategoryCreateEdit from '@/components/categories/CategoryCreateEdit.vue';
import RestaurantCreateEdit from '@/components/restaurants/RestaurantCreateEdit.vue';

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
        path: '/categories',
        name: 'Categories',
        component: Categories,
    },
    {
        path: '/restaurants',
        name: 'Restaurants',
        component: Restaurants,
    },
    {
        path: '/401',
        name: 'Unauthorized',
        component: Unauthorized,
    },
    
    /* Details */
    {
        path: '/categories/:id',
        name: 'CategoryDetails',
        component: CategoryDetails,
    },
    {
        path: '/restaurants/:id',
        name: 'RestaurantDetails',
        component: RestaurantDetails,
    },
    /* Create Edit */
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