# 테스트 계획 — Studiary

> 작성일: 2026-04-11
> 기반: _workspace/01_architecture.md, _workspace/02_api_spec.md, _workspace/03_db_schema.md

---

## 1. 테스트 전략

- **커버리지 목표**: 80% 이상 (단위 + 통합)
- **테스트 레벨**: 단위(70%) / 통합(20%) / E2E(10%)
- **테스트 프레임워크**: 백엔드 pytest + httpx, 프론트엔드 Vitest + Testing Library, E2E Playwright
- **테스트 DB**: pytest-asyncio + SQLite(async) 또는 테스트 전용 PostgreSQL 컨테이너

### 테스트 매트릭스

| 기능 (FR) | 단위 테스트 | 통합 테스트 | E2E 테스트 | 우선순위 |
|-----------|-----------|-----------|-----------|---------|
| FR-1 회원가입/로그인 | O | O | O | P0 |
| FR-2 메인 기록 화면 | O | - | O | P0 |
| FR-3 공부 세션 생성 | O | O | O | P0 |
| FR-4 세션 진행 기록 | O | O | O | P0 |
| FR-5 세션 수정/삭제 | O | O | - | P0 |
| FR-6 공부 종료 리뷰 | O | O | O | P0 |
| FR-7 AI 요약 생성 | O | O | - | P0 |
| FR-8 AI 피드백 생성 | O | O | - | P0 |
| FR-9 AI 재생성 | O | O | - | P0 |
| FR-10 과거 기록 조회 | O | O | O | P0 |

---

## 2. 단위 테스트 시나리오

### 2.1 백엔드

#### 인증 서비스 (`auth_service.py`, `security.py`)

| # | 시나리오 | 입력 | 기대 결과 |
|---|---------|------|----------|
| A-1 | 비밀번호 해싱 | 평문 비밀번호 | bcrypt 해시 반환, 원본과 불일치 |
| A-2 | 비밀번호 검증 성공 | 평문 + 올바른 해시 | True |
| A-3 | 비밀번호 검증 실패 | 평문 + 잘못된 해시 | False |
| A-4 | JWT 토큰 생성 | user_id (UUID) | 유효한 JWT 문자열 |
| A-5 | JWT 토큰 디코딩 | 유효 토큰 | user_id (UUID) 반환 |
| A-6 | JWT 만료 토큰 디코딩 | 만료된 토큰 | JWTError 발생 |
| A-7 | JWT 잘못된 토큰 | 변조 토큰 | JWTError 발생 |
| A-8 | 이메일 중복 체크 | 존재하는 이메일 | True |
| A-9 | 이메일 중복 체크 | 미존재 이메일 | False |
| A-10 | 회원가입 | 유효 입력 | User 객체 반환, password_hash 생성 확인 |
| A-11 | 인증 성공 | 유효 이메일+비밀번호 | User 반환 |
| A-12 | 인증 실패 (이메일 없음) | 미존재 이메일 | None |
| A-13 | 인증 실패 (비밀번호 불일치) | 잘못된 비밀번호 | None |

#### 세션 서비스 (`session_service.py`)

| # | 시나리오 | 입력 | 기대 결과 |
|---|---------|------|----------|
| S-1 | 첫 세션 타입 결정 | 세션 0개 | type="study" |
| S-2 | study 다음 세션 | 마지막 세션 study | type="rest" |
| S-3 | rest 다음 세션 | 마지막 세션 rest | type="study" |
| S-4 | order_num 할당 | 기존 세션 2개 | order_num=3 |
| S-5 | 오늘 아닌 날짜 세션 생성 | 어제 날짜 | 400 BAD_REQUEST |
| S-6 | 종료된 학습일 세션 생성 | is_finished=true | 400 ALREADY_FINISHED |
| S-7 | study_day 자동 생성 | 미존재 날짜 | study_day 생성 + 세션 생성 |
| S-8 | 세션 수정 성공 | focus_level=3 | 업데이트 반영 |
| S-9 | 다른 사용자 세션 수정 | 타인 user_id | 403 FORBIDDEN |
| S-10 | 종료된 학습일 세션 수정 | is_finished=true | 400 ALREADY_FINISHED |
| S-11 | 휴식 세션에 집중도 설정 | type=rest, focus_level=3 | 400 REST_SESSION_FOCUS |
| S-12 | 세션 삭제 성공 | 유효 세션 | 삭제 + order_num 재정렬 |
| S-13 | 삭제 후 order_num 재정렬 | 3개 중 2번째 삭제 | 남은 세션 order 1, 2 |
| S-14 | 당일 아닌 세션 수정 | 어제 날짜 세션 | 400 BAD_REQUEST |
| S-15 | 당일 아닌 세션 삭제 | 어제 날짜 세션 | 400 BAD_REQUEST |

#### 학습일 서비스 (`study_day_service.py`)

| # | 시나리오 | 입력 | 기대 결과 |
|---|---------|------|----------|
| SD-1 | 월별 학습일 조회 | year=2026, month=4 | 해당 월 StudyDay 목록 |
| SD-2 | 날짜별 상세 조회 (존재) | 2026-04-09 | 세션 포함 상세 데이터 |
| SD-3 | 날짜별 상세 조회 (미존재) | 2026-04-20 | 빈 상태 응답 (id=null, sessions=[]) |
| SD-4 | 계산 필드 - total_study_minutes | study 50분 x 3 | 150 |
| SD-5 | 계산 필드 - avg_focus_ceil | [3, 4, 5] | ceil(4.0) = 4 |
| SD-6 | 계산 필드 - focus_level 전부 null | study 세션 있음, focus null | 0 |
| SD-7 | 계산 필드 - study 세션 0개 | rest만 존재 | total_study=0, avg_focus=0 |
| SD-8 | 종료 성공 | 당일, 세션 있음 | is_finished=true |
| SD-9 | 종료 - 오늘 아닌 날짜 | 어제 | 400 |
| SD-10 | 종료 - 이미 종료됨 | is_finished=true | 400 ALREADY_FINISHED |
| SD-11 | 종료 - 세션 0개 | 세션 없음 | 400 NO_SESSIONS |
| SD-12 | 종료 - study_day 미존재 | 기록 없는 날짜 | 404 NOT_FOUND |

#### AI 서비스 (`ai_service.py`, `ai_client.py`)

| # | 시나리오 | 입력 | 기대 결과 |
|---|---------|------|----------|
| AI-1 | fallback 1차 성공 | 1번 모델 응답 | summary 반환, model=llama-3.1 |
| AI-2 | fallback 1차 실패, 2차 성공 | 1번 timeout, 2번 응답 | summary 반환, model=gemma-3-4b |
| AI-3 | fallback 전부 실패 | 3개 모두 실패 | (None, None) 반환 |
| AI-4 | 요약 성공, 피드백 실패 | 요약 OK, 피드백 3개 실패 | summary만, feedback=null |
| AI-5 | HTTP 에러 (>=400) | 400 응답 | 다음 모델로 fallback |
| AI-6 | timeout (10초) | 10초 초과 | 다음 모델로 fallback |
| AI-7 | 빈 choices | choices=[] | 다음 모델로 fallback |
| AI-8 | 빈 content | content="" | 다음 모델로 fallback |
| AI-9 | model_used 형식 | 요약=llama, 피드백=gemma | "summary:llama..., feedback:gemma..." |
| AI-10 | model_used 형식 (피드백 없음) | 요약=llama, 피드백 실패 | "summary:llama..." |
| AI-11 | regenerate - AI 결과 존재 | ai_result 있음 | 400 AI_RESULT_EXISTS |
| AI-12 | regenerate - 미종료 학습일 | is_finished=false | 400 BAD_REQUEST |
| AI-13 | regenerate - 전체 실패 | 3개 모두 실패 | 502 AI_SERVICE_ERROR |
| AI-14 | finish 시 AI 실패 | 3개 모두 실패 | 200 + ai_result null |
| AI-15 | distraction_texts 구성 | 세션1:핸드폰, 세션2:null | "세션1: 핸드폰" |
| AI-16 | distraction_texts 없음 | 전부 null | "없음" |

### 2.2 프론트엔드

#### useTimer 훅

| # | 시나리오 | 입력 | 기대 결과 |
|---|---------|------|----------|
| T-1 | 타이머 시작 | startTimer(1) | remainingSeconds=60, isRunning=true |
| T-2 | 타이머 일시정지 | pauseTimer() | isRunning=false, isPaused=true |
| T-3 | 타이머 재개 | resumeTimer() | isRunning=true, isPaused=false |
| T-4 | 타이머 완료 | 0초 도달 | isCompleted=true, onComplete 콜백 |
| T-5 | 타이머 리셋 | resetTimer() | remainingSeconds=0, 모든 상태 false |

#### 유틸리티 함수

| # | 시나리오 | 함수 | 입력 | 기대 결과 |
|---|---------|------|------|----------|
| U-1 | 날짜 포맷팅 | formatDate | new Date(2026,3,11) | "2026-04-11" |
| U-2 | 시간 포맷팅 | formatTime | 125 | "02:05" |
| U-3 | 오늘 판별 | isToday | 오늘 날짜 문자열 | true |
| U-4 | 집중도 색상 | getFocusColor | 3 | "#449945" |
| U-5 | 집중도 평균 올림 | calculateAvgFocusCeil | [{focus:3},{focus:4}] | 4 |
| U-6 | 집중도 평균 (빈 배열) | calculateAvgFocusCeil | [] | 0 |
| U-7 | 월 일수 | getDaysInMonth | (2026, 4) | 30 |

---

## 3. 통합 테스트 시나리오

### 3.1 인증 흐름

| # | 시나리오 | 메서드 | 기대 결과 |
|---|---------|--------|----------|
| I-1 | 회원가입 정상 | POST /auth/register | 201 + UserResponse |
| I-2 | 중복 이메일 가입 | POST /auth/register | 409 DUPLICATE_EMAIL |
| I-3 | 비밀번호 규칙 위반 | POST /auth/register | 422 VALIDATION_ERROR |
| I-4 | 로그인 정상 | POST /auth/login | 200 + TokenResponse |
| I-5 | 로그인 실패 | POST /auth/login | 401 UNAUTHORIZED |
| I-6 | 내 정보 조회 | GET /auth/me | 200 + UserResponse |
| I-7 | 토큰 없이 조회 | GET /auth/me | 401 |

### 3.2 세션 CRUD

| # | 시나리오 | 메서드 | 기대 결과 |
|---|---------|--------|----------|
| I-8 | 세션 생성 (첫 세션) | POST /sessions | 201 + type=study |
| I-9 | 세션 생성 (두 번째) | POST /sessions | 201 + type=rest |
| I-10 | 세션 수정 | PATCH /sessions/{id} | 200 + 업데이트 반영 |
| I-11 | 세션 삭제 + order_num 재정렬 | DELETE /sessions/{id} | 200 + 남은 세션 order 확인 |
| I-12 | 종료된 학습일 세션 생성 | POST /sessions | 400 |
| I-13 | 다른 사용자 세션 수정 | PATCH /sessions/{id} | 403 |

### 3.3 학습일 + AI

| # | 시나리오 | 메서드 | 기대 결과 |
|---|---------|--------|----------|
| I-14 | 월별 학습일 목록 | GET /study-days | 200 + 계산 필드 포함 |
| I-15 | 학습일 상세 (존재) | GET /study-days/{date} | 200 + 세션 목록 포함 |
| I-16 | 학습일 상세 (미존재) | GET /study-days/{date} | 200 + 빈 상태 |
| I-17 | 공부 종료 + AI 성공 | POST /study-days/{date}/finish | 200 + AI 결과 포함 |
| I-18 | 공부 종료 + AI 실패 | POST /study-days/{date}/finish | 200 + AI null |
| I-19 | AI 재생성 성공 | POST /study-days/{date}/regenerate-ai | 200 + AI 결과 |
| I-20 | AI 재생성 (기존 결과 존재) | POST /study-days/{date}/regenerate-ai | 400 |
| I-21 | 히트맵 조회 | GET /heatmap | 200 + days 배열 |

### 3.4 전체 흐름 (End-to-End Integration)

| # | 시나리오 | 단계 |
|---|---------|------|
| I-22 | 완전 흐름 | 가입 -> 로그인 -> 세션 생성 x3 -> 집중도 입력 -> 종료 -> AI 생성 -> 히트맵 확인 |
| I-23 | AI fallback 체인 | 1차 모델 mock 실패 -> 2차 성공 확인 |
| I-24 | 세션 삭제 후 재정렬 | 3개 생성 -> 중간 삭제 -> order_num 1,2 확인 |

---

## 4. E2E 테스트 시나리오 (Playwright)

| # | 시나리오 | 단계 | 검증 |
|---|---------|------|------|
| E-1 | 회원가입 -> 로그인 | 가입 폼 작성 -> 제출 -> 로그인 페이지 -> 로그인 -> 메인 진입 | URL=/, 닉네임 표시 |
| E-2 | 세션 생성 -> 기록 -> 종료 | 오늘 공부 시작 -> 타이머 설정 -> 시작 -> 집중도 입력 -> 종료 | 리뷰 화면 전환 |
| E-3 | 히트맵 색상 매핑 | 메인 -> 히트맵 셀 색상 확인 | 집중도별 색상 일치 |
| E-4 | 과거 기록 조회 | 히트맵 과거 날짜 클릭 -> 카드 스크롤 | 읽기 전용 확인 |
| E-5 | 세션 삭제 | 세션 메뉴 -> 삭제 -> 확인 다이얼로그 -> 삭제 완료 | 목록에서 제거 |
| E-6 | AI 재생성 | AI 실패 상태 -> 재생성 버튼 클릭 -> 로딩 -> 결과 표시 | 버튼 비활성화 |
| E-7 | 미인증 접근 차단 | 토큰 없이 / 접근 | /login 리다이렉트 |

---

## 5. 우선순위

### P0 (필수, 배포 전 통과 필요)
- A-1~A-7: 인증 핵심 (비밀번호 해싱, JWT)
- S-1~S-7: 세션 생성 로직
- SD-4~SD-7: 계산 필드
- AI-1~AI-4: AI fallback 체인
- I-1~I-7: 인증 API
- I-8~I-11: 세션 CRUD API
- E-1, E-2: 핵심 사용자 흐름

### P1 (중요, 1차 배포 후 가능)
- S-8~S-15: 세션 수정/삭제 엣지 케이스
- SD-8~SD-12: 종료 엣지 케이스
- AI-5~AI-16: AI 세부 케이스
- I-12~I-24: 통합 엣지 케이스
- E-3~E-7: 부가 E2E

### P2 (선택, 안정화 후)
- T-1~T-5: 타이머 훅 (브라우저 탭 비활성 오차 포함)
- U-1~U-7: 유틸리티 함수
