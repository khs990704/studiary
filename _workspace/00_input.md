# 입력 정리 — Studiary

> 생성일: 2026-04-11
> 출처: idea.md, idea_inquiry.md, spec/

---

## 1. 프로젝트 개요

**Studiary** — 학습 세션 생산성 기록 및 AI 요약/피드백 서비스

하루 공부 세션을 기록하고, 집중도/방해요소 데이터를 바탕으로 AI가 요약과 피드백을 생성하는 서비스.

## 2. 기술 스택 (확정)

| 구분 | 기술 |
|------|------|
| 프론트엔드 | React 18+ (Vite), Zustand, Tailwind CSS, Axios, Recharts |
| 백엔드 | FastAPI, SQLAlchemy 2.0 (async), Alembic |
| DB | PostgreSQL 15+ |
| 인증 | JWT (python-jose + passlib[bcrypt]) |
| AI | OpenRouter API (무료 모델 3개 fallback) |
| 배포 | Docker Compose, Nginx, OCI, Cloudflare HTTPS |

## 3. 핵심 기능 (P0)

1. **회원가입/로그인** — 이메일+비밀번호, JWT 인증, 다중 기기
2. **메인 기록 화면** — 월별 히트맵(집중도 1~5 초록, 0 갈색) + 날짜별 카드 목록
3. **공부 세션 생성** — 타이머 설정, 공부/휴식 교대 자동 결정
4. **세션 진행 기록** — 집중도(1~5), 방해요소(100자), 당일까지 수정 가능
5. **세션 수정/삭제** — 당일+미종료 상태에서만, 삭제 확인 다이얼로그
6. **공부 종료 리뷰** — 세션 목록, 집중도 변화 그래프, AI 요약/피드백
7. **AI 요약 생성** — OpenRouter 무료 모델, 3모델 fallback 체인
8. **AI 피드백 생성** — 요약 기반 피드백, 요약 실패 시 미호출
9. **AI 재생성** — 실패 시 재생성 버튼 활성화
10. **과거 기록 조회** — 읽기 전용

## 4. 배포 구성 (확정)

- **포트**: front:3000, back:8200, db:5433, nginx:80
- **네트워크**: studiary-net (Docker 내부)
- **Nginx**: HTTP(80) → front(/), back(/api)
- **HTTPS**: Cloudflare가 처리, Nginx는 HTTP만
- **Compose**: 단일 docker-compose.yml로 전체 배포

## 5. AI 구성 (확정)

- **모델 fallback**: llama-3.1-8b → gemma-3-4b → gemma-3-1b (모두 :free)
- **호출 순서**: 요약 → (성공 시만) 피드백
- **reasoning**: false
- **실패 처리**: 기록은 저장, AI 결과 null, 재생성 버튼 활성화

## 6. 참조 문서

- `idea.md` — 상세 와이어프레임 + 기능 명세
- `idea_inquiry.md` — 의사결정 포인트 답변
- `spec/01_prd.md` — 제품 요구사항 정의서
- `spec/02_architecture_preview.md` — 아키텍처 초안
- `spec/03_api_preview.md` — API 초안 (11개 엔드포인트)
- `spec/04_db_preview.md` — DB 초안 (4개 테이블, ERD)
- `spec/05_wireframe.md` — 화면 설계 (4개 라우트, 7개 와이어프레임)
- `spec/06_milestones.md` — 마일스톤
