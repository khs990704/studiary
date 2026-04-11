# API 명세 — Studiary

> 버전: 1.0 (확정본)
> 최종 업데이트: 2026-04-11
> 기반 문서: spec/03_api_preview.md

---

## 1. 기본 정보

- **Base URL**: `/api/v1`
- **인증 방식**: Bearer Token (JWT, HS256)
- **응답 형식**: JSON (`Content-Type: application/json`)
- **날짜 형식**: ISO 8601 (`YYYY-MM-DD` 날짜, `YYYY-MM-DDTHH:MM:SSZ` 타임스탬프)
- **문자 인코딩**: UTF-8

---

## 2. 공통 응답 형식

### 2.1 성공 응답

```json
{
  "data": { ... },
  "message": "success"
}
```

- `data`: 응답 페이로드 (단일 객체 또는 배열)
- `message`: 항상 `"success"` (향후 확장용)

### 2.2 에러 응답

```json
{
  "detail": "에러 메시지 (사용자 표시용)",
  "code": "ERROR_CODE"
}
```

### 2.3 공통 에러 코드

| HTTP 코드 | 코드 | 설명 | 사용 예시 |
|-----------|------|------|----------|
| 400 | `BAD_REQUEST` | 잘못된 요청 | 이미 종료된 날짜에 세션 생성 시도 |
| 400 | `ALREADY_FINISHED` | 이미 종료된 학습일 | 종료된 날짜에 세션 수정/삭제/종료 시도 |
| 400 | `NO_SESSIONS` | 세션이 없음 | 세션 0개인 날짜에 종료 시도 |
| 400 | `AI_RESULT_EXISTS` | AI 결과 이미 존재 | 기존 AI 결과가 있는데 재생성 시도 |
| 400 | `REST_SESSION_FOCUS` | 휴식 세션에 집중도 설정 불가 | 휴식 세션에 focus_level 설정 시도 |
| 401 | `UNAUTHORIZED` | 인증 실패 | 토큰 없음, 만료, 유효하지 않음 |
| 403 | `FORBIDDEN` | 권한 없음 | 다른 사용자의 리소스 접근 |
| 404 | `NOT_FOUND` | 리소스 없음 | 존재하지 않는 세션/학습일 조회 |
| 409 | `DUPLICATE_EMAIL` | 이메일 중복 | 이미 등록된 이메일로 회원가입 |
| 422 | `VALIDATION_ERROR` | 입력 검증 실패 | 필수 필드 누락, 타입 불일치 |
| 500 | `INTERNAL_ERROR` | 서버 내부 오류 | 예상치 못한 예외 |
| 502 | `AI_SERVICE_ERROR` | AI 서비스 전체 실패 | OpenRouter 3개 모델 모두 실패 (재생성 시) |

---

## 3. JWT 인증 흐름

### 3.1 토큰 발급

```
1. 클라이언트 → POST /api/v1/auth/login (email, password)
2. 서버: 이메일로 사용자 조회 → bcrypt 비밀번호 검증
3. 성공 시: JWT access_token 발급
   - payload: { sub: user_id, exp: 현재시간 + ACCESS_TOKEN_EXPIRE_MINUTES }
   - algorithm: HS256
   - secret: JWT_SECRET_KEY
4. 클라이언트: access_token을 localStorage에 저장
```

### 3.2 토큰 사용

```
1. 클라이언트: 모든 인증 필요 요청에 헤더 첨부
   Authorization: Bearer {access_token}
2. Axios 인터셉터에서 자동 첨부
3. 401 응답 수신 시 → localStorage 토큰 삭제 → /login으로 리다이렉트
```

### 3.3 토큰 검증 (서버 측)

```python
# dependencies.py의 get_current_user
1. Authorization 헤더에서 Bearer 토큰 추출
2. python-jose로 JWT 디코딩 (JWT_SECRET_KEY, HS256)
3. exp 만료 확인
4. sub에서 user_id 추출
5. DB에서 사용자 조회 (존재하지 않으면 401)
6. User 객체 반환
```

### 3.4 설계 결정

- **Refresh Token 미사용** (MVP): access_token 만료 시간을 24시간으로 설정하여 단순화
- **토큰 저장소**: localStorage (XSS 대비는 입력 새니타이징으로 대응, MVP 수준)
- **향후 계획**: v1.0에서 Refresh Token 패턴 도입 예정

---

## 4. 엔드포인트 목록

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/auth/register` | 회원가입 | X |
| POST | `/auth/login` | 로그인 (JWT 발급) | X |
| GET | `/auth/me` | 내 정보 조회 | O |
| GET | `/study-days` | 월별 학습 기록 목록 | O |
| GET | `/study-days/{date}` | 특정 날짜 학습 기록 상세 | O |
| POST | `/study-days/{date}/finish` | 당일 공부 종료 + AI 생성 | O |
| POST | `/study-days/{date}/regenerate-ai` | AI 재생성 | O |
| POST | `/sessions` | 세션 생성 | O |
| PATCH | `/sessions/{id}` | 세션 수정 (집중도/방해요소) | O |
| DELETE | `/sessions/{id}` | 세션 삭제 | O |
| GET | `/heatmap` | 월별 히트맵 데이터 | O |

---

## 5. 상세 API

### 5.1 인증

#### [POST] `/api/v1/auth/register`

회원가입. 이메일+비밀번호+닉네임으로 계정 생성.

**요청**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "nickname": "학습러"
}
```

**검증 규칙**:
- `email`: 이메일 형식 (RFC 5322), 최대 255자
- `password`: 최소 8자, 영문+숫자 포함
- `nickname`: 1~50자

**응답 (201 Created)**:
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "학습러",
    "created_at": "2026-04-11T09:00:00Z"
  },
  "message": "success"
}
```

**에러**:
| 코드 | 상황 |
|------|------|
| 409 `DUPLICATE_EMAIL` | 이미 등록된 이메일 |
| 422 `VALIDATION_ERROR` | 비밀번호 규칙 미충족, 이메일 형식 오류 |

---

#### [POST] `/api/v1/auth/login`

로그인 후 JWT access_token 발급.

**요청**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**응답 (200)**:
```json
{
  "data": {
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user": {
      "id": 1,
      "email": "user@example.com",
      "nickname": "학습러"
    }
  },
  "message": "success"
}
```

**에러**:
| 코드 | 상황 |
|------|------|
| 401 `UNAUTHORIZED` | 이메일 없음 또는 비밀번호 불일치 |

---

#### [GET] `/api/v1/auth/me`

현재 로그인 사용자 정보 조회. 페이지 새로고침 시 인증 상태 복원용.

**헤더**: `Authorization: Bearer {token}`

**응답 (200)**:
```json
{
  "data": {
    "id": 1,
    "email": "user@example.com",
    "nickname": "학습러",
    "created_at": "2026-04-11T09:00:00Z"
  },
  "message": "success"
}
```

**에러**: 401 (토큰 없음/만료/유효하지 않음)

---

### 5.2 학습 기록 (Study Days)

#### [GET] `/api/v1/study-days?year=2026&month=4`

월별 학습 기록 목록. 메인 페이지 카드 목록용.

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `year` | int | O | 년도 (2020~2099) |
| `month` | int | O | 월 (1~12) |

**응답 (200)**:
```json
{
  "data": [
    {
      "date": "2026-04-09",
      "total_study_minutes": 270,
      "total_rest_minutes": 30,
      "avg_focus_ceil": 4,
      "is_finished": true,
      "ai_summary": "스트레칭 후 공부 시작. 컨디션 굿.",
      "ai_feedback": "스트레칭 이후 방 환기를 추가하면 더 좋겠습니다.",
      "has_ai_result": true
    },
    {
      "date": "2026-04-10",
      "total_study_minutes": 195,
      "total_rest_minutes": 15,
      "avg_focus_ceil": 3,
      "is_finished": true,
      "ai_summary": null,
      "ai_feedback": null,
      "has_ai_result": false
    }
  ],
  "message": "success"
}
```

**계산 필드 로직** (서버 측 실시간 계산):
- `total_study_minutes`: 해당 study_day의 `type='study'` 세션 `duration_minutes` 합
- `total_rest_minutes`: 해당 study_day의 `type='rest'` 세션 `duration_minutes` 합
- `avg_focus_ceil`: `type='study'` AND `focus_level IS NOT NULL`인 세션의 `focus_level` 평균 올림 (CEIL). 해당 세션이 없으면 0
- `has_ai_result`: 해당 study_day에 ai_results 레코드가 존재하는지 여부

**정렬**: `date` 내림차순 (최신 날짜가 먼저)

---

#### [GET] `/api/v1/study-days/{date}`

특정 날짜 학습 기록 상세. 세션 목록 포함.

**경로 파라미터**: `date` (YYYY-MM-DD 형식)

**응답 (200)**:
```json
{
  "data": {
    "date": "2026-04-09",
    "is_finished": true,
    "total_study_minutes": 270,
    "total_rest_minutes": 30,
    "avg_focus_ceil": 4,
    "sessions": [
      {
        "id": 1,
        "order": 1,
        "type": "study",
        "duration_minutes": 50,
        "focus_level": 3,
        "distraction": "친구랑 싸워서 신경쓰여서 집중이 안됨.",
        "status": "completed",
        "created_at": "2026-04-09T09:00:00Z"
      },
      {
        "id": 2,
        "order": 2,
        "type": "rest",
        "duration_minutes": 10,
        "focus_level": null,
        "distraction": null,
        "status": "completed",
        "created_at": "2026-04-09T09:50:00Z"
      }
    ],
    "ai_summary": "스트레칭 후 공부 시작. 컨디션 굿.",
    "ai_feedback": "스트레칭 이후 방 환기를 추가하면 더 좋겠습니다.",
    "has_ai_result": true
  },
  "message": "success"
}
```

**세션 정렬**: `order_num` 오름차순

**해당 날짜에 study_day가 없는 경우**: study_day를 생성하지 않고, 빈 상태로 응답:
```json
{
  "data": {
    "date": "2026-04-11",
    "is_finished": false,
    "total_study_minutes": 0,
    "total_rest_minutes": 0,
    "avg_focus_ceil": 0,
    "sessions": [],
    "ai_summary": null,
    "ai_feedback": null,
    "has_ai_result": false
  },
  "message": "success"
}
```

---

#### [POST] `/api/v1/study-days/{date}/finish`

당일 공부 종료. `is_finished=true` 설정 + AI 요약/피드백 자동 생성.

**경로 파라미터**: `date` (YYYY-MM-DD, **오늘 날짜만 허용**)

**요청 Body**: 없음

**서버 처리 순서**:
1. JWT에서 user_id 추출
2. study_day 조회 (없으면 404)
3. 오늘 날짜인지 검증 (아니면 400)
4. 이미 종료되었는지 검증 (이미 종료면 400 `ALREADY_FINISHED`)
5. 세션이 0개인지 검증 (0개면 400 `NO_SESSIONS`)
6. `is_finished = true`로 업데이트
7. 세션 데이터에서 계산 필드 산출
8. AI 요약 요청 (fallback 체인)
9. 요약 성공 시 AI 피드백 요청 (fallback 체인)
10. AI 결과 저장 (성공 시) 또는 null (실패 시)
11. 응답 반환

**응답 (200)**:
```json
{
  "data": {
    "date": "2026-04-11",
    "is_finished": true,
    "total_study_minutes": 150,
    "total_rest_minutes": 20,
    "avg_focus_ceil": 4,
    "ai_summary": "공부 전 명상. 간식과 함께 공부 시작.",
    "ai_feedback": "방해요소를 잘 인지하고 극복했습니다.",
    "has_ai_result": true
  },
  "message": "success"
}
```

**AI 실패 시에도 200 반환**:
```json
{
  "data": {
    "date": "2026-04-11",
    "is_finished": true,
    "total_study_minutes": 150,
    "total_rest_minutes": 20,
    "avg_focus_ceil": 4,
    "ai_summary": null,
    "ai_feedback": null,
    "has_ai_result": false
  },
  "message": "success"
}
```

**에러**:
| 코드 | 상황 |
|------|------|
| 400 `BAD_REQUEST` | 오늘 날짜가 아닌 경우 |
| 400 `ALREADY_FINISHED` | 이미 종료된 학습일 |
| 400 `NO_SESSIONS` | 세션이 0개 |
| 404 `NOT_FOUND` | 해당 날짜 학습일 없음 |

---

#### [POST] `/api/v1/study-days/{date}/regenerate-ai`

AI 요약/피드백 재생성. 기존 AI 결과가 없는 경우에만 허용.

**경로 파라미터**: `date` (YYYY-MM-DD)

**요청 Body**: 없음

**전제 조건**:
- 해당 날짜 study_day가 존재해야 함
- `is_finished = true`여야 함
- 기존 ai_results 레코드가 없어야 함

**응답 (200)**:
```json
{
  "data": {
    "ai_summary": "재생성된 요약 텍스트",
    "ai_feedback": "재생성된 피드백 텍스트",
    "has_ai_result": true
  },
  "message": "success"
}
```

**에러**:
| 코드 | 상황 |
|------|------|
| 400 `AI_RESULT_EXISTS` | 이미 AI 결과가 존재 |
| 400 `BAD_REQUEST` | 아직 종료되지 않은 학습일 |
| 404 `NOT_FOUND` | 해당 날짜 학습일 없음 |
| 502 `AI_SERVICE_ERROR` | AI 3개 모델 전부 실패 |

---

### 5.3 세션

#### [POST] `/api/v1/sessions`

새 세션 생성. 직전 세션 타입에 따라 study/rest 자동 결정.

**요청**:
```json
{
  "date": "2026-04-11",
  "duration_minutes": 50
}
```

**검증 규칙**:
- `date`: YYYY-MM-DD 형식, **오늘 날짜만 허용**
- `duration_minutes`: 정수, 1 이상

**서버 처리 순서**:
1. JWT에서 user_id 추출
2. 오늘 날짜인지 검증
3. study_day 조회 (없으면 자동 생성: `{ user_id, date, is_finished: false }`)
4. `is_finished` 검증 (true면 400 `ALREADY_FINISHED`)
5. 해당 study_day의 마지막 세션 타입 조회
   - 세션 없음 → `type = "study"`
   - 마지막이 `study` → `type = "rest"`
   - 마지막이 `rest` → `type = "study"`
6. `order_num` = 기존 세션 수 + 1
7. 세션 INSERT (`status = "running"`)

**응답 (201 Created)**:
```json
{
  "data": {
    "id": 5,
    "order": 3,
    "type": "study",
    "duration_minutes": 50,
    "focus_level": null,
    "distraction": null,
    "status": "running",
    "created_at": "2026-04-11T14:00:00Z"
  },
  "message": "success"
}
```

**에러**:
| 코드 | 상황 |
|------|------|
| 400 `BAD_REQUEST` | 오늘 날짜가 아닌 경우 |
| 400 `ALREADY_FINISHED` | 이미 종료된 학습일 |
| 422 `VALIDATION_ERROR` | duration_minutes <= 0 |

---

#### [PATCH] `/api/v1/sessions/{id}`

세션 수정. 집중도와 방해요소를 업데이트. **당일 + 미종료 상태에서만 가능**.

**경로 파라미터**: `id` (세션 ID, 정수)

**요청**:
```json
{
  "focus_level": 4,
  "distraction": "핸드폰 알림이 자꾸 울림"
}
```

**검증 규칙**:
- `focus_level`: 1~5 정수 또는 null (선택)
- `distraction`: 0~100자 문자열 또는 null (선택)
- 두 필드 모두 선택적 (partial update)
- `type = "rest"`인 세션에는 `focus_level`/`distraction` 설정 불가 (400 `REST_SESSION_FOCUS`)

**서버 처리 순서**:
1. JWT에서 user_id 추출
2. 세션 조회 → study_day 조회 → user_id 소유 확인 (403 `FORBIDDEN`)
3. study_day.is_finished 검증 (true면 400 `ALREADY_FINISHED`)
4. 세션 타입이 `rest`인데 focus_level/distraction 설정하면 400
5. 업데이트 실행

**응답 (200)**:
```json
{
  "data": {
    "id": 5,
    "order": 3,
    "type": "study",
    "duration_minutes": 50,
    "focus_level": 4,
    "distraction": "핸드폰 알림이 자꾸 울림",
    "status": "running",
    "created_at": "2026-04-11T14:00:00Z"
  },
  "message": "success"
}
```

**에러**:
| 코드 | 상황 |
|------|------|
| 400 `ALREADY_FINISHED` | 이미 종료된 학습일 |
| 400 `REST_SESSION_FOCUS` | 휴식 세션에 집중도/방해요소 설정 시도 |
| 403 `FORBIDDEN` | 다른 사용자의 세션 |
| 404 `NOT_FOUND` | 세션 없음 |

---

#### [DELETE] `/api/v1/sessions/{id}`

세션 삭제. **당일 + 미종료 상태에서만 가능**. 삭제 후 남은 세션의 `order_num` 재정렬.

**경로 파라미터**: `id` (세션 ID, 정수)

**서버 처리 순서**:
1. JWT에서 user_id 추출
2. 세션 조회 → study_day 조회 → user_id 소유 확인
3. study_day.is_finished 검증
4. 세션 DELETE
5. 남은 세션의 `order_num`을 1부터 순차 재정렬

**응답 (200)**:
```json
{
  "message": "success"
}
```

**에러**:
| 코드 | 상황 |
|------|------|
| 400 `ALREADY_FINISHED` | 이미 종료된 학습일 |
| 403 `FORBIDDEN` | 다른 사용자의 세션 |
| 404 `NOT_FOUND` | 세션 없음 |

---

### 5.4 히트맵

#### [GET] `/api/v1/heatmap?year=2026&month=4`

월별 히트맵 데이터. 날짜별 집중도 평균 올림값 반환.

**쿼리 파라미터**:
| 파라미터 | 타입 | 필수 | 설명 |
|---------|------|------|------|
| `year` | int | O | 년도 (2020~2099) |
| `month` | int | O | 월 (1~12) |

**응답 (200)**:
```json
{
  "data": {
    "year": 2026,
    "month": 4,
    "days": [
      { "date": "2026-04-09", "avg_focus_ceil": 4 },
      { "date": "2026-04-10", "avg_focus_ceil": 3 },
      { "date": "2026-04-11", "avg_focus_ceil": 0 }
    ]
  },
  "message": "success"
}
```

**반환 규칙**:
- 해당 월에 study_day 레코드가 있는 날짜만 배열에 포함
- `avg_focus_ceil`: 0 = study 세션이 있지만 focus_level이 전부 null, 1~5 = 올림값
- study_day 레코드가 없는 날짜는 배열에 미포함 (프론트에서 기록 없음 처리)

---

## 6. AI 호출 상세

### 6.1 Fallback 체인

```
1차: meta-llama/llama-3.1-8b-instruct:free
  ↓ 실패 시 (timeout 10초 또는 HTTP 에러)
2차: google/gemma-3-4b-it:free
  ↓ 실패 시
3차: google/gemma-3-1b-it:free
  ↓ 실패 시
전부 실패 → 에러 삼킴 (finish 시) 또는 502 반환 (regenerate 시)
```

### 6.2 실패 판정 기준

- HTTP 응답 코드 >= 400
- 응답 시간 초과 (10초 timeout)
- 응답 JSON 파싱 실패
- `choices` 배열이 비어있거나 `content`가 빈 문자열

### 6.3 OpenRouter 요청 형식

```
POST https://openrouter.ai/api/v1/chat/completions
Authorization: Bearer {OPENROUTER_API_KEY}
Content-Type: application/json
```

```json
{
  "model": "meta-llama/llama-3.1-8b-instruct:free",
  "messages": [
    { "role": "system", "content": "시스템 프롬프트" },
    { "role": "user", "content": "사용자 프롬프트" }
  ],
  "reasoning": false
}
```

### 6.4 요약 프롬프트

**시스템 프롬프트**:
```
당신은 학습 세션 분석 전문가입니다.
주어진 데이터를 바탕으로 오늘 학습에 대해 한국어로 1~2문장으로 간결하게 요약해주세요.
```

**사용자 프롬프트**:
```
오늘 학습 데이터:
- 총 공부 시간: {total_study_minutes}분
- 총 휴식 시간: {total_rest_minutes}분
- 평균 집중도 (올림): {avg_focus_ceil}/5
- 공부 세션 수: {study_session_count}개
- 방해 요소들: {distraction_texts}

위 데이터를 바탕으로 오늘 학습에 대해 1~2문장으로 요약해주세요.
```

`distraction_texts` 구성:
- type='study'인 세션의 distraction을 순서대로 나열
- null이 아닌 것만 포함
- 형식: `"세션1: {내용}, 세션2: {내용}"` (없으면 `"없음"`)

### 6.5 피드백 프롬프트

**시스템 프롬프트**:
```
당신은 학습 코치입니다.
주어진 학습 요약을 바탕으로 다음 학습을 위한 구체적인 개선점이나 제안을 한국어로 1~2문장으로 피드백해주세요.
```

**사용자 프롬프트**:
```
오늘 학습 요약: {ai_summary}

위 요약을 바탕으로 다음 학습을 위한 개선점이나 제안을 1~2문장으로 피드백해주세요.
```

### 6.6 호출 순서

```
1. 세션 데이터 수집 → 계산 필드 산출
2. 요약 API 호출 (fallback 체인: model1 → model2 → model3)
3. 요약 성공 시:
   a. 성공한 모델로 피드백 API 호출 (같은 fallback 체인)
   b. 피드백 성공 → ai_results INSERT (summary + feedback + model_used)
   c. 피드백 실패 → ai_results INSERT (summary만, feedback=null, model_used)
4. 요약 실패 시 (3개 모두 실패):
   a. finish 호출: 에러 삼킴, ai_result null, 정상 200 응답
   b. regenerate 호출: 502 AI_SERVICE_ERROR 반환
```

### 6.7 model_used 기록

- 요약과 피드백에서 실제로 성공한 모델명을 기록
- 형식: `"summary:{model}, feedback:{model}"` (예: `"summary:llama-3.1-8b, feedback:gemma-3-4b"`)
- 피드백이 없으면: `"summary:{model}"` (예: `"summary:llama-3.1-8b"`)

---

## 7. 비즈니스 로직 규칙

### 7.1 세션 타입 자동결정

```
새 세션 생성 시:
  IF 해당 study_day에 세션이 0개:
    type = "study"
  ELSE:
    last_session = 가장 최근 세션 (order_num이 가장 큰 것)
    IF last_session.type == "study":
      type = "rest"
    ELSE:
      type = "study"
```

### 7.2 당일 + 미종료 제한

다음 작업은 **당일(오늘 날짜)이고 is_finished=false**인 경우에만 허용:
- 세션 생성 (`POST /sessions`)
- 세션 수정 (`PATCH /sessions/{id}`)
- 세션 삭제 (`DELETE /sessions/{id}`)
- 공부 종료 (`POST /study-days/{date}/finish`)

### 7.3 계산 필드 (DB 비저장)

| 필드 | 계산 방식 | 사용처 |
|------|----------|--------|
| `total_study_minutes` | `SUM(duration_minutes) WHERE type='study'` | study-days 목록/상세 |
| `total_rest_minutes` | `SUM(duration_minutes) WHERE type='rest'` | study-days 목록/상세 |
| `avg_focus_ceil` | `CEIL(AVG(focus_level)) WHERE type='study' AND focus_level IS NOT NULL` | study-days 목록/상세, heatmap |
| `has_ai_result` | `ai_results 레코드 존재 여부 (boolean)` | study-days 목록/상세 |

- `avg_focus_ceil`에서 해당 조건을 만족하는 세션이 없으면 0 반환

### 7.4 세션 순서 재정렬

세션 삭제 시 남은 세션의 `order_num`을 `created_at` 오름차순으로 1부터 재할당.

```sql
-- 예시: 세션 3개 중 2번째 삭제 후
-- 삭제 전: order 1, 2, 3
-- 삭제 후: order 1, 2 (3번째가 2로 변경)
```

### 7.5 히트맵 데이터 특이 케이스

- study_day는 존재하지만 study 세션이 없는 경우 (휴식만 있는 경우): `avg_focus_ceil = 0`
- study 세션은 있지만 focus_level이 전부 null인 경우: `avg_focus_ceil = 0`
- study_day가 존재하지 않는 날짜: 히트맵 배열에 미포함 (프론트에서 "기록 없음" 색상 처리)
