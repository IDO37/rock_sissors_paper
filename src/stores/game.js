import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useGameStore = defineStore('game', () => {
  const gameHistory = ref([])
  const leaderboard = ref([])
  const loading = ref(false)
  const lastUpdate = ref(null)

  // 게임 결과 저장 및 통계 업데이트
  const saveGameResult = async (userId, username, playerChoice, computerChoice, result) => {
    try {
      // 1. 게임 결과 저장 (트리거가 자동으로 통계를 업데이트함)
      const { data: gameData, error: gameError } = await supabase
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

      if (gameError) throw gameError

      // 2. 새 게임 결과를 기록에 추가
      if (gameData && gameData[0]) {
        gameHistory.value.unshift(gameData[0])
        
        // 최근 10개만 유지
        if (gameHistory.value.length > 10) {
          gameHistory.value = gameHistory.value.slice(0, 10)
        }
      }

      // 3. 마지막 업데이트 시간 기록
      lastUpdate.value = new Date()
      
      // 4. 리더보드 즉시 업데이트 (트리거로 통계가 이미 업데이트됨)
      await fetchLeaderboard()
      
      return { success: true, data: gameData?.[0] }
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
      lastUpdate.value = new Date()
    } catch (error) {
      console.error('게임 기록 가져오기 오류:', error)
    } finally {
      loading.value = false
    }
  }

  // 리더보드 가져오기 (user_stats 테이블 사용)
  const fetchLeaderboard = async () => {
    try {
      loading.value = true
      const { data, error } = await supabase
        .from('user_stats')
        .select('username, wins, losses, draws, total_games, win_rate')
        .order('win_rate', { ascending: false })
        .order('total_games', { ascending: false })
        .limit(20)

      if (error) throw error

      // 데이터 포맷팅
      leaderboard.value = data.map(user => ({
        username: user.username,
        wins: user.wins || 0,
        total: user.total_games || 0,
        winRate: user.win_rate ? user.win_rate.toFixed(1) : '0.0'
      }))
      
      lastUpdate.value = new Date()
    } catch (error) {
      console.error('리더보드 가져오기 오류:', error)
    } finally {
      loading.value = false
    }
  }

  // 사용자 통계 가져오기
  const fetchUserStats = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      
      return data
    } catch (error) {
      console.error('사용자 통계 가져오기 오류:', error)
      return null
    }
  }

  // 주기적 새로고침 (30초마다)
  const startAutoRefresh = (userId) => {
    const interval = setInterval(async () => {
      if (userId) {
        await fetchUserHistory(userId)
      }
      await fetchLeaderboard()
    }, 30000) // 30초마다

    return interval
  }

  // 실시간 업데이트를 위한 구독 설정 (개선된 버전)
  const subscribeToGameResults = (userId) => {
    console.log('실시간 업데이트 구독 시작:', userId)
    
    const subscription = supabase
      .channel('game_results_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'game_results'
        },
        async (payload) => {
          console.log('새 게임 결과 감지:', payload)
          
          // 현재 사용자의 게임이면 기록 업데이트
          if (payload.new.user_id === userId) {
            gameHistory.value.unshift(payload.new)
            if (gameHistory.value.length > 10) {
              gameHistory.value = gameHistory.value.slice(0, 10)
            }
          }
          
          // 리더보드 업데이트
          await fetchLeaderboard()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'user_stats'
        },
        async (payload) => {
          console.log('사용자 통계 업데이트 감지:', payload)
          await fetchLeaderboard()
        }
      )
      .subscribe((status) => {
        console.log('구독 상태:', status)
      })

    return subscription
  }

  return {
    gameHistory,
    leaderboard,
    loading,
    lastUpdate,
    saveGameResult,
    fetchUserHistory,
    fetchLeaderboard,
    fetchUserStats,
    subscribeToGameResults,
    startAutoRefresh
  }
}) 