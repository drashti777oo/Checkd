import uuid
import math
import logging
from datetime import datetime, timezone
from typing import Optional, Tuple, List
from sqlalchemy.orm import Session
from app.models.health_record import HealthRecord
from app.schemas.health_record import HealthRecordCreate

logger = logging.getLogger(__name__)


def create_health_record(
    db: Session,
    user_id: uuid.UUID,
    record_in: HealthRecordCreate,
) -> HealthRecord:
    """Creates a new health record for the specified user."""
    recorded_at = record_in.recorded_at or datetime.now(timezone.utc)
    record = HealthRecord(
        id=uuid.uuid4(),
        user_id=user_id,
        record_type=record_in.record_type,
        recorded_at=recorded_at,
        data=record_in.data,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    logger.info(f"Health record created: record_id={record.id}, user_id={user_id}, type={record.record_type}")
    return record


def get_health_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
) -> Optional[HealthRecord]:
    """Retrieves a single health record enforcing user ownership in query."""
    return (
        db.query(HealthRecord)
        .filter(
            HealthRecord.id == record_id,
            HealthRecord.user_id == user_id,
        )
        .first()
    )


def list_health_records(
    db: Session,
    user_id: uuid.UUID,
    page: int = 1,
    page_size: int = 20,
) -> Tuple[List[HealthRecord], int]:
    """Retrieves paginated health records scoped to the user, ordered by recorded_at desc."""
    page = max(1, page)
    page_size = max(1, min(page_size, 100))  # Max page_size cap = 100

    query = db.query(HealthRecord).filter(HealthRecord.user_id == user_id)
    total = query.count()

    items = (
        query.order_by(HealthRecord.recorded_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return items, total


def delete_health_record(
    db: Session,
    user_id: uuid.UUID,
    record_id: uuid.UUID,
) -> bool:
    """Deletes a health record enforcing user ownership in query."""
    record = get_health_record(db, user_id=user_id, record_id=record_id)
    if not record:
        return False

    db.delete(record)
    db.commit()
    logger.info(f"Health record deleted: record_id={record_id}, user_id={user_id}")
    return True
