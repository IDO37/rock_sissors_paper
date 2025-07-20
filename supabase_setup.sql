-- Supabase 테이블 및 함수 설정 스크립트

-- 1. 사용자 통계 테이블 생성
CREATE TABLE IF NOT EXISTS user_stats (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  draws INTEGER DEFAULT 0,
  total_games INTEGER DEFAULT 0,
  win_rate DECIMAL(5,2) DEFAULT 0.00,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. 게임 결과 테이블 (기존 테이블이 있다면 수정)
CREATE TABLE IF NOT EXISTS game_results (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  player_choice TEXT NOT NULL CHECK (player_choice IN ('rock', 'scissors', 'paper')),
  computer_choice TEXT NOT NULL CHECK (computer_choice IN ('rock', 'scissors', 'paper')),
  result TEXT NOT NULL CHECK (result IN ('win', 'lose', 'draw')),
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. 게임 결과 삽입 시 자동으로 통계 업데이트하는 트리거 함수 (개선된 버전)
CREATE OR REPLACE FUNCTION update_user_stats_on_game_result()
RETURNS TRIGGER AS $$
BEGIN
  -- 사용자 통계 레코드가 없으면 생성, 있으면 username 업데이트
  INSERT INTO user_stats (user_id, username, wins, losses, draws, total_games, win_rate)
  VALUES (NEW.user_id, NEW.username, 0, 0, 0, 0, 0.00)
  ON CONFLICT (user_id) DO UPDATE SET
    username = NEW.username,
    last_updated = NOW();
  
  -- 해당 결과 필드 증가 (원자적 업데이트)
  CASE NEW.result
    WHEN 'win' THEN
      UPDATE user_stats SET 
        wins = wins + 1,
        total_games = total_games + 1,
        last_updated = NOW()
      WHERE user_id = NEW.user_id;
    WHEN 'lose' THEN
      UPDATE user_stats SET 
        losses = losses + 1,
        total_games = total_games + 1,
        last_updated = NOW()
      WHERE user_id = NEW.user_id;
    WHEN 'draw' THEN
      UPDATE user_stats SET 
        draws = draws + 1,
        total_games = total_games + 1,
        last_updated = NOW()
      WHERE user_id = NEW.user_id;
  END CASE;
  
  -- win_rate 재계산
  UPDATE user_stats 
  SET win_rate = CASE 
    WHEN total_games > 0 THEN (wins::DECIMAL / total_games::DECIMAL) * 100
    ELSE 0 
  END
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_user_stats ON game_results;
CREATE TRIGGER trigger_update_user_stats
  AFTER INSERT ON game_results
  FOR EACH ROW
  EXECUTE FUNCTION update_user_stats_on_game_result();

-- 5. RLS (Row Level Security) 설정
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- 6. 사용자 통계 테이블 정책
CREATE POLICY "Users can view all user stats" ON user_stats
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own stats" ON user_stats
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own stats" ON user_stats
  FOR UPDATE USING (auth.uid() = user_id);

-- 7. 게임 결과 테이블 정책
CREATE POLICY "Users can view all game results" ON game_results
  FOR SELECT USING (true);

CREATE POLICY "Users can insert their own game results" ON game_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_user_stats_user_id ON user_stats(user_id);
CREATE INDEX IF NOT EXISTS idx_user_stats_win_rate ON user_stats(win_rate DESC);
CREATE INDEX IF NOT EXISTS idx_game_results_user_id ON game_results(user_id);
CREATE INDEX IF NOT EXISTS idx_game_results_played_at ON game_results(played_at DESC);

-- 9. 기존 데이터 마이그레이션 (필요한 경우)
-- 기존 game_results 테이블의 데이터를 user_stats로 마이그레이션
INSERT INTO user_stats (user_id, username, wins, losses, draws, total_games, win_rate)
SELECT 
  user_id,
  username,
  COUNT(CASE WHEN result = 'win' THEN 1 END) as wins,
  COUNT(CASE WHEN result = 'lose' THEN 1 END) as losses,
  COUNT(CASE WHEN result = 'draw' THEN 1 END) as draws,
  COUNT(*) as total_games,
  CASE 
    WHEN COUNT(*) > 0 THEN (COUNT(CASE WHEN result = 'win' THEN 1 END)::DECIMAL / COUNT(*)::DECIMAL) * 100
    ELSE 0 
  END as win_rate
FROM game_results
GROUP BY user_id, username
ON CONFLICT (user_id) DO UPDATE SET
  wins = EXCLUDED.wins,
  losses = EXCLUDED.losses,
  draws = EXCLUDED.draws,
  total_games = EXCLUDED.total_games,
  win_rate = EXCLUDED.win_rate,
  last_updated = NOW(); 