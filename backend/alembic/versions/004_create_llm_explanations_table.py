"""create llm_explanations table

Revision ID: 004_create_llm_explanations_table
Revises: 003_create_ml_analysis_table
Create Date: 2026-08-16

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '004_create_llm_explanations_table'
down_revision: Union[str, None] = '003_create_ml_analysis_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'llm_explanations',
        sa.Column('id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('analysis_id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='completed'),
        sa.Column('model', sa.String(length=100), nullable=False, server_default='gpt-4o-mini'),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('details', sa.JSON(), nullable=False),
        sa.Column('limitations', sa.JSON(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['analysis_id'], ['ml_analyses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_llm_explanations_id'), 'llm_explanations', ['id'], unique=False)
    op.create_index(op.f('ix_llm_explanations_user_id'), 'llm_explanations', ['user_id'], unique=False)
    op.create_index(op.f('ix_llm_explanations_analysis_id'), 'llm_explanations', ['analysis_id'], unique=False)
    op.create_index(op.f('ix_llm_explanations_status'), 'llm_explanations', ['status'], unique=False)
    op.create_index('ix_llm_explanations_user_created', 'llm_explanations', ['user_id', 'created_at'], unique=False)
    op.create_index('ix_llm_explanations_user_analysis', 'llm_explanations', ['user_id', 'analysis_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_llm_explanations_user_analysis', table_name='llm_explanations')
    op.drop_index('ix_llm_explanations_user_created', table_name='llm_explanations')
    op.drop_index(op.f('ix_llm_explanations_status'), table_name='llm_explanations')
    op.drop_index(op.f('ix_llm_explanations_analysis_id'), table_name='llm_explanations')
    op.drop_index(op.f('ix_llm_explanations_user_id'), table_name='llm_explanations')
    op.drop_index(op.f('ix_llm_explanations_id'), table_name='llm_explanations')
    op.drop_table('llm_explanations')
