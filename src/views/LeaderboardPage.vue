<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-8 text-white">
    <header class="text-center mb-12">
      <h1 class="text-5xl md:text-6xl font-bold mb-4 text-shadow-lg">🏆 리더보드</h1>
      <p class="text-xl mb-8 opacity-90">가위바위보 게임 승률 순위</p>
      <router-link to="/" class="inline-block py-3 px-6 bg-white/20 text-white no-underline rounded-full transition-all duration-300 hover:bg-white/30 hover:transform hover:-translate-y-1">
        홈으로 돌아가기
      </router-link>
    </header>

    <main class="max-w-6xl mx-auto">
      <div v-if="gameStore.loading" class="text-center py-16">
        <div class="w-12 h-12 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
        <p>리더보드를 불러오는 중...</p>
      </div>

      <div v-else class="space-y-12">
        <!-- 상위 3명 특별 표시 -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div 
            v-for="(player, index) in topThree" 
            :key="player.username"
            :class="['bg-white/10 backdrop-blur-lg rounded-3xl p-8 text-center relative transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-xl', getTopPlayerClass(index)]"
          >
            <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-red-400 to-orange-500 rounded-full flex items-center justify-center font-bold text-xl">
              {{ index + 1 }}
            </div>
            <div class="mb-6">
              <div class="text-2xl font-bold mb-2">{{ player.username }}</div>
              <div class="text-base opacity-80">
                <span class="text-green-400 font-bold">{{ player.wins }}승</span>
                <span>/ {{ player.total }}게임</span>
              </div>
            </div>
            <div class="text-center">
              <div class="text-3xl font-bold mb-2">{{ player.winRate }}%</div>
              <div class="w-full h-2 bg-white/20 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-800"
                  :style="{ width: `${player.winRate}%` }"
                ></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 전체 리더보드 -->
        <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
          <h2 class="text-center mb-8 text-3xl">전체 순위</h2>
          <div class="w-full">
            <div class="grid grid-cols-[80px_1fr_150px_120px] gap-4 p-4 bg-white/10 rounded-xl mb-4 font-bold">
              <div>순위</div>
              <div>플레이어</div>
              <div>전적</div>
              <div>승률</div>
            </div>
            
            <div 
              v-for="(player, index) in gameStore.leaderboard" 
              :key="player.username"
              :class="['grid grid-cols-[80px_1fr_150px_120px] gap-4 p-4 bg-white/5 rounded-xl mb-2 transition-all duration-300 hover:bg-white/10', { 'bg-green-400/20 border border-green-400': isCurrentUser(player.username) }]"
            >
              <div class="flex items-center gap-2">
                <span class="font-bold">{{ index + 1 }}</span>
                <span v-if="index < 3" class="text-sm">🥇🥈🥉</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="font-bold">{{ player.username }}</span>
                <span v-if="isCurrentUser(player.username)" class="bg-green-400 text-white px-2 py-1 rounded-lg text-xs font-bold">나</span>
              </div>
              <div class="flex items-center">
                {{ player.wins }}승 {{ player.total - player.wins }}패
              </div>
              <div class="flex items-center">
                <div class="flex items-center gap-2 w-full">
                  <span class="font-bold min-w-[40px]">{{ player.winRate }}%</span>
                  <div class="flex-1 h-1.5 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      class="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-800"
                      :style="{ width: `${player.winRate}%` }"
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 통계 정보 -->
        <div class="bg-white/10 backdrop-blur-lg rounded-3xl p-8">
          <h2 class="text-center mb-8 text-3xl">게임 통계</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div class="flex items-center gap-4 p-6 bg-white/10 rounded-2xl text-center">
              <div class="text-4xl">👥</div>
              <div class="flex-1">
                <div class="text-3xl font-bold mb-1">{{ gameStore.leaderboard.length }}</div>
                <div class="text-sm opacity-80">총 플레이어</div>
              </div>
            </div>
            <div class="flex items-center gap-4 p-6 bg-white/10 rounded-2xl text-center">
              <div class="text-4xl">🎮</div>
              <div class="flex-1">
                <div class="text-3xl font-bold mb-1">{{ totalGames }}</div>
                <div class="text-sm opacity-80">총 게임 수</div>
              </div>
            </div>
            <div class="flex items-center gap-4 p-6 bg-white/10 rounded-2xl text-center">
              <div class="text-4xl">🏆</div>
              <div class="flex-1">
                <div class="text-3xl font-bold mb-1">{{ averageWinRate }}%</div>
                <div class="text-sm opacity-80">평균 승률</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- 새로고침 버튼 -->
    <div class="text-center mt-12">
      <button 
        @click="refreshLeaderboard" 
        :disabled="gameStore.loading" 
        class="py-4 px-8 border-none rounded-xl bg-gradient-to-r from-green-400 to-green-600 text-white text-base font-bold cursor-pointer transition-all duration-300 hover:transform hover:-translate-y-1 hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed"
      >
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

const getTopPlayerClass = (index) => {
  const classes = {
    0: 'bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 border-2 border-yellow-400',
    1: 'bg-gradient-to-br from-gray-400/20 to-gray-600/20 border-2 border-gray-400',
    2: 'bg-gradient-to-br from-orange-400/20 to-orange-600/20 border-2 border-orange-400'
  }
  return classes[index] || ''
}

const refreshLeaderboard = async () => {
  await gameStore.fetchLeaderboard()
}

onMounted(async () => {
  await gameStore.fetchLeaderboard()
})
</script>

<style scoped>
.text-shadow-lg {
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}
</style> 