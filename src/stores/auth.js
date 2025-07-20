import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '../lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const loading = ref(false)

  // 회원가입
  const signUp = async (email, password, username) => {
    try {
      loading.value = true
      
      // 1. 사용자 회원가입
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username
          }
        }
      })

      if (error) throw error

      // 2. 회원가입 성공 시 user_stats 레코드 생성
      if (data.user) {
        const { error: statsError } = await supabase
          .from('user_stats')
          .insert([
            {
              user_id: data.user.id,
              username: username,
              wins: 0,
              losses: 0,
              draws: 0,
              total_games: 0,
              win_rate: 0.00
            }
          ])

        if (statsError) {
          console.error('사용자 통계 초기화 오류:', statsError)
          // 통계 생성 실패해도 회원가입은 성공으로 처리
        } else {
          console.log('사용자 통계 초기화 성공')
        }
      }

      return { success: true, data }
    } catch (error) {
      console.error('회원가입 오류:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 로그인
  const signIn = async (email, password) => {
    try {
      loading.value = true
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      user.value = data.user
      return { success: true, data }
    } catch (error) {
      console.error('로그인 오류:', error)
      return { success: false, error: error.message }
    } finally {
      loading.value = false
    }
  }

  // 로그아웃
  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      user.value = null
      return { success: true }
    } catch (error) {
      console.error('로그아웃 오류:', error)
      return { success: false, error: error.message }
    }
  }

  // 현재 사용자 가져오기
  const getCurrentUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      user.value = currentUser
      return currentUser
    } catch (error) {
      console.error('현재 사용자 가져오기 오류:', error)
      return null
    }
  }

  // 사용자 통계 레코드 확인 및 생성
  const ensureUserStats = async (userId, username) => {
    try {
      // 1. 기존 통계 레코드 확인
      const { data: existingStats, error: checkError } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (checkError && checkError.code === 'PGRST116') {
        // 레코드가 없으면 생성
        const { error: createError } = await supabase
          .from('user_stats')
          .insert([
            {
              user_id: userId,
              username: username,
              wins: 0,
              losses: 0,
              draws: 0,
              total_games: 0,
              win_rate: 0.00
            }
          ])

        if (createError) {
          console.error('사용자 통계 생성 오류:', createError)
          return false
        } else {
          console.log('사용자 통계 레코드 생성됨')
          return true
        }
      } else if (checkError) {
        console.error('사용자 통계 확인 오류:', checkError)
        return false
      } else {
        // 레코드가 이미 존재함
        console.log('사용자 통계 레코드가 이미 존재함')
        return true
      }
    } catch (error) {
      console.error('사용자 통계 확인/생성 오류:', error)
      return false
    }
  }

  return {
    user,
    loading,
    signUp,
    signIn,
    signOut,
    getCurrentUser,
    ensureUserStats
  }
}) 