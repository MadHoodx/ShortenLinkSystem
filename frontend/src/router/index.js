import { createRouter, createWebHistory } from 'vue-router';
import Shortener from '../components/Shortener.vue';
import Statistics from '../components/Statistics.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Shortener
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: Statistics
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
