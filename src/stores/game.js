import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useGameStore = defineStore('game', () => {
  const gameHistory = ref([])
  const leaderboard = ref([])
  const loading = ref(false)

  // 게임 결과 저장
  const saveGameResult = async (userId, username, playerChoice, computerChoice, result) => {
    try {
      const { data, error } = await supabase
        .from('game_results')
        .insert([
          {
            user_id: userId,
            username: username,
            player_choice: playerChoice,
            computer_choice: computerChoice,
            result: result,
            played_at: new Date().toISOString()
          }
        ])
        .select()

      if (error) throw error
      
      // 새 게임 결과를 기록에 추가
      if (data && data[0]) {
        gameHistory.value.unshift(data[0])
        
        // 최근 10개만 유지
        if (gameHistory.value.length > 10) {
          gameHistory.value = gameHistory.value.slice(0, 10)
        }
      }

      // 리더보드 즉시 업데이트
      await fetchLeaderboard()
      
      return { success: true, data: data?.[0] }
    } catch (error) {
      console.error('게임 결과 저장 오류:', error)
      return { success: false, error: error.message }
    }
  }

  // 사용자의 게임 기록 가져오기
  const fetchUserHistory = async (userId) => {
    try {
      loading.value = true
      const { data, error } = await supabase
        .from('game_results')
        .select('*')
        .eq('user_id', userId)
        .order('played_at', { ascending: false })
        .limit(10)

      if (error) throw error
      
      gameHistory.value = data || []
    } catch (error) {
      console.error('게임 기록 가져오기 오류:', error)
    } finally {
      loading.value = false
    }
  }

  // 리더보드 가져오기
  const fetchLeaderboard = async () => {
    try {
      loading.value = true
      const { data, error } = await supabase
        .from('game_results')
        .select('username, result, played_at')
        .order('played_at', { ascending: false })

      if (error) throw error

      // 승률 계산
      const userStats = {}
      data.forEach(game => {
        if (!userStats[game.username]) {
          userStats[game.username] = { wins: 0, total: 0 }
        }
        userStats[game.username].total++
        if (game.result === 'win') {
          userStats[game.username].wins++
        }
      })

      // 승률로 정렬
      leaderboard.value = Object.entries(userStats)
        .map(([username, stats]) => ({
          username,
          wins: stats.wins,
          total: stats.total,
          winRate: ((stats.wins / stats.total) * 100).toFixed(1)
        }))
        .sort((a, b) => parseFloat(b.winRate) - parseFloat(a.winRate))
        .slice(0, 20) // 상위 20명까지 표시
    } catch (error) {
      console.error('리더보드 가져오기 오류:', error)
    } finally {
      loading.value = false
    }
  }

  // 실시간 업데이트를 위한 구독 설정
  const subscribeToGameResults = (userId) => {
    const subscription = supabase
      .channel('game_results_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_results',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('실시간 업데이트:', payload)
          // 사용자 기록 업데이트
          if (payload.eventType === 'INSERT') {
            gameHistory.value.unshift(payload.new)
            if (gameHistory.value.length > 10) {
              gameHistory.value = gameHistory.value.slice(0, 10)
            }
          }
          // 리더보드 업데이트
          fetchLeaderboard()
        }
      )
      .subscribe()

    return subscription
  }

  return {
    gameHistory,
    leaderboard,
    loading,
    saveGameResult,
    fetchUserHistory,
    fetchLeaderboard,
    subscribeToGameResults
  }
}) 