"""create health_profiles and daily_checkins tables

Revision ID: 007_create_health_profiles_and_checkins
Revises: 006_add_gender_and_cycle_logs
Create Date: 2026-08-16

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '007_create_health_profiles_and_checkins'
down_revision: Union[str, None] = '006_add_gender_and_cycle_logs'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Create health_profiles table
    op.create_table(
        'health_profiles',
        sa.Column('id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('date_of_birth', sa.Date(), nullable=True),
        sa.Column('gender', sa.String(length=50), nullable=True),
        sa.Column('height_cm', sa.Float(), nullable=True),
        sa.Column('weight_kg', sa.Float(), nullable=True),
        sa.Column('health_conditions', sa.JSON(), nullable=True),
        sa.Column('health_goals', sa.JSON(), nullable=True),
        sa.Column('medications', sa.JSON(), nullable=True),
        sa.Column('supplements', sa.JSON(), nullable=True),
        sa.Column('cycle_tracking_enabled', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('onboarding_completed', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id')
    )
    op.create_index(op.f('ix_health_profiles_id'), 'health_profiles', ['id'], unique=False)
    op.create_index(op.f('ix_health_profiles_user_id'), 'health_profiles', ['user_id'], unique=True)

    # 2. Create daily_checkins table
    op.create_table(
        'daily_checkins',
        sa.Column('id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('checkin_date', sa.Date(), nullable=False),
        sa.Column('mood', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('energy', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('stress', sa.Integer(), nullable=False, server_default='3'),
        sa.Column('sleep_hours', sa.Float(), nullable=True),
        sa.Column('sleep_quality', sa.String(length=50), nullable=True),
        sa.Column('exercise_minutes', sa.Integer(), nullable=True),
        sa.Column('water_intake_ml', sa.Integer(), nullable=True),
        sa.Column('symptoms', sa.JSON(), nullable=True),
        sa.Column('notes', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('user_id', 'checkin_date', name='uq_user_checkin_date')
    )
    op.create_index(op.f('ix_daily_checkins_id'), 'daily_checkins', ['id'], unique=False)
    op.create_index(op.f('ix_daily_checkins_user_id'), 'daily_checkins', ['user_id'], unique=False)
    op.create_index(op.f('ix_daily_checkins_checkin_date'), 'daily_checkins', ['checkin_date'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_daily_checkins_checkin_date'), table_name='daily_checkins')
    op.drop_index(op.f('ix_daily_checkins_user_id'), table_name='daily_checkins')
    op.drop_index(op.f('ix_daily_checkins_id'), table_name='daily_checkins')
    op.drop_table('daily_checkins')

    op.drop_index(op.f('ix_health_profiles_user_id'), table_name='health_profiles')
    op.drop_index(op.f('ix_health_profiles_id'), table_name='health_profiles')
    op.drop_table('health_profiles')
