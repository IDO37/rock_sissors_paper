import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// 환경 변수 검증
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase 환경 변수가 설정되지 않았습니다.')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? '설정됨' : '설정되지 않음')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? '설정됨' : '설정되지 않음')
  
  // 개발 환경에서는 경고만, 프로덕션에서는 에러 처리
  if (import.meta.env.PROD) {
    throw new Error('Supabase 환경 변수가 설정되지 않았습니다. Vercel 환경 변수를 확인해주세요.')
  }
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// 연결 테스트 함수
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_stats').select('count').limit(1)
    if (error) {
      console.error('Supabase 연결 테스트 실패:', error)
      return false
    }
    console.log('Supabase 연결 성공')
    return true
  } catch (error) {
    console.error('Supabase 연결 테스트 중 오류:', error)
    return false
  }
} 