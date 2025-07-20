<template>
  <div class="game-page">
    <header class="game-header">
      <div class="user-info">
        <span class="username">{{ authStore.user?.user_metadata?.username || '플레이어' }}</span>
        <button @click="handleLogout" class="logout-btn">로그아웃</button>
      </div>
      <div class="score-board">
        <div class="score-item">
          <span class="score-label">승</span>
          <span class="score-value">{{ stats.wins }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">패</span>
          <span class="score-value">{{ stats.losses }}</span>
        </div>
        <div class="score-item">
          <span class="score-label">무승부</span>
          <span class="score-value">{{ stats.draws }}</span>
        </div>
      </div>
    </header>

    <main class="game-main">
      <div class="game-title">
        <h1>가위바위보 게임</h1>
        <p>컴퓨터와 대결하세요!</p>
      </div>

      <div class="game-area">
        <!-- 결과 표시 -->
        <div v-if="gameResult" class="result-display">
          <div class="result-message" :class="resultClass">
            {{ resultMessage }}
          </div>
          <div class="choices-display">
            <div class="choice player-choice">
              <div class="choice-label">당신</div>
              <div class="choice-emoji" :class="{ 'winner': gameResult === 'win' }">
                {{ getChoiceEmoji(playerChoice) }}
              </div>
            </div>
            <div class="vs">VS</div>
            <div class="choice computer-choice">
              <div class="choice-label">컴퓨터</div>
              <div class="choice-emoji" :class="{ 'winner': gameResult === 'lose' }">
                {{ getChoiceEmoji(computerChoice) }}
              </div>
            </div>
          </div>
        </div>

        <!-- 게임 선택 버튼 -->
        <div class="game-choices" v-if="!isPlaying">
          <h3>선택하세요:</h3>
          <div class="choice-buttons">
            <button 
              v-for="choice in choices" 
              :key="choice.value"
              @click="playGame(choice.value)"
              class="choice-btn"
              :disabled="isPlaying"
            >
              <span class="choice-emoji">{{ choice.emoji }}</span>
              <span class="choice-text">{{ choice.label }}</span>
            </button>
          </div>
        </div>

        <!-- 게임 진행 중 애니메이션 -->
        <div v-if="isPlaying" class="game-animation">
          <div class="shaking-hands">
            <div class="hand player-hand">✊</div>
            <div class="hand computer-hand">✊</div>
          </div>
          <p class="thinking-text">컴퓨터가 생각 중...</p>
        </div>
      </div>

      <!-- 다시하기 버튼 -->
      <div v-if="gameResult" class="game-actions">
        <button @click="resetGame" class="play-again-btn">
          다시하기
        </button>
        <router-link to="/leaderboard" class="leaderboard-btn">
          리더보드 보기
        </router-link>
      </div>
    </main>

    <!-- 게임 기록 -->
    <aside class="game-history">
      <h3>최근 게임 기록</h3>
      <div class="history-list">
        <div 
          v-for="(game, index) in gameStore.gameHistory.slice(0, 5)" 
          :key="index"
          class="history-item"
          :class="getHistoryItemClass(game.result)"
        >
          <div class="history-choices">
            <span>{{ getChoiceEmoji(game.player_choice) }}</span>
            <span class="vs-small">vs</span>
            <span>{{ getChoiceEmoji(game.computer_choice) }}</span>
          </div>
          <div class="history-result">
            {{ getResultText(game.result) }}
          </div>
        </div>
        <div v-if="gameStore.gameHistory.length === 0" class="no-history">
          아직 게임 기록이 없습니다.
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useGameStore } from '../stores/game'

const router = useRouter()
const authStore = useAuthStore()
const gameStore = useGameStore()

const isPlaying = ref(false)
const gameResult = ref(null)
const playerChoice = ref(null)
const computerChoice = ref(null)

const choices = [
  { value: 'rock', label: '바위', emoji: '✊' },
  { value: 'scissors', label: '가위', emoji: '✌️' },
  { value: 'paper', label: '보', emoji: '✋' }
]

const stats = reactive({
  wins: 0,
  losses: 0,
  draws: 0
})

const resultMessage = computed(() => {
  if (!gameResult.value) return ''
  const messages = {
    win: '🎉 승리!',
    lose: '😢 패배...',
    draw: '🤝 무승부!'
  }
  return messages[gameResult.value]
})

const resultClass = computed(() => {
  if (!gameResult.value) return ''
  return `result-${gameResult.value}`
})

onMounted(async () => {
  if (authStore.user) {
    await gameStore.fetchUserHistory(authStore.user.id)
    calculateStats()
  }
})

const calculateStats = () => {
  const history = gameStore.gameHistory
  stats.wins = history.filter(game => game.result === 'win').length
  stats.losses = history.filter(game => game.result === 'lose').length
  stats.draws = history.filter(game => game.result === 'draw').length
}

const getChoiceEmoji = (choice) => {
  const choiceMap = {
    rock: '✊',
    scissors: '✌️',
    paper: '✋'
  }
  return choiceMap[choice] || '✊'
}

const getResultText = (result) => {
  const resultMap = {
    win: '승',
    lose: '패',
    draw: '무'
  }
  return resultMap[result] || ''
}

const getHistoryItemClass = (result) => {
  return `history-${result}`
}

const playGame = async (choice) => {
  isPlaying.value = true
  playerChoice.value = choice
  
  // 컴퓨터 선택 애니메이션
  await new Promise(resolve => setTimeout(resolve, 2000))
  
  // 컴퓨터 랜덤 선택
  const computerChoices = ['rock', 'scissors', 'paper']
  computerChoice.value = computerChoices[Math.floor(Math.random() * 3)]
  
  // 게임 결과 계산
  const result = calculateResult(choice, computerChoice.value)
  gameResult.value = result
  
  isPlaying.value = false
  
  // 결과 저장
  if (authStore.user) {
    await gameStore.saveGameResult(
      authStore.user.id,
      authStore.user.user_metadata?.username || '플레이어',
      choice,
      computerChoice.value,
      result
    )
    calculateStats()
  }
}

const calculateResult = (player, computer) => {
  if (player === computer) return 'draw'
  
  const winConditions = {
    rock: 'scissors',
    scissors: 'paper',
    paper: 'rock'
  }
  
  return winConditions[player] === computer ? 'win' : 'lose'
}

const resetGame = () => {
  gameResult.value = null
  playerChoice.value = null
  computerChoice.value = null
}

const handleLogout = async () => {
  await authStore.signOut()
  router.push('/')
}
</script>

<style scoped>
.game-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  padding: 2rem;
  color: white;
}

.game-header {
  grid-column: 1 / -1;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.username {
  font-size: 1.2rem;
  font-weight: bold;
}

.logout-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(255, 255, 255, 0.3);
}

.score-board {
  display: flex;
  gap: 2rem;
}

.score-item {
  text-align: center;
}

.score-label {
  display: block;
  font-size: 0.9rem;
  opacity: 0.8;
}

.score-value {
  display: block;
  font-size: 1.5rem;
  font-weight: bold;
}

.game-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.game-title {
  text-align: center;
  margin-bottom: 3rem;
}

.game-title h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
}

.game-area {
  width: 100%;
  max-width: 600px;
  text-align: center;
}

.result-display {
  margin-bottom: 2rem;
}

.result-message {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 2rem;
  animation: bounceIn 0.6s ease;
}

.result-win {
  color: #4ade80;
}

.result-lose {
  color: #f87171;
}

.result-draw {
  color: #fbbf24;
}

.choices-display {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.choice {
  text-align: center;
}

.choice-label {
  font-size: 1.1rem;
  margin-bottom: 1rem;
  opacity: 0.8;
}

.choice-emoji {
  font-size: 4rem;
  animation: popIn 0.5s ease;
}

.choice-emoji.winner {
  animation: winner 0.8s ease infinite;
}

.vs {
  font-size: 2rem;
  font-weight: bold;
  opacity: 0.7;
}

.game-choices h3 {
  margin-bottom: 2rem;
  font-size: 1.5rem;
}

.choice-buttons {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.choice-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
  border: none;
  border-radius: 15px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 120px;
}

.choice-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.2);
  transform: translateY(-5px);
}

.choice-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.choice-emoji {
  font-size: 3rem;
}

.choice-text {
  font-size: 1rem;
  font-weight: bold;
}

.game-animation {
  margin: 2rem 0;
}

.shaking-hands {
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-bottom: 2rem;
}

.hand {
  font-size: 4rem;
  animation: shake 0.5s ease infinite;
}

.thinking-text {
  font-size: 1.2rem;
  opacity: 0.8;
}

.game-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.play-again-btn, .leaderboard-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.play-again-btn {
  background: linear-gradient(45deg, #4ade80, #22c55e);
  color: white;
}

.leaderboard-btn {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.play-again-btn:hover, .leaderboard-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.game-history {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  padding: 1.5rem;
  height: fit-content;
}

.game-history h3 {
  margin-bottom: 1.5rem;
  text-align: center;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  border-left: 4px solid transparent;
}

.history-win {
  border-left-color: #4ade80;
}

.history-lose {
  border-left-color: #f87171;
}

.history-draw {
  border-left-color: #fbbf24;
}

.history-choices {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.vs-small {
  font-size: 0.8rem;
  opacity: 0.7;
}

.history-result {
  font-weight: bold;
  font-size: 0.9rem;
}

.no-history {
  text-align: center;
  opacity: 0.7;
  font-style: italic;
}

@keyframes bounceIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

@keyframes popIn {
  0% {
    transform: scale(0);
  }
  80% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
}

@keyframes winner {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.2);
  }
}

@keyframes shake {
  0%, 100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-5px);
  }
  75% {
    transform: translateX(5px);
  }
}

@media (max-width: 1024px) {
  .game-page {
    grid-template-columns: 1fr;
  }
  
  .game-history {
    order: -1;
  }
}

@media (max-width: 768px) {
  .game-header {
    flex-direction: column;
    gap: 1rem;
  }
  
  .score-board {
    gap: 1rem;
  }
  
  .choice-buttons {
    flex-direction: column;
    gap: 1rem;
  }
  
  .choices-display {
    flex-direction: column;
    gap: 1rem;
  }
}
</style> 