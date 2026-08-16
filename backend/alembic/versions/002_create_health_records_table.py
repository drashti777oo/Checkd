"""create health_records table

Revision ID: 002_create_health_records_table
Revises: 001_create_users_table
Create Date: 2026-08-16

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '002_create_health_records_table'
down_revision: Union[str, None] = '001_create_users_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'health_records',
        sa.Column('id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('record_type', sa.String(length=100), nullable=False),
        sa.Column('recorded_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('data', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_health_records_id'), 'health_records', ['id'], unique=False)
    op.create_index(op.f('ix_health_records_user_id'), 'health_records', ['user_id'], unique=False)
    op.create_index(op.f('ix_health_records_record_type'), 'health_records', ['record_type'], unique=False)
    op.create_index('ix_health_records_user_recorded', 'health_records', ['user_id', 'recorded_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_health_records_user_recorded', table_name='health_records')
    op.drop_index(op.f('ix_health_records_record_type'), table_name='health_records')
    op.drop_index(op.f('ix_health_records_user_id'), table_name='health_records')
    op.drop_index(op.f('ix_health_records_id'), table_name='health_records')
    op.drop_table('health_records')
