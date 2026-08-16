"""create ml_analyses table

Revision ID: 003_create_ml_analysis_table
Revises: 002_create_health_records_table
Create Date: 2026-08-16

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '003_create_ml_analysis_table'
down_revision: Union[str, None] = '002_create_health_records_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'ml_analyses',
        sa.Column('id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('health_record_id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='completed'),
        sa.Column('model_version', sa.String(length=100), nullable=False, server_default='development-placeholder'),
        sa.Column('result', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['health_record_id'], ['health_records.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_ml_analyses_id'), 'ml_analyses', ['id'], unique=False)
    op.create_index(op.f('ix_ml_analyses_user_id'), 'ml_analyses', ['user_id'], unique=False)
    op.create_index(op.f('ix_ml_analyses_health_record_id'), 'ml_analyses', ['health_record_id'], unique=False)
    op.create_index(op.f('ix_ml_analyses_status'), 'ml_analyses', ['status'], unique=False)
    op.create_index('ix_ml_analyses_user_created', 'ml_analyses', ['user_id', 'created_at'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_ml_analyses_user_created', table_name='ml_analyses')
    op.drop_index(op.f('ix_ml_analyses_status'), table_name='ml_analyses')
    op.drop_index(op.f('ix_ml_analyses_health_record_id'), table_name='ml_analyses')
    op.drop_index(op.f('ix_ml_analyses_user_id'), table_name='ml_analyses')
    op.drop_index(op.f('ix_ml_analyses_id'), table_name='ml_analyses')
    op.drop_table('ml_analyses')
