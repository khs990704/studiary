# 배포 가이드

## 1. 전제조건

| 항목 | 요구사항 |
|------|----------|
| 서버 | OCI (Oracle Cloud Infrastructure) 또는 동급 VPS, Ubuntu 22.04+ |
| Docker | 24.0 이상 |
| Docker Compose | v2 이상 (docker compose 명령어 사용) |
| 도메인 | Cloudflare DNS에서 A 레코드 → 서버 공인 IP |
| Cloudflare | Proxy 활성화, SSL 모드: Flexible |
| API 키 | OpenRouter API 키 (AI 기능용) |

## 2. 환경변수

| 변수명 | 설명 | 예시 | 필수 |
|--------|------|------|------|
| `DATABASE_URL` | DB 연결 문자열 (asyncpg) | `postgresql+asyncpg://studiary:비밀번호@db:5432/studiary` | O |
| `JWT_SECRET_KEY` | JWT 서명 키 (32자 이상) | `openssl rand -hex 32` 으로 생성 | O |
| `JWT_ALGORITHM` | JWT 알고리즘 | `HS256` | O |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 토큰 만료 시간(분) | `1440` (24시간) | O |
| `OPENROUTER_API_KEY` | OpenRouter API 키 | `sk-or-v1-...` | O |
| `OPENROUTER_BASE_URL` | OpenRouter 엔드포인트 | `https://openrouter.ai/api/v1` | O |
| `CORS_ORIGINS` | 허용 Origin (쉼표 구분 또는 `*`) | `https://studiary.example.com` | O |
| `POSTGRES_USER` | PostgreSQL 사용자명 | `studiary` | O |
| `POSTGRES_PASSWORD` | PostgreSQL 비밀번호 | 강력한 비밀번호 사용 | O |
| `POSTGRES_DB` | PostgreSQL DB명 | `studiary` | O |

## 3. 초기 배포 절차

### 3.1 서버 접속 및 Docker 설치

```bash
# 서버 접속
ssh ubuntu@<서버-IP>

# Docker 설치 (Ubuntu)
sudo apt update
sudo apt install -y ca-certificates curl gnupg
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# 현재 사용자에게 Docker 권한 부여
sudo usermod -aG docker $USER
newgrp docker
```

### 3.2 프로젝트 클론

```bash
cd ~
git clone https://github.com/khs990704/studiary.git
cd studiary
```

### 3.3 환경변수 설정

```bash
cp .env.example .env

# .env 파일 편집 (실제 값으로 변경)
nano .env
```

프로덕션에서 반드시 변경해야 하는 값:
- `JWT_SECRET_KEY`: `openssl rand -hex 32` 로 생성한 랜덤 키
- `POSTGRES_PASSWORD`: 강력한 비밀번호
- `DATABASE_URL`: 위 비밀번호와 일치시킬 것
- `OPENROUTER_API_KEY`: 실제 API 키
- `CORS_ORIGINS`: 실제 도메인 (예: `https://studiary.example.com`)

### 3.4 빌드 및 실행

```bash
docker compose up -d --build
```

### 3.5 정상 동작 확인

```bash
# 컨테이너 상태 확인
docker compose ps

# 백엔드 헬스체크
curl localhost/api/v1/auth/me

# 프론트엔드 확인
curl -s -o /dev/null -w "%{http_code}" localhost/
```

모든 컨테이너가 `Up` 상태이고, 백엔드에서 401 응답(인증 필요)이 돌아오면 정상이다.

## 4. 업데이트 배포

```bash
cd ~/studiary

# 최신 코드 가져오기
git pull

# 재빌드 및 재시작
docker compose up -d --build

# 확인
docker compose ps
```

기존 DB 데이터는 `pgdata` 볼륨에 보존되므로 코드 업데이트 시 데이터가 유실되지 않는다.
Alembic 마이그레이션은 backend 컨테이너 시작 시 자동 실행된다.

## 5. 운영 명령어

### 로그 확인

```bash
# 전체 로그
docker compose logs -f

# 특정 서비스 로그
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f nginx
docker compose logs -f db
```

### DB 접속

```bash
docker compose exec db psql -U studiary
```

### 마이그레이션 수동 실행

```bash
docker compose exec backend alembic upgrade head
```

### 서비스 재시작

```bash
# 특정 서비스만
docker compose restart backend

# 전체
docker compose restart
```

### 전체 정리 (주의: DB 데이터 삭제)

```bash
docker compose down -v
```

`-v` 플래그는 볼륨(DB 데이터)까지 삭제한다. 프로덕션에서는 신중하게 사용할 것.

## 6. Cloudflare 설정

### DNS 설정

| 타입 | 이름 | 값 | 프록시 |
|------|------|------|--------|
| A | `studiary` (또는 `@`) | 서버 공인 IP | 활성화 (주황색 구름) |

### SSL/TLS 설정

- **SSL 모드: Flexible**
  - Cloudflare → 서버 구간은 HTTP (Nginx가 80 포트만 수신)
  - 클라이언트 → Cloudflare 구간은 HTTPS (Cloudflare가 처리)

### 보안 권장사항

- **Bot Fight Mode**: 활성화
- **Under Attack Mode**: 공격 시 활성화
- **Firewall Rules**: 필요 시 국가/IP 차단 룰 추가
- **Page Rules**: `http://*studiary.example.com/*` → Always Use HTTPS

## 7. 인프라 구성도

```
[클라이언트]
    │
    │ HTTPS
    ▼
[Cloudflare CDN / SSL]
    │
    │ HTTP (port 80)
    ▼
┌─────────────────────────────────────────┐
│  OCI 서버                                │
│                                          │
│  ┌──────────┐                            │
│  │  Nginx   │ :80                        │
│  │          │                            │
│  │  /api/*  │──► backend:8200 (FastAPI)  │
│  │  /*      │──► frontend:3000 (Next.js) │
│  └──────────┘                            │
│                                          │
│  ┌──────────┐                            │
│  │ Postgres │ :5432 (내부)               │
│  │  15-alp  │ :5433 (외부, 디버깅용)     │
│  └──────────┘                            │
│                                          │
│  [pgdata volume] ── 영속 데이터          │
└─────────────────────────────────────────┘
```

## 8. 문제 해결

### backend가 시작되지 않음

```bash
# 로그 확인
docker compose logs backend

# 흔한 원인:
# 1. DB가 아직 준비 안됨 → healthcheck가 처리하지만, 초기 빌드 시 시간 소요
docker compose logs db

# 2. DATABASE_URL 오류 → .env의 비밀번호가 POSTGRES_PASSWORD와 일치하는지 확인
# 3. alembic 마이그레이션 실패 → 스키마 충돌 시 수동 확인
docker compose exec backend alembic history
```

### AI 기능이 동작하지 않음

```bash
# OpenRouter 연결 확인
docker compose exec backend python -c "import os; print(os.getenv('OPENROUTER_API_KEY', 'NOT SET'))"

# 로그에서 OpenRouter 관련 에러 확인
docker compose logs backend | grep -i openrouter
```

### CORS 에러 발생

- `.env`의 `CORS_ORIGINS` 값을 실제 프론트엔드 도메인으로 설정
- Cloudflare Proxy 사용 시 Origin이 HTTPS 도메인이므로 `https://studiary.example.com` 형태로 지정
- 와일드카드(`*`)는 개발 시에만 사용 권장

### 디스크 공간 부족

```bash
# Docker 미사용 리소스 정리
docker system prune -a --volumes
```

## 9. 롤백 절차

```bash
cd ~/studiary

# 이전 커밋으로 되돌리기
git log --oneline -5           # 돌아갈 커밋 확인
git checkout <commit-hash>     # 해당 커밋으로 이동

# 재빌드
docker compose up -d --build

# 정상 확인 후, 필요 시 브랜치 복원
git checkout main
```

## 10. 보안 체크리스트

- [ ] HTTPS 강제 (Cloudflare Page Rule)
- [ ] `.env` 파일 `.gitignore`에 포함 확인
- [ ] `JWT_SECRET_KEY` 랜덤 생성 (32자 이상)
- [ ] `POSTGRES_PASSWORD` 강력한 비밀번호
- [ ] `CORS_ORIGINS` 프로덕션 도메인으로 제한
- [ ] OCI 보안 그룹: 80, 443 포트만 개방
- [ ] SSH 키 인증만 허용 (비밀번호 로그인 비활성화)
- [ ] DB 외부 포트(5433) 프로덕션에서 제거 또는 방화벽 차단
