import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/',
    name: 'Landing',
    component: () => import('../views/LandingPage.vue')
  },
  {
    path: '/game',
    name: 'Game',
    component: () => import('../views/GamePage.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/leaderboard',
    name: 'Leaderboard',
    component: () => import('../views/LeaderboardPage.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 인증이 필요한 페이지 보호
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.user) {
    next('/')
  } else {
    next()
  }
})

export default router 