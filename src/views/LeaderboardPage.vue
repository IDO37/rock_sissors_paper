<template>
  <div class="leaderboard-page">
    <header class="leaderboard-header">
      <h1>🏆 리더보드</h1>
      <p>가위바위보 게임 승률 순위</p>
      <router-link to="/" class="home-btn">홈으로 돌아가기</router-link>
    </header>

    <main class="leaderboard-main">
      <div v-if="gameStore.loading" class="loading">
        <div class="spinner"></div>
        <p>리더보드를 불러오는 중...</p>
      </div>

      <div v-else class="leaderboard-content">
        <!-- 상위 3명 특별 표시 -->
        <div class="top-players">
          <div 
            v-for="(player, index) in topThree" 
            :key="player.username"
            class="top-player"
            :class="`rank-${index + 1}`"
          >
            <div class="rank-badge">{{ index + 1 }}</div>
            <div class="player-info">
              <div class="player-name">{{ player.username }}</div>
              <div class="player-stats">
                <span class="wins">{{ player.wins }}승</span>
                <span class="total">/ {{ player.total }}게임</span>
              </div>
            </div>
            <div class="win-rate">
              <div class="rate-number">{{ player.winRate }}%</div>
              <div class="rate-bar">
                <div 
                  class="rate-fill" 
                  :style="{ width: `${player.winRate}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 전체 리더보드 -->
        <div class="full-leaderboard">
          <h2>전체 순위</h2>
          <div class="leaderboard-table">
            <div class="table-header">
              <div class="col-rank">순위</div>
              <div class="col-name">플레이어</div>
              <div class="col-stats">전적</div>
              <div class="col-rate">승률</div>
            </div>
            
            <div 
              v-for="(player, index) in gameStore.leaderboard" 
              :key="player.username"
              class="table-row"
              :class="{ 'current-user': isCurrentUser(player.username) }"
            >
              <div class="col-rank">
                <span class="rank-number">{{ index + 1 }}</span>
                <span v-if="index < 3" class="medal">🥇🥈🥉</span>
              </div>
              <div class="col-name">
                <span class="player-name">{{ player.username }}</span>
                <span v-if="isCurrentUser(player.username)" class="current-badge">나</span>
              </div>
              <div class="col-stats">
                {{ player.wins }}승 {{ player.total - player.wins }}패
              </div>
              <div class="col-rate">
                <div class="rate-display">
                  <span class="rate-text">{{ player.winRate }}%</span>
                  <div class="rate-bar-small">
                    <div 
                      class="rate-fill-small" 
                      :style="{ width: `${player.winRate}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 통계 정보 -->
        <div class="stats-section">
          <h2>게임 통계</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon">👥</div>
              <div class="stat-content">
                <div class="stat-number">{{ gameStore.leaderboard.length }}</div>
                <div class="stat-label">총 플레이어</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🎮</div>
              <div class="stat-content">
                <div class="stat-number">{{ totalGames }}</div>
                <div class="stat-label">총 게임 수</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon">🏆</div>
              <div class="stat-content">
                <div class="stat-number">{{ averageWinRate }}%</div>
                <div class="stat-label">평균 승률</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 새로고침 버튼 -->
    <div class="refresh-section">
      <button @click="refreshLeaderboard" :disabled="gameStore.loading" class="refresh-btn">
        {{ gameStore.loading ? '새로고침 중...' : '새로고침' }}
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useGameStore } from '../stores/game'
import { useAuthStore } from '../stores/auth'

const gameStore = useGameStore()
const authStore = useAuthStore()

const topThree = computed(() => {
  return gameStore.leaderboard.slice(0, 3)
})

const totalGames = computed(() => {
  return gameStore.leaderboard.reduce((total, player) => total + player.total, 0)
})

const averageWinRate = computed(() => {
  if (gameStore.leaderboard.length === 0) return 0
  const totalRate = gameStore.leaderboard.reduce((sum, player) => sum + parseFloat(player.winRate), 0)
  return (totalRate / gameStore.leaderboard.length).toFixed(1)
})

const isCurrentUser = (username) => {
  return authStore.user?.user_metadata?.username === username
}

const refreshLeaderboard = async () => {
  await gameStore.fetchLeaderboard()
}

onMounted(async () => {
  await gameStore.fetchLeaderboard()
})
</script>

<style scoped>
.leaderboard-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
  color: white;
}

.leaderboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.leaderboard-header h1 {
  font-size: 3rem;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.leaderboard-header p {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.home-btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  text-decoration: none;
  border-radius: 25px;
  transition: all 0.3s ease;
}

.home-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.leaderboard-main {
  max-width: 1200px;
  margin: 0 auto;
}

.loading {
  text-align: center;
  padding: 4rem 0;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(255, 255, 255, 0.3);
  border-top: 4px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.top-players {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.top-player {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  position: relative;
  transition: all 0.3s ease;
}

.top-player:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0,0,0,0.3);
}

.rank-1 {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 193, 7, 0.2));
  border: 2px solid #ffd700;
}

.rank-2 {
  background: linear-gradient(135deg, rgba(192, 192, 192, 0.2), rgba(169, 169, 169, 0.2));
  border: 2px solid #c0c0c0;
}

.rank-3 {
  background: linear-gradient(135deg, rgba(205, 127, 50, 0.2), rgba(184, 115, 51, 0.2));
  border: 2px solid #cd7f32;
}

.rank-badge {
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 1.2rem;
}

.player-info {
  margin-bottom: 1.5rem;
}

.player-name {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.player-stats {
  font-size: 1rem;
  opacity: 0.8;
}

.wins {
  color: #4ade80;
  font-weight: bold;
}

.win-rate {
  text-align: center;
}

.rate-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.rate-bar {
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
}

.rate-fill {
  height: 100%;
  background: linear-gradient(45deg, #4ade80, #22c55e);
  transition: width 0.8s ease;
}

.full-leaderboard {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 3rem;
}

.full-leaderboard h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.leaderboard-table {
  width: 100%;
}

.table-header {
  display: grid;
  grid-template-columns: 80px 1fr 150px 120px;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  margin-bottom: 1rem;
  font-weight: bold;
}

.table-row {
  display: grid;
  grid-template-columns: 80px 1fr 150px 120px;
  gap: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 10px;
  margin-bottom: 0.5rem;
  transition: all 0.3s ease;
}

.table-row:hover {
  background: rgba(255, 255, 255, 0.1);
}

.table-row.current-user {
  background: rgba(74, 222, 128, 0.2);
  border: 1px solid #4ade80;
}

.col-rank {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.rank-number {
  font-weight: bold;
}

.medal {
  font-size: 0.8rem;
}

.col-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.current-badge {
  background: #4ade80;
  color: white;
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: bold;
}

.col-stats {
  display: flex;
  align-items: center;
}

.col-rate {
  display: flex;
  align-items: center;
}

.rate-display {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  width: 100%;
}

.rate-text {
  min-width: 40px;
  font-weight: bold;
}

.rate-bar-small {
  flex: 1;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  overflow: hidden;
}

.rate-fill-small {
  height: 100%;
  background: linear-gradient(45deg, #4ade80, #22c55e);
  transition: width 0.8s ease;
}

.stats-section {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
}

.stats-section h2 {
  text-align: center;
  margin-bottom: 2rem;
  font-size: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 15px;
  text-align: center;
}

.stat-icon {
  font-size: 2.5rem;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
}

.stat-label {
  font-size: 0.9rem;
  opacity: 0.8;
}

.refresh-section {
  text-align: center;
}

.refresh-btn {
  padding: 1rem 2rem;
  border: none;
  border-radius: 10px;
  background: linear-gradient(45deg, #4ade80, #22c55e);
  color: white;
  font-size: 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s ease;
}

.refresh-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .leaderboard-header h1 {
    font-size: 2rem;
  }
  
  .top-players {
    grid-template-columns: 1fr;
  }
  
  .table-header,
  .table-row {
    grid-template-columns: 60px 1fr 100px;
    font-size: 0.9rem;
  }
  
  .col-rate {
    display: none;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
}
</style> 