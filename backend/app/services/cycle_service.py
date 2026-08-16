import uuid
from datetime import date, timedelta
from typing import List, Tuple, Optional
from sqlalchemy.orm import Session
from app.models.cycle_log import CycleLog
from app.schemas.cycle_log import CycleLogCreate, CyclePredictionResponse


def create_cycle_log(db: Session, user_id: uuid.UUID, log_in: CycleLogCreate) -> CycleLog:
    """Create a new user-scoped menstrual cycle log."""
    log = CycleLog(
        user_id=user_id,
        start_date=log_in.start_date,
        end_date=log_in.end_date,
        flow_intensity=log_in.flow_intensity,
        symptoms=log_in.symptoms,
        notes=log_in.notes,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log


def list_cycle_logs(db: Session, user_id: uuid.UUID) -> Tuple[List[CycleLog], int]:
    """List all cycle logs for a user, ordered by start_date DESC."""
    query = db.query(CycleLog).filter(CycleLog.user_id == user_id).order_by(CycleLog.start_date.desc())
    total = query.count()
    items = query.all()
    return items, total


def get_cycle_prediction(db: Session, user_id: uuid.UUID) -> CyclePredictionResponse:
    """
    Calculates predicted next period start/end and estimated ovulation date based on user's past cycle logs.
    Defaults to standard 28-day cycle length if insufficient historical data exists.
    """
    logs, count = list_cycle_logs(db, user_id)
    if not logs:
        return CyclePredictionResponse()

    latest_log = logs[0]
    last_start = latest_log.start_date

    # Calculate average cycle length if >= 2 logs exist
    cycle_length = 28
    if len(logs) >= 2:
        diffs = []
        for i in range(len(logs) - 1):
            diff = (logs[i].start_date - logs[i + 1].start_date).days
            if 20 <= diff <= 45:
                diffs.append(diff)
        if diffs:
            cycle_length = int(sum(diffs) / len(diffs))

    next_start = last_start + timedelta(days=cycle_length)
    next_end = next_start + timedelta(days=5)
    ovulation_date = next_start - timedelta(days=14)

    return CyclePredictionResponse(
        last_period_start=last_start,
        next_predicted_start=next_start,
        next_predicted_end=next_end,
        predicted_ovulation_date=ovulation_date,
        average_cycle_length_days=cycle_length,
        average_period_length_days=5,
    )
