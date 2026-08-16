import uuid
from datetime import date, timedelta
from typing import List, Tuple, Optional, Dict, Any
from sqlalchemy.orm import Session
from app.models.daily_checkin import DailyCheckIn
from app.schemas.daily_checkin import DailyCheckInCreate


def get_today_checkin(db: Session, user_id: uuid.UUID) -> Optional[DailyCheckIn]:
    """Retrieves today's check-in entry for the user if it exists."""
    today = date.today()
    return (
        db.query(DailyCheckIn)
        .filter(DailyCheckIn.user_id == user_id, DailyCheckIn.checkin_date == today)
        .first()
    )


def create_or_update_daily_checkin(
    db: Session,
    user_id: uuid.UUID,
    checkin_in: DailyCheckInCreate,
) -> DailyCheckIn:
    """Submits or updates today's daily check-in entry."""
    existing = get_today_checkin(db, user_id)
    if existing:
        existing.mood = checkin_in.mood
        existing.energy = checkin_in.energy
        existing.stress = checkin_in.stress
        existing.sleep_hours = checkin_in.sleep_hours
        existing.sleep_quality = checkin_in.sleep_quality
        existing.exercise_minutes = checkin_in.exercise_minutes
        existing.water_intake_ml = checkin_in.water_intake_ml
        existing.symptoms = checkin_in.symptoms
        existing.notes = checkin_in.notes
        db.add(existing)
        db.commit()
        db.refresh(existing)
        return existing
    else:
        new_checkin = DailyCheckIn(
            user_id=user_id,
            checkin_date=date.today(),
            mood=checkin_in.mood,
            energy=checkin_in.energy,
            stress=checkin_in.stress,
            sleep_hours=checkin_in.sleep_hours,
            sleep_quality=checkin_in.sleep_quality,
            exercise_minutes=checkin_in.exercise_minutes,
            water_intake_ml=checkin_in.water_intake_ml,
            symptoms=checkin_in.symptoms,
            notes=checkin_in.notes,
        )
        db.add(new_checkin)
        db.commit()
        db.refresh(new_checkin)
        return new_checkin


def list_user_checkins(
    db: Session,
    user_id: uuid.UUID,
    limit: int = 30,
) -> Tuple[List[DailyCheckIn], int]:
    """Lists recent daily check-in entries for a user, ordered by date DESC."""
    query = (
        db.query(DailyCheckIn)
        .filter(DailyCheckIn.user_id == user_id)
        .order_by(DailyCheckIn.checkin_date.desc())
    )
    total = query.count()
    items = query.limit(limit).all()
    return items, total


def calculate_checkin_streak(db: Session, user_id: uuid.UUID) -> Dict[str, Any]:
    """
    Calculates current_streak, longest_streak, total_checkins, checked_in_today,
    and returns recent check-in dates for weekly visualization.
    Calculated strictly from database records.
    """
    checkin_rows = (
        db.query(DailyCheckIn.checkin_date)
        .filter(DailyCheckIn.user_id == user_id)
        .order_by(DailyCheckIn.checkin_date.desc())
        .all()
    )

    total_checkins = len(checkin_rows)
    if total_checkins == 0:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "total_checkins": 0,
            "checked_in_today": False,
            "recent_checkin_dates": [],
        }

    # Extract unique sorted dates (descending)
    unique_dates = sorted(list(set(c[0] for c in checkin_rows)), reverse=True)
    today = date.today()
    checked_in_today = (unique_dates[0] == today)

    # 1. Calculate current_streak
    current_streak = 0
    expected_date = today if checked_in_today else (today - timedelta(days=1))

    for d in unique_dates:
        if d == expected_date:
            current_streak += 1
            expected_date -= timedelta(days=1)
        elif d < expected_date:
            break

    # 2. Calculate longest_streak
    asc_dates = sorted(list(set(c[0] for c in checkin_rows)))
    longest_streak = 0
    temp_streak = 0
    prev_date = None

    for d in asc_dates:
        if d > today:
            continue
        if prev_date is None:
            temp_streak = 1
        elif d == prev_date + timedelta(days=1):
            temp_streak += 1
        elif d == prev_date:
            pass
        else:
            temp_streak = 1

        if temp_streak > longest_streak:
            longest_streak = temp_streak
        prev_date = d

    return {
        "current_streak": current_streak,
        "longest_streak": longest_streak,
        "total_checkins": total_checkins,
        "checked_in_today": checked_in_today,
        "recent_checkin_dates": unique_dates[:30],
    }
