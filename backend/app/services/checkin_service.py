import uuid
from datetime import date
from typing import List, Tuple, Optional
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
