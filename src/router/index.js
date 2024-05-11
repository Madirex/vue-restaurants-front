import { createRouter, createWebHistory } from 'vue-router';
import SignUp from '../components/SignUp.vue';
import Home from '../components/Home.vue';
import Login from '../components/Login.vue';
import Categories from '../components/Categories.vue';
import Unauthorized from '@/components/Unauthorized.vue';
import CategoryDetails from '@/components/CategoryDetails.vue';
import CategoryCreateEdit from '@/components/CategoryCreateEdit.vue';

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
        path: '/401',
        name: 'Unauthorized',
        component: Unauthorized,
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