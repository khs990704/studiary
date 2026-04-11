# API 초안 — Studiary

> 버전: 0.1 (spec 초안)
> 최종 업데이트: 2026-04-11

---

## 1. 기본 정보

- **Base URL**: `/api/v1`
- **인증 방식**: Bearer Token (JWT)
- **응답 형식**: JSON
- **날짜 형식**: ISO 8601 (`YYYY-MM-DD`, `YYYY-MM-DDTHH:MM:SSZ`)

---

## 2. 공통 응답 형식

### 성공 응답
```json
{
  "data": { ... },
  "message": "success"
}
```

### 에러 응답
```json
{
  "detail": "에러 메시지",
  "code": "ERROR_CODE"
}
```

### 공통 에러 코드

| HTTP 코드 | 코드 | 설명 |
|-----------|------|------|
| 400 | BAD_REQUEST | 잘못된 요청 |
| 401 | UNAUTHORIZED | 인증 실패 (토큰 없음/만료) |
| 403 | FORBIDDEN | 권한 없음 (다른 사용자 리소스) |
| 404 | NOT_FOUND | 리소스 없음 |
| 422 | VALIDATION_ERROR | 입력 검증 실패 |
| 500 | INTERNAL_ERROR | 서버 내부 오류 |

---

## 3. 엔드포인트 목록

| Method | Path | 설명 | 인증 |
|--------|------|------|------|
| POST | `/auth/register` | 회원가입 | X |
| POST | `/auth/login` | 로그인 | X |
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

## 4. 상세 API

### 4.1 인증

#### [POST] `/api/v1/auth/register`

회원가입

- **요청**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "nickname": "학습러"
}
```

- **응답 (201)**:
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

- **에러**: 409 (이메일 중복), 422 (비밀번호 규칙 미충족)

---

#### [POST] `/api/v1/auth/login`

로그인 후 JWT 토큰 발급

- **요청**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

- **응답 (200)**:
```json
{
  "data": {
    "access_token": "eyJhbGci...",
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

- **에러**: 401 (이메일/비밀번호 불일치)

---

#### [GET] `/api/v1/auth/me`

현재 로그인 사용자 정보 조회

- **헤더**: `Authorization: Bearer {token}`
- **응답 (200)**:
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

---

### 4.2 학습 기록 (Study Days)

#### [GET] `/api/v1/study-days?year=2026&month=4`

월별 학습 기록 목록 (메인 카드 목록용)

- **쿼리 파라미터**: `year` (int), `month` (int)
- **응답 (200)**:
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

---

#### [GET] `/api/v1/study-days/{date}`

특정 날짜 학습 기록 상세 (세션 목록 포함)

- **경로 파라미터**: `date` (YYYY-MM-DD)
- **응답 (200)**:
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

---

#### [POST] `/api/v1/study-days/{date}/finish`

당일 공부 종료. 세션 편집 비활성화 + AI 요약/피드백 자동 생성.

- **경로 파라미터**: `date` (YYYY-MM-DD, 오늘 날짜만 허용)
- **요청 Body**: 없음
- **응답 (200)**:
```json
{
  "data": {
    "date": "2026-04-11",
    "is_finished": true,
    "ai_summary": "공부 전 명상. 간식과 함께 공부 시작.",
    "ai_feedback": "방해요소를 잘 인지하고 극복했습니다.",
    "has_ai_result": true
  },
  "message": "success"
}
```

- AI 실패 시에도 200 반환, `ai_summary`/`ai_feedback`이 null, `has_ai_result`가 false

---

#### [POST] `/api/v1/study-days/{date}/regenerate-ai`

AI 요약/피드백 재생성 (기존 AI 결과 없을 때만 허용)

- **경로 파라미터**: `date` (YYYY-MM-DD)
- **요청 Body**: 없음
- **응답 (200)**:
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

- **에러**: 400 (이미 AI 결과 존재), 404 (해당 날짜 기록 없음), 502 (AI 호출 전부 실패)

---

### 4.3 세션

#### [POST] `/api/v1/sessions`

새 세션 생성. 직전 세션 타입에 따라 study/rest 자동 결정.

- **요청**:
```json
{
  "date": "2026-04-11",
  "duration_minutes": 50
}
```

- **응답 (201)**:
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

- 서버가 `type`을 자동 결정 (직전 세션 없으면 study, 직전이 study면 rest, 직전이 rest면 study)
- `study_day` 레코드가 없으면 자동 생성
- **에러**: 400 (이미 종료된 날짜)

---

#### [PATCH] `/api/v1/sessions/{id}`

세션 수정 (집중도, 방해요소). 당일 + 미종료 상태에서만 가능.

- **요청**:
```json
{
  "focus_level": 4,
  "distraction": "핸드폰 알림이 자꾸 울림"
}
```

- **응답 (200)**:
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

- **에러**: 400 (이미 종료된 날짜), 400 (휴식 세션에 집중도/방해요소 설정 시도), 403 (다른 사용자 세션)

---

#### [DELETE] `/api/v1/sessions/{id}`

세션 삭제. 당일 + 미종료 상태에서만 가능.

- **응답 (200)**:
```json
{
  "message": "success"
}
```

- **에러**: 400 (이미 종료된 날짜), 403 (다른 사용자 세션)

---

### 4.4 히트맵

#### [GET] `/api/v1/heatmap?year=2026&month=4`

월별 히트맵 데이터 (날짜별 집중도 평균 올림값)

- **쿼리 파라미터**: `year` (int), `month` (int)
- **응답 (200)**:
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

- `avg_focus_ceil`: 0 = 기록 없음 또는 집중도 평균 0, 1~5 = 올림값

---

## 5. 인증 흐름

1. 클라이언트가 `/auth/login`으로 이메일/비밀번호 전송
2. 서버가 검증 후 JWT access_token 발급
3. 클라이언트는 이후 모든 요청에 `Authorization: Bearer {token}` 헤더 첨부
4. 서버는 토큰 검증 후 `user_id` 추출, 본인 리소스만 접근 허용

---

## 6. AI 호출 상세

### 6.1 Fallback 체인

```
1차: meta-llama/llama-3.1-8b-instruct:free
  ↓ 실패 시
2차: google/gemma-3-4b-it:free
  ↓ 실패 시
3차: google/gemma-3-1b-it:free
  ↓ 실패 시
전부 실패 → ai_result = null, has_ai_result = false
```

### 6.2 요약 요청 프롬프트 구조 (서버 내부)

```
입력 데이터:
- 총 공부 시간: {total_study_minutes}분
- 총 휴식 시간: {total_rest_minutes}분
- 평균 집중도 (올림): {avg_focus_ceil}/5
- 방해 요소들: {distraction_texts}

요청: 위 데이터를 바탕으로 오늘 학습에 대해 1~2문장으로 요약해주세요.
```

### 6.3 피드백 요청 프롬프트 구조 (서버 내부)

```
입력 데이터:
- 오늘 학습 요약: {ai_summary}

요청: 위 요약을 바탕으로 다음 학습을 위한 개선점이나 제안을 1~2문장으로 피드백해주세요.
```

### 6.4 호출 순서

1. 요약 API 호출 (fallback 체인)
2. 요약 성공 시에만 피드백 API 호출 (동일 fallback 체인)
3. 요약 실패 시 피드백 호출하지 않음
4. 모든 결과는 `ai_results` 테이블에 저장

### 6.5 OpenRouter 요청 형식

```json
{
  "model": "meta-llama/llama-3.1-8b-instruct:free",
  "messages": [
    { "role": "system", "content": "..." },
    { "role": "user", "content": "..." }
  ],
  "reasoning": false
}
```

- endpoint: `https://openrouter.ai/api/v1/chat/completions`
- header: `Authorization: Bearer {OPENROUTER_API_KEY}`
