"""add gender to users and create cycle_logs table

Revision ID: 006_add_gender_and_cycle_logs
Revises: 005_create_recommendations_table
Create Date: 2026-08-16

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '006_add_gender_and_cycle_logs'
down_revision: Union[str, None] = '005_create_recommendations_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # 1. Add gender column to users table
    op.add_column('users', sa.Column('gender', sa.String(length=50), nullable=True))

    # 2. Create cycle_logs table
    op.create_table(
        'cycle_logs',
        sa.Column('id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('start_date', sa.Date(), nullable=False),
        sa.Column('end_date', sa.Date(), nullable=True),
        sa.Column('flow_intensity', sa.String(length=50), nullable=False, server_default='medium'),
        sa.Column('symptoms', sa.JSON(), nullable=True),
        sa.Column('notes', sa.String(length=1000), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_cycle_logs_id'), 'cycle_logs', ['id'], unique=False)
    op.create_index(op.f('ix_cycle_logs_user_id'), 'cycle_logs', ['user_id'], unique=False)
    op.create_index(op.f('ix_cycle_logs_start_date'), 'cycle_logs', ['start_date'], unique=False)


def downgrade() -> None:
    op.drop_index(op.f('ix_cycle_logs_start_date'), table_name='cycle_logs')
    op.drop_index(op.f('ix_cycle_logs_user_id'), table_name='cycle_logs')
    op.drop_index(op.f('ix_cycle_logs_id'), table_name='cycle_logs')
    op.drop_table('cycle_logs')
    op.drop_column('users', 'gender')
