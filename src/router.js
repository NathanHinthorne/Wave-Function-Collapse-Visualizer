import { createRouter, createWebHistory } from 'vue-router';

const routes = [
    {
        path: '/',
        name: 'Home',
        component: () => import('./views/HomePage.vue')
    },
    // {
    //     path: '/algorithm',
    //     name: 'Algorithm',
    //     component: () => import('./views/AlgorithmPage.vue')
    // },
    // {
    //     path: '/examples',
    //     name: 'Examples',
    //     component: () => import('./views/ExamplesPage.vue')
    // },
    // {
    //     path: '/about',
    //     name: 'About',
    //     component: () => import('./views/AboutPage.vue')
    // }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;