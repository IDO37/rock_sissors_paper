<template>
  <div class="landing-page">
    <div class="hero-section">
      <h1 class="title">가위바위보 게임</h1>
      <p class="subtitle">컴퓨터와 대결하고 리더보드에 도전하세요!</p>
      
      <div class="game-preview">
        <div class="hand-animation">
          <div class="hand rock">✊</div>
          <div class="hand scissors">✌️</div>
          <div class="hand paper">✋</div>
        </div>
      </div>
    </div>

    <div class="auth-section">
      <div class="auth-tabs">
        <button 
          :class="['tab-btn', { active: activeTab === 'login' }]"
          @click="activeTab = 'login'"
        >
          로그인
        </button>
        <button 
          :class="['tab-btn', { active: activeTab === 'signup' }]"
          @click="activeTab = 'signup'"
        >
          회원가입
        </button>
      </div>

      <!-- 로그인 폼 -->
      <form v-if="activeTab === 'login'" @submit.prevent="handleLogin" class="auth-form">
        <div class="form-group">
          <label for="login-email">이메일</label>
          <input 
            id="login-email"
            v-model="loginForm.email"
            type="email" 
            required
            placeholder="이메일을 입력하세요"
          >
        </div>
        <div class="form-group">
          <label for="login-password">비밀번호</label>
          <input 
            id="login-password"
            v-model="loginForm.password"
            type="password" 
            required
            placeholder="비밀번호를 입력하세요"
          >
        </div>
        <button type="submit" :disabled="authStore.loading" class="submit-btn">
          {{ authStore.loading ? '로그인 중...' : '로그인' }}
        </button>
        <p v-if="loginError" class="error-message">{{ loginError }}</p>
      </form>

      <!-- 회원가입 폼 -->
      <form v-if="activeTab === 'signup'" @submit.prevent="handleSignup" class="auth-form">
        <div class="form-group">
          <label for="signup-username">사용자명</label>
          <input 
            id="signup-username"
            v-model="signupForm.username"
            type="text" 
            required
            placeholder="사용자명을 입력하세요"
          >
        </div>
        <div class="form-group">
          <label for="signup-email">이메일</label>
          <input 
            id="signup-email"
            v-model="signupForm.email"
            type="email" 
            required
            placeholder="이메일을 입력하세요"
          >
        </div>
        <div class="form-group">
          <label for="signup-password">비밀번호</label>
          <input 
            id="signup-password"
            v-model="signupForm.password"
            type="password" 
            required
            placeholder="비밀번호를 입력하세요"
            minlength="6"
          >
        </div>
        <button type="submit" :disabled="authStore.loading" class="submit-btn">
          {{ authStore.loading ? '회원가입 중...' : '회원가입' }}
        </button>
        <p v-if="signupError" class="error-message">{{ signupError }}</p>
      </form>
    </div>

    <div class="features">
      <div class="feature">
        <h3>🎮 재미있는 게임</h3>
        <p>애니메이션이 있는 가위바위보 게임</p>
      </div>
      <div class="feature">
        <h3>🏆 리더보드</h3>
        <p>다른 플레이어들과 승률 비교</p>
      </div>
      <div class="feature">
        <h3>📊 게임 기록</h3>
        <p>개인 게임 기록 저장 및 확인</p>
      </div>
    </div>

    <router-link to="/leaderboard" class="leaderboard-link">
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
.landing-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  color: white;
}

.hero-section {
  text-align: center;
  margin-bottom: 3rem;
}

.title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.game-preview {
  margin: 2rem 0;
}

.hand-animation {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.hand {
  font-size: 4rem;
  animation: bounce 2s infinite;
}

.hand:nth-child(2) {
  animation-delay: 0.3s;
}

.hand:nth-child(3) {
  animation-delay: 0.6s;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-20px);
  }
  60% {
    transform: translateY(-10px);
  }
}

.auth-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  width: 100%;
  max-width: 400px;
  margin-bottom: 3rem;
}

.auth-tabs {
  display: flex;
  margin-bottom: 2rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 0.5rem;
}

.tab-btn {
  flex: 1;
  padding: 0.75rem;
  border: none;
  background: transparent;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: rgba(255, 255, 255, 0.2);
  font-weight: bold;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: bold;
  font-size: 0.9rem;
}

.form-group input {
  padding: 0.75rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
}

.submit-btn {
  padding: 1rem;
  border: none;
  border-radius: 8px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.error-message {
  color: #ff6b6b;
  font-size: 0.9rem;
  text-align: center;
  margin-top: 0.5rem;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
  width: 100%;
  max-width: 800px;
}

.feature {
  text-align: center;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  backdrop-filter: blur(10px);
}

.feature h3 {
  margin-bottom: 0.5rem;
  font-size: 1.2rem;
}

.leaderboard-link {
  color: white;
  text-decoration: none;
  font-size: 1.1rem;
  font-weight: bold;
  padding: 1rem 2rem;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 25px;
  transition: all 0.3s ease;
}

.leaderboard-link:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .title {
    font-size: 2.5rem;
  }
  
  .hand {
    font-size: 3rem;
  }
  
  .features {
    grid-template-columns: 1fr;
  }
}
</style> 