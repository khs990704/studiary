import datetime
import math
import uuid

from fastapi import HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.ai_result import AIResult
from app.models.session import Session as SessionModel
from app.models.study_day import StudyDay
from app.utils.ai_client import ai_client


def _calculate_stats(sessions: list[SessionModel]) -> dict:
    study_sessions = [s for s in sessions if s.type == "study"]
    total_study = sum(s.duration_minutes for s in study_sessions)
    total_rest = sum(s.duration_minutes for s in sessions if s.type == "rest")
    focus_values = [
        s.focus_level for s in study_sessions if s.focus_level is not None
    ]
    avg_focus = math.ceil(sum(focus_values) / len(focus_values)) if focus_values else 0

    # Build distraction_texts per spec
    distraction_parts = []
    for idx, s in enumerate(sorted(study_sessions, key=lambda x: x.order_num), start=1):
        if s.distraction:
            distraction_parts.append(f"세션{idx}: {s.distraction}")
    distraction_texts = ", ".join(distraction_parts) if distraction_parts else "없음"

    return {
        "total_study_minutes": total_study,
        "total_rest_minutes": total_rest,
        "avg_focus_ceil": avg_focus,
        "session_count": len(sessions),
        "study_session_count": len(study_sessions),
        "rest_session_count": sum(1 for s in sessions if s.type == "rest"),
        "distraction_texts": distraction_texts,
    }


def _build_summary_prompt(stats: dict) -> list[dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                "당신은 학습 세션 분석 전문가입니다. "
                "주어진 데이터를 바탕으로 오늘 학습에 대해 한국어로 1~2문장으로 간결하게 요약해주세요."
            ),
        },
        {
            "role": "user",
            "content": (
                f"오늘 학습 데이터:\n"
                f"- 총 공부 시간: {stats['total_study_minutes']}분\n"
                f"- 총 휴식 시간: {stats['total_rest_minutes']}분\n"
                f"- 평균 집중도 (올림): {stats['avg_focus_ceil']}/5\n"
                f"- 공부 세션 수: {stats['study_session_count']}개\n"
                f"- 방해 요소들: {stats['distraction_texts']}\n\n"
                f"위 데이터를 바탕으로 오늘 학습에 대해 1~2문장으로 요약해주세요."
            ),
        },
    ]


def _build_feedback_prompt(summary: str) -> list[dict[str, str]]:
    return [
        {
            "role": "system",
            "content": (
                "당신은 학습 코치입니다. "
                "주어진 학습 요약을 바탕으로 다음 학습을 위한 구체적인 개선점이나 제안을 한국어로 1~2문장으로 피드백해주세요."
            ),
        },
        {
            "role": "user",
            "content": (
                f"오늘 학습 요약: {summary}\n\n"
                f"위 요약을 바탕으로 다음 학습을 위한 개선점이나 제안을 1~2문장으로 피드백해주세요."
            ),
        },
    ]


async def generate_ai_result(
    study_day_id: uuid.UUID, sessions: list[SessionModel]
) -> AIResult | None:
    """Generate AI summary and feedback. Returns AIResult or None on total failure."""
    stats = _calculate_stats(sessions)
    summary_messages = _build_summary_prompt(stats)

    summary, summary_model = await ai_client.chat(summary_messages)
    if summary is None:
        return None

    # Try feedback
    feedback_messages = _build_feedback_prompt(summary)
    feedback, feedback_model = await ai_client.chat(feedback_messages)

    if feedback_model:
        model_used = f"summary:{summary_model}, feedback:{feedback_model}"
    else:
        model_used = f"summary:{summary_model}"

    ai_result = AIResult(
        study_day_id=study_day_id,
        summary=summary,
        feedback=feedback,
        model_used=model_used,
    )
    return ai_result


async def regenerate_ai_result(
    db: AsyncSession, user_id: uuid.UUID, date: datetime.date
) -> dict:
    """Regenerate AI result for a finished study day. Raises on failure."""
    result = await db.execute(
        select(StudyDay)
        .where(StudyDay.user_id == user_id, StudyDay.date == date)
        .options(selectinload(StudyDay.sessions), selectinload(StudyDay.ai_result))
    )
    study_day = result.scalar_one_or_none()

    if study_day is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="학습일을 찾을 수 없습니다",
        )

    if not study_day.is_finished:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="아직 종료되지 않은 학습일입니다",
        )

    if study_day.ai_result is not None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미 AI 결과가 존재합니다",
        )

    ai_result = await generate_ai_result(study_day.id, list(study_day.sessions))

    if ai_result is None:
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail="AI 서비스 오류가 발생했습니다",
        )

    db.add(ai_result)
    await db.commit()
    await db.refresh(ai_result)

    return {
        "ai_summary": ai_result.summary,
        "ai_feedback": ai_result.feedback,
        "has_ai_result": True,
    }
