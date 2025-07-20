import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import './style.css'
import { testSupabaseConnection } from './lib/supabase'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Supabase 연결 테스트
testSupabaseConnection().then(success => {
  if (!success) {
    console.warn('Supabase 연결에 실패했습니다. 환경 변수를 확인해주세요.')
  }
})

app.mount('#app')
