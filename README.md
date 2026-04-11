# Studiary

학습 세션 생산성 기록 및 AI 요약/피드백 서비스.

하루 공부 세션을 기록하고, 집중도/방해요소 데이터를 바탕으로 AI가 요약과 피드백을 생성합니다.

## 주요 기능

- **월별 히트맵** -- 날짜별 집중도를 색상으로 시각화
- **공부/휴식 세션 기록** -- 타이머 기반 세션 생성, 집중도(1~5) 및 방해요소 기록
- **AI 요약 & 피드백** -- OpenRouter 무료 모델로 하루 학습 요약 및 개선 제안 자동 생성
- **과거 기록 조회** -- 날짜별 세션 목록, 집중도 변화 그래프, AI 리뷰 확인
- **계정 기반 인증** -- 이메일/비밀번호 회원가입, JWT 인증, 다중 기기 접속

## 기술 스택

| 구분 | 기술 |
|------|------|
| Frontend | React 18, TypeScript, Vite 5, Zustand, Tailwind CSS 3, Recharts, Axios |
| Backend | FastAPI, Python 3.11, SQLAlchemy 2.0 (async), Alembic |
| Database | PostgreSQL 15 |
| AI | OpenRouter API (llama-3.1-8b / gemma-3-4b / gemma-3-1b fallback) |
| Infra | Docker Compose, Nginx, Cloudflare (HTTPS) |

## 프로젝트 구조

```
studiary/
├── frontend/                # React SPA
│   ├── src/
│   │   ├── api/             # Axios API 호출
│   │   ├── components/      # UI 컴포넌트
│   │   ├── hooks/           # useTimer, useAuth
│   │   ├── pages/           # LoginPage, RegisterPage, MainPage, StudyPage
│   │   ├── stores/          # Zustand (auth, session, studyDay)
│   │   ├── types/           # TypeScript 타입 정의
│   │   └── utils/           # 날짜, 집중도, 상수
│   ├── Dockerfile
│   └── package.json
├── backend/                 # FastAPI 서버
│   ├── app/
│   │   ├── models/          # SQLAlchemy 모델 (users, study_days, sessions, ai_results)
│   │   ├── schemas/         # Pydantic 스키마
│   │   ├── routers/         # API 라우터 (auth, sessions, study_days, heatmap)
│   │   ├── services/        # 비즈니스 로직
│   │   └── utils/           # JWT, bcrypt, OpenRouter 클라이언트
│   ├── alembic/             # DB 마이그레이션
│   ├── Dockerfile
│   └── requirements.txt
├── nginx/
│   └── nginx.conf           # 리버스 프록시 설정
├── spec/                    # 사전 기획 문서 (PRD, 아키텍처, API, DB, 와이어프레임)
├── _workspace/              # 설계 확정본 + 테스트 계획 + 리뷰 보고서
├── docker-compose.yml
├── .env.example
└── .gitignore
```

## 시작하기

### 사전 요구사항

- Docker 24+, Docker Compose v2+
- [OpenRouter API 키](https://openrouter.ai/) (무료 모델 사용)

### 실행

```bash
# 1. 환경변수 설정
cp .env.example .env
# .env 파일을 열어 실제 값으로 수정 (특히 JWT_SECRET_KEY, OPENROUTER_API_KEY)

# 2. 전체 스택 기동
docker compose up -d --build

# 3. 접속
# http://localhost (Nginx를 통해 프론트엔드/백엔드 통합)
```

### 로컬 개발 (앱은 로컬, DB만 Docker)

로컬 백엔드는 PostgreSQL이 필요합니다. DB만 Docker로 띄워서 쓰는 경우
`DATABASE_URL`의 호스트/포트는 컨테이너 내부 주소(`db:5432`)가 아니라
호스트에서 접근 가능한 `localhost:5433`을 사용하세요.

```bash
# DB만 Docker로 기동
docker compose up -d db

# 백엔드
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL=postgresql+asyncpg://studiary:studiary@localhost:5433/studiary
alembic upgrade head
uvicorn app.main:app --reload --port 8200

# 프론트엔드
cd ../frontend
npm install
npm run dev   # http://localhost:5173 (Vite proxy → localhost:8200)
```

## API 엔드포인트

모든 API는 `/api/v1` 접두사를 사용합니다.

| Method | Path | 설명 |
|--------|------|------|
| POST | `/auth/register` | 회원가입 |
| POST | `/auth/login` | 로그인 (JWT 발급) |
| GET | `/auth/me` | 내 정보 조회 |
| GET | `/study-days?year&month` | 월별 학습 기록 목록 |
| GET | `/study-days/{date}` | 특정 날짜 상세 (세션 포함) |
| POST | `/study-days/{date}/finish` | 공부 종료 + AI 생성 |
| POST | `/study-days/{date}/regenerate-ai` | AI 재생성 |
| POST | `/sessions` | 세션 생성 |
| PATCH | `/sessions/{id}` | 세션 수정 (집중도/방해요소) |
| DELETE | `/sessions/{id}` | 세션 삭제 |
| GET | `/heatmap?year&month` | 월별 히트맵 데이터 |

## 배포

OCI 서버에 Docker Compose로 배포하며, Cloudflare가 HTTPS를 처리합니다.

```
Browser → Cloudflare (HTTPS) → Nginx (:80) ─┬→ Frontend (:3000)
                                              └→ Backend (:8200) → PostgreSQL (:5433)
                                                                 → OpenRouter API
```

자세한 배포 절차는 [`_workspace/05_deploy_guide.md`](_workspace/05_deploy_guide.md)를 참조하세요.

## 환경변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `DATABASE_URL` | O | PostgreSQL 접속 URL |
| `JWT_SECRET_KEY` | O | JWT 서명 키 (최소 32자) |
| `JWT_ALGORITHM` | - | JWT 알고리즘 (기본: HS256) |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | - | 토큰 만료 시간 (기본: 1440분) |
| `OPENROUTER_API_KEY` | O | OpenRouter API 키 |
| `OPENROUTER_BASE_URL` | - | OpenRouter 엔드포인트 |
| `CORS_ORIGINS` | - | CORS 허용 도메인 (기본: *) |
| `POSTGRES_USER` | O | DB 사용자 |
| `POSTGRES_PASSWORD` | O | DB 비밀번호 |
| `POSTGRES_DB` | O | DB 이름 |

## 문서

| 문서 | 설명 |
|------|------|
| [`spec/01_prd.md`](spec/01_prd.md) | 제품 요구사항 정의서 |
| [`spec/02_architecture_preview.md`](spec/02_architecture_preview.md) | 아키텍처 초안 |
| [`spec/03_api_preview.md`](spec/03_api_preview.md) | API 초안 |
| [`spec/04_db_preview.md`](spec/04_db_preview.md) | DB 초안 + ERD |
| [`spec/05_wireframe.md`](spec/05_wireframe.md) | 화면 설계 |
| [`_workspace/02_api_spec.md`](_workspace/02_api_spec.md) | API 명세 (확정본) |
| [`_workspace/03_db_schema.md`](_workspace/03_db_schema.md) | DB 스키마 (확정본) |
| [`_workspace/05_deploy_guide.md`](_workspace/05_deploy_guide.md) | 배포 가이드 |

## 라이선스

MIT License
