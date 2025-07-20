<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex flex-col items-center p-8 text-white">
    <div class="text-center mb-12">
      <h1 class="text-5xl md:text-6xl font-bold mb-4 text-shadow-lg">가위바위보 게임</h1>
      <p class="text-xl mb-8 opacity-90">컴퓨터와 대결하고 리더보드에 도전하세요!</p>
      
      <div class="my-8">
        <div class="flex justify-center gap-8">
          <div class="text-6xl md:text-7xl animate-bounce">✊</div>
          <div class="text-6xl md:text-7xl animate-bounce" style="animation-delay: 0.3s">✌️</div>
          <div class="text-6xl md:text-7xl animate-bounce" style="animation-delay: 0.6s">✋</div>
        </div>
      </div>
    </div>

    <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8 w-full max-w-md mb-12">
      <div class="flex mb-8 bg-white/10 rounded-xl p-1">
        <button 
          :class="['flex-1 py-3 px-4 rounded-lg transition-all duration-300', 
                   activeTab === 'login' ? 'bg-white/20 font-bold' : 'text-white']"
          @click="activeTab = 'login'"
        >
          로그인
        </button>
        <button 
          :class="['flex-1 py-3 px-4 rounded-lg transition-all duration-300', 
                   activeTab === 'signup' ? 'bg-white/20 font-bold' : 'text-white']"
          @click="activeTab = 'signup'"
        >
          회원가입
        </button>
      </div>

      <!-- 로그인 폼 -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="space-y-4">
        <div class="space-y-2">
          <label for="login-email" class="font-bold text-sm">이메일</label>
          <input 
            id="login-email"
            v-model="loginForm.email"
            type="email" 
            required
            placeholder="이메일을 입력하세요"
            class="w-full py-3 px-4 border-none rounded-lg bg-white/90 text-gray-800 text-base"
          >
        </div>
        <div class="space-y-2">
          <label for="login-password" class="font-bold text-sm">비밀번호</label>
          <input 
            id="login-password"
            v-model="loginForm.password"
            type="password" 
            required
            placeholder="비밀번호를 입력하세요"
            class="w-full py-3 px-4 border-none rounded-lg bg-white/90 text-gray-800 text-base"
          >
        </div>
        <button 
          type="submit" 
          :disabled="authStore.loading" 
          class="w-full py-4 mt-4 border-none rounded-lg bg-gradient-to-r from-red-400 to-orange-500 text-white text-base font-bold cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {{ authStore.loading ? '로그인 중...' : '로그인' }}
        </button>
        <p v-if="loginError" class="text-red-400 text-sm text-center mt-2">{{ loginError }}</p>
      </form>

      <!-- 회원가입 폼 -->
      <form v-if="activeTab === 'signup'" @submit.prevent="handleSignup" class="space-y-4">
        <div class="space-y-2">
          <label for="signup-username" class="font-bold text-sm">사용자명</label>
          <input 
            id="signup-username"
            v-model="signupForm.username"
            type="text" 
            required
            placeholder="사용자명을 입력하세요"
            class="w-full py-3 px-4 border-none rounded-lg bg-white/90 text-gray-800 text-base"
          >
        </div>
        <div class="space-y-2">
          <label for="signup-email" class="font-bold text-sm">이메일</label>
          <input 
            id="signup-email"
            v-model="signupForm.email"
            type="email" 
            required
            placeholder="이메일을 입력하세요"
            class="w-full py-3 px-4 border-none rounded-lg bg-white/90 text-gray-800 text-base"
          >
        </div>
        <div class="space-y-2">
          <label for="signup-password" class="font-bold text-sm">비밀번호</label>
          <input 
            id="signup-password"
            v-model="signupForm.password"
            type="password" 
            required
            placeholder="비밀번호를 입력하세요"
            minlength="6"
            class="w-full py-3 px-4 border-none rounded-lg bg-white/90 text-gray-800 text-base"
          >
        </div>
        <button 
          type="submit" 
          :disabled="authStore.loading" 
          class="w-full py-4 mt-4 border-none rounded-lg bg-gradient-to-r from-red-400 to-orange-500 text-white text-base font-bold cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {{ authStore.loading ? '회원가입 중...' : '회원가입' }}
        </button>
        <p v-if="signupError" class="text-red-400 text-sm text-center mt-2">{{ signupError }}</p>
      </form>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 w-full max-w-4xl">
      <div class="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-lg">
        <h3 class="text-xl mb-2">🎮 재미있는 게임</h3>
        <p>애니메이션이 있는 가위바위보 게임</p>
      </div>
      <div class="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-lg">
        <h3 class="text-xl mb-2">🏆 리더보드</h3>
        <p>다른 플레이어들과 승률 비교</p>
      </div>
      <div class="text-center p-6 bg-white/10 rounded-2xl backdrop-blur-lg">
        <h3 class="text-xl mb-2">📊 게임 기록</h3>
        <p>개인 게임 기록 저장 및 확인</p>
      </div>
    </div>

    <router-link 
      to="/leaderboard" 
      class="text-white no-underline text-lg font-bold py-4 px-8 bg-white/20 rounded-full transition-all duration-300 hover:bg-white/30 hover:transform hover:-translate-y-1"
    >
      리더보드 보기 →
    </router-link>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const activeTab = ref('login')
const loginError = ref('')
const signupError = ref('')

const loginForm = reactive({
  email: '',
  password: ''
})

const signupForm = reactive({
  username: '',
  email: '',
  password: ''
})

const handleLogin = async () => {
  loginError.value = ''
  const result = await authStore.signIn(loginForm.email, loginForm.password)
  
  if (result.success) {
    router.push('/game')
  } else {
    loginError.value = result.error
  }
}

const handleSignup = async () => {
  signupError.value = ''
  const result = await authStore.signUp(signupForm.email, signupForm.password, signupForm.username)
  
  if (result.success) {
    router.push('/game')
  } else {
    signupError.value = result.error
  }
}
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}
</style> 