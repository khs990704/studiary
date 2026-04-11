# 코드 리뷰 & 테스트 보고서 -- Studiary

> 작성일: 2026-04-11
> 리뷰 대상: backend/, frontend/, docker-compose.yml, nginx/

---

## 1. 요약

- **배포 준비 상태**: 조건부 통과 (필수 수정 사항 코드 수정 완료)
- **필수 수정**: 9건 (모두 수정 완료)
- **권장 수정**: 5건
- **총평**: 전반적인 아키텍처와 코드 구조는 양호하나, 프론트엔드-백엔드 간 타입 불일치(UUID vs number, 필드명 불일치)가 전 영역에 걸쳐 있어 런타임 오류를 유발할 수 있었음. AI 프롬프트 누락, 에러 코드 미분화 등도 수정 완료.

---

## 2. 필수 수정 (Critical) -- 모두 수정 완료

### C-1. 프론트엔드 ID 타입 불일치 (number vs UUID string)

- **파일**: `frontend/src/types/auth.ts:2`, `frontend/src/types/session.ts:4`
- **문제**: 백엔드 모델이 UUID(문자열)를 PK로 사용하지만, 프론트엔드 타입이 `id: number`로 정의되어 있어 전체 CRUD 동작이 불가능.
- **수정**: `id: number` -> `id: string`으로 변경. 관련 API 함수, 스토어, 페이지 컴포넌트의 ID 파라미터 타입도 `number` -> `string`으로 일괄 수정.

### C-2. 세션 응답 필드명 불일치 (order vs order_num)

- **파일**: `frontend/src/types/session.ts:6`, `frontend/src/components/session/SessionCard.tsx:72`
- **문제**: 백엔드 `SessionResponse`는 `order_num` 필드를 반환하지만, 프론트엔드 `Session` 타입은 `order`로 정의. 세션 순서 표시 및 재정렬 로직 전체가 동작하지 않음.
- **수정**: `order` -> `order_num`으로 변경. SessionCard, sessionStore의 관련 참조도 수정.

### C-3. FinishResponse 프론트-백 스키마 불일치

- **파일**: `frontend/src/api/studyDays.ts`, `backend/app/schemas/study_day.py:36-44`
- **문제**: 프론트엔드가 `finishStudyDay` 응답을 `StudyDayDetail` 타입으로 기대했으나, 백엔드는 `FinishResponse`(sessions 미포함, has_ai_result 미포함)를 반환. 런타임에 undefined 필드 접근 발생.
- **수정**: 프론트엔드에 `FinishResponse` 인터페이스를 별도 정의. 백엔드 `FinishResponse`에 `has_ai_result` 필드 추가. `study_day_service.py`의 반환값에 `has_ai_result` 포함.

### C-4. RegenerateResponse 프론트-백 스키마 불일치

- **파일**: `frontend/src/types/ai.ts`, `backend/app/schemas/study_day.py:47-49`
- **문제**: 프론트엔드 `RegenerateResponse`에 `has_ai_result`가 있었으나 백엔드는 `model_used`를 반환. StudyPage에서 `has_ai_result` 사용 시 항상 undefined.
- **수정**: 백엔드 `RegenerateResponse`를 `has_ai_result: bool`로 변경. 프론트엔드 타입도 동기화.

### C-5. 세션 삭제 응답 코드 불일치 (204 vs 명세 200)

- **파일**: `backend/app/routers/sessions.py:48`
- **문제**: API 명세는 DELETE /sessions/{id} 응답으로 `200 {"message":"success"}`를 정의하지만, 구현이 `204 No Content`를 반환. 프론트엔드가 응답 body를 파싱하려 할 때 에러 가능.
- **수정**: `status_code=204` 제거, `return {"message": "success"}` 추가.

### C-6. finish_study_day 에러 코드 미분화 (404 vs 400)

- **파일**: `backend/app/services/study_day_service.py:127-132`
- **문제**: `study_day is None` (학습일 미존재, 명세상 404)와 `not study_day.sessions` (세션 0개, 명세상 400)를 동일한 400 에러로 처리. 명세와 불일치.
- **수정**: `study_day is None`일 때 404 NOT_FOUND 반환, `not study_day.sessions`일 때 400 NO_SESSIONS 반환으로 분리.

### C-7. AI 요약 프롬프트 distraction_texts 누락

- **파일**: `backend/app/services/ai_service.py:33-54`
- **문제**: API 명세(6.4절)에서 사용자 프롬프트에 `방해 요소들: {distraction_texts}`를 포함하도록 정의했으나, 구현에서 누락. AI 요약 품질에 직접 영향.
- **수정**: `_calculate_stats`에 `distraction_texts` 구성 로직 추가 ("세션1: {내용}, 세션2: {내용}" 형식). `_build_summary_prompt`에 방해 요소 항목 추가.

### C-8. AI model_used 기록 형식 불일치

- **파일**: `backend/app/services/ai_service.py:88`
- **문제**: 명세는 `"summary:{model}, feedback:{model}"` 형식을 요구하지만, 구현이 `feedback_model or summary_model`로 단일 모델명만 저장.
- **수정**: `f"summary:{summary_model}, feedback:{feedback_model}"` (피드백 있는 경우), `f"summary:{summary_model}"` (피드백 없는 경우) 형식으로 변경.

### C-9. SessionStatus 타입에 'paused' 누락

- **파일**: `frontend/src/types/session.ts:2`
- **문제**: DB 스키마와 백엔드 CHECK 제약에 `'paused'` 상태가 정의되어 있지만, 프론트엔드 `SessionStatus` 타입에 누락. paused 상태 세션 수신 시 타입 에러 발생 가능.
- **수정**: `'paused'` 추가.

---

## 3. 권장 수정 (Warning)

### W-1. CORS 기본값이 와일드카드

- **파일**: `backend/app/config.py:11`
- **문제**: `CORS_ORIGINS: str = "*"` 기본값이 모든 도메인을 허용. 프로덕션에서 보안 위험.
- **권장**: `.env`에서 반드시 특정 도메인으로 설정. 기본값을 빈 문자열 또는 로컬호스트로 변경.

### W-2. JWT Secret Key 기본값이 평문

- **파일**: `backend/app/config.py:6`
- **문제**: `JWT_SECRET_KEY` 기본값이 `"your-secret-key-change-in-production-min-32-chars"`로 하드코딩. `.env` 미설정 시 그대로 사용되어 보안 위험.
- **권장**: 기본값을 제거하거나, 앱 시작 시 랜덤 생성하고 경고 로그 출력.

### W-3. AI 프롬프트에 reasoning: false 누락

- **파일**: `backend/app/utils/ai_client.py:32-35`
- **문제**: API 명세(6.3절)에서 `"reasoning": false`를 요청 JSON에 포함하도록 정의했으나, 구현에서 누락. 일부 모델이 reasoning mode로 응답할 수 있음.
- **권장**: 요청 JSON에 `"reasoning": False` 추가.

### W-4. 히트맵 셀 색상 매핑 -- focusLevel=0 처리

- **파일**: `frontend/src/components/heatmap/HeatmapCell.tsx:10-11`
- **문제**: `focusLevel !== null`인 경우 `getFocusColor` 호출. focusLevel=0 (study 세션이 있지만 focus_level 전부 null인 경우)도 `getFocusColor(0)`으로 호출되어 `HEATMAP_COLORS[0]` (#d2b48c, 갈색)이 적용됨. 의미적으로 "기록 있음 + 집중도 미입력"과 "기록 없음"이 같은 색상.
- **권장**: 기록 있음+집중도 0인 경우 별도 시각 구분 (예: 연회색 배경). 현재 명세상으로는 정합하나, UX 개선 여지 있음.

### W-5. 에러 응답에 code 필드 미포함

- **파일**: 백엔드 전체 HTTPException 발생 부분
- **문제**: API 명세(2.2절)에서 에러 응답에 `code` 필드(`"DUPLICATE_EMAIL"`, `"ALREADY_FINISHED"` 등)를 포함하도록 정의했으나, 대부분의 HTTPException에서 `detail`만 전달하고 `code`는 미포함. 프론트엔드에서 에러 종류별 분기 처리가 어려움.
- **권장**: 커스텀 예외 클래스 또는 exception handler를 도입하여 `{"detail": "...", "code": "ERROR_CODE"}` 형식 통일.

---

## 4. 양호 (Good)

- **ORM 사용으로 SQL Injection 방지**: 모든 DB 접근이 SQLAlchemy ORM 쿼리를 통해 이루어져 SQL Injection 위험 없음
- **Pydantic 스키마 검증**: 회원가입 비밀번호 규칙(8자+영문+숫자), 이메일 형식, focus_level 범위(1~5), distraction 길이(100자) 등 입력 검증 충실
- **JWT 검증 로직**: decode_token에서 sub 클레임 확인, 만료 검증, DB 사용자 존재 확인까지 3단계 검증 구현
- **소유자 확인**: 세션 수정/삭제 시 study_day.user_id != user_id 검증으로 다른 사용자 리소스 접근 차단
- **AI fallback 체인**: 3개 모델 순차 시도, 각 모델별 timeout/HTTP 에러/빈 응답 핸들링
- **타이머 훅**: useRef로 interval 관리, cleanup 효과, 완료 콜백 패턴 적절
- **Zustand 스토어 설계**: 최소한의 상태, 명확한 액션 분리
- **Docker Compose**: healthcheck 기반 의존성 관리, 볼륨 영속성, 리버스 프록시 설정 적절
- **Alembic 마이그레이션**: 비동기 엔진 설정, CHECK/UNIQUE 제약조건 올바르게 생성
- **프론트엔드 컴포넌트 구조**: Compound Component 패턴(SessionList > SessionCard > FocusLevelInput/DistractionInput), 관심사 분리 양호
- **Axios 인터셉터**: 401 자동 처리, 토큰 자동 첨부

---

## 5. 기능 정합성 체크리스트

| # | 기능 | 명세 | 구현 | 정합 |
|---|------|------|------|------|
| 1 | 회원가입 | POST /auth/register, 201 | 구현 일치 | O |
| 2 | 로그인 | POST /auth/login, JWT 발급 | 구현 일치 | O |
| 3 | 내 정보 조회 | GET /auth/me | 구현 일치 | O |
| 4 | 세션 생성 | POST /sessions, 타입 자동결정 | 구현 일치 | O |
| 5 | 세션 수정 | PATCH /sessions/{id}, 당일+미종료 | 구현 일치 | O |
| 6 | 세션 삭제 | DELETE, order_num 재정렬 | 수정 완료 (204->200) | O |
| 7 | 학습일 목록 | GET /study-days, 계산 필드 | 구현 일치 | O |
| 8 | 학습일 상세 | GET /study-days/{date}, 미존재 시 빈 응답 | 구현 일치 | O |
| 9 | 공부 종료 | POST /finish, AI 에러 삼킴 | 수정 완료 (404/400 분리, has_ai_result 추가) | O |
| 10 | AI 재생성 | POST /regenerate-ai, 502 반환 | 수정 완료 (has_ai_result 추가) | O |
| 11 | 히트맵 | GET /heatmap, avg_focus_ceil | 구현 일치 | O |
| 12 | AI fallback 체인 | 3모델 순차, timeout 10초 | 구현 일치 | O |
| 13 | AI 프롬프트 | 시스템/사용자 프롬프트 내용 | 수정 완료 (distraction_texts 추가) | O |
| 14 | model_used 형식 | summary:{m}, feedback:{m} | 수정 완료 | O |
| 15 | 프론트-백 ID 타입 | UUID 문자열 | 수정 완료 | O |
| 16 | 프론트-백 세션 필드명 | order_num | 수정 완료 | O |
| 17 | 에러 코드 필드 (code) | detail + code | 미구현 (W-5) | 부분 |

---

## 6. 보안 체크리스트

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| 1 | JWT 토큰 생성/검증 | O | HS256, 만료 시간, sub 클레임 |
| 2 | bcrypt 비밀번호 해싱 | O | passlib CryptContext |
| 3 | CORS 설정 | 부분 | 기본값 "*" (W-1) |
| 4 | SQL Injection 방지 | O | SQLAlchemy ORM 사용 |
| 5 | 소유자 확인 | O | user_id 비교 |
| 6 | 입력 검증 | O | Pydantic validators |
| 7 | 환경변수 관리 | 부분 | JWT 키 기본값 주의 (W-2) |
| 8 | XSS 방지 | O | React 자동 이스케이핑 |
| 9 | .env gitignore | 확인 필요 | .gitignore 확인 필요 |

---

## 7. 빌드/배포 체크리스트

| # | 항목 | 상태 | 비고 |
|---|------|------|------|
| 1 | Docker Compose 구성 | O | 4개 서비스 (nginx, frontend, backend, db) |
| 2 | Nginx 리버스 프록시 | O | /api/ -> backend, / -> frontend |
| 3 | DB healthcheck | O | pg_isready, 5초 interval, 5회 retry |
| 4 | Alembic 자동 실행 | O | backend command에 `alembic upgrade head` |
| 5 | DB 볼륨 영속성 | O | pgdata 볼륨 |
| 6 | 환경변수 파일 | O | env_file: .env |
| 7 | 포트 매핑 | O | nginx:80, db:5433 |
| 8 | restart 정책 | O | unless-stopped |
