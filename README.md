# 가위바위보 게임 플랫폼

Vue 3 + Vite + Supabase를 사용한 재미있는 가위바위보 게임 플랫폼입니다.

## 🎮 기능

- **사용자 인증**: 회원가입/로그인 시스템
- **애니메이션 게임**: 재미있는 애니메이션이 있는 가위바위보 게임
- **게임 기록**: 개인 게임 기록 저장 및 확인
- **리더보드**: 승률 기반 플레이어 순위
- **반응형 디자인**: 모바일과 데스크톱 모두 지원

## 🚀 시작하기

### 1. 의존성 설치

```bash
npm install
# 또는
pnpm install
```

### 2. Supabase 설정

1. [Supabase](https://supabase.com)에서 새 프로젝트를 생성합니다.
2. 프로젝트 설정에서 URL과 anon key를 복사합니다.
3. 프로젝트 루트에 `.env.local` 파일을 생성하고 다음 내용을 추가합니다:

```env
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 3. 데이터베이스 테이블 생성

Supabase SQL 편집기에서 다음 SQL을 실행하여 필요한 테이블을 생성합니다:

```sql
-- 게임 결과 테이블
CREATE TABLE game_results (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT NOT NULL,
  player_choice TEXT NOT NULL,
  computer_choice TEXT NOT NULL,
  result TEXT NOT NULL,
  played_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS (Row Level Security) 설정
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 게임 결과만 볼 수 있음
CREATE POLICY "Users can view their own game results" ON game_results
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 게임 결과를 추가할 수 있음
CREATE POLICY "Users can insert their own game results" ON game_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 모든 사용자가 리더보드를 볼 수 있음
CREATE POLICY "Anyone can view leaderboard" ON game_results
  FOR SELECT USING (true);
```

### 4. 개발 서버 실행

```bash
npm run dev
# 또는
pnpm dev
```

브라우저에서 `http://localhost:5173`을 열어 애플리케이션을 확인합니다.

## 🏗️ 프로젝트 구조

```
src/
├── components/          # Vue 컴포넌트
├── lib/
│   └── supabase.js     # Supabase 클라이언트 설정
├── router/
│   └── index.js        # Vue Router 설정
├── stores/
│   ├── auth.js         # 인증 상태 관리
│   └── game.js         # 게임 상태 관리
├── views/
│   ├── LandingPage.vue # 랜딩 페이지 (로그인/회원가입)
│   ├── GamePage.vue    # 게임 페이지
│   └── LeaderboardPage.vue # 리더보드 페이지
├── App.vue             # 메인 앱 컴포넌트
└── main.js             # 앱 진입점
```

## 🎯 주요 기능 설명

### 인증 시스템
- Supabase Auth를 사용한 이메일/비밀번호 인증
- 회원가입 시 사용자명 설정
- 자동 로그인 상태 유지

### 게임 시스템
- 바위(✊), 가위(✌️), 보(✋) 선택
- 컴퓨터와의 랜덤 대결
- 승/패/무승부 결과 표시
- 애니메이션 효과 (흔들림, 팝업, 승리 효과)

### 리더보드 시스템
- 승률 기반 순위 표시
- 상위 3명 특별 표시 (금/은/동 메달)
- 전체 플레이어 순위 테이블
- 게임 통계 정보

## 🛠️ 기술 스택

- **Frontend**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router 4
- **Backend**: Supabase (Auth + Database)
- **Styling**: CSS3 (Grid, Flexbox, Animations)

## 📱 반응형 디자인

- 모바일 우선 디자인
- 태블릿과 데스크톱 지원
- 터치 친화적 인터페이스

## 🚀 배포

### Vercel 배포

1. GitHub에 코드를 푸시합니다.
2. [Vercel](https://vercel.com)에서 새 프로젝트를 생성합니다.
3. 환경 변수를 설정합니다:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. 배포를 완료합니다.

### Netlify 배포

1. GitHub에 코드를 푸시합니다.
2. [Netlify](https://netlify.com)에서 새 사이트를 생성합니다.
3. 환경 변수를 설정합니다.
4. 배포를 완료합니다.

## 🤝 기여하기

1. 이 저장소를 포크합니다.
2. 새 기능 브랜치를 생성합니다 (`git checkout -b feature/amazing-feature`)
3. 변경사항을 커밋합니다 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시합니다 (`git push origin feature/amazing-feature`)
5. Pull Request를 생성합니다.

## 📄 라이선스

이 프로젝트는 MIT 라이선스 하에 배포됩니다.

## 🙏 감사의 말

- [Vue.js](https://vuejs.org/) - 훌륭한 프론트엔드 프레임워크
- [Supabase](https://supabase.com) - 강력한 백엔드 서비스
- [Vite](https://vitejs.dev/) - 빠른 빌드 도구
