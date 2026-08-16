"""create recommendations table

Revision ID: 005_create_recommendations_table
Revises: 004_create_llm_explanations_table
Create Date: 2026-08-16

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

revision: str = '005_create_recommendations_table'
down_revision: Union[str, None] = '004_create_llm_explanations_table'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        'recommendations',
        sa.Column('id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('user_id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('analysis_id', sa.Uuid(as_uuid=True), nullable=False),
        sa.Column('category', sa.String(length=50), nullable=False, server_default='general_wellness'),
        sa.Column('priority', sa.String(length=20), nullable=False, server_default='low'),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=False),
        sa.Column('action', sa.Text(), nullable=False),
        sa.Column('rationale', sa.Text(), nullable=False),
        sa.Column('status', sa.String(length=50), nullable=False, server_default='active'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['analysis_id'], ['ml_analyses.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_recommendations_id'), 'recommendations', ['id'], unique=False)
    op.create_index(op.f('ix_recommendations_user_id'), 'recommendations', ['user_id'], unique=False)
    op.create_index(op.f('ix_recommendations_analysis_id'), 'recommendations', ['analysis_id'], unique=False)
    op.create_index(op.f('ix_recommendations_category'), 'recommendations', ['category'], unique=False)
    op.create_index(op.f('ix_recommendations_status'), 'recommendations', ['status'], unique=False)
    op.create_index('ix_recommendations_user_created', 'recommendations', ['user_id', 'created_at'], unique=False)
    op.create_index('ix_recommendations_user_analysis', 'recommendations', ['user_id', 'analysis_id'], unique=False)


def downgrade() -> None:
    op.drop_index('ix_recommendations_user_analysis', table_name='recommendations')
    op.drop_index('ix_recommendations_user_created', table_name='recommendations')
    op.drop_index(op.f('ix_recommendations_status'), table_name='recommendations')
    op.drop_index(op.f('ix_recommendations_category'), table_name='recommendations')
    op.drop_index(op.f('ix_recommendations_analysis_id'), table_name='recommendations')
    op.drop_index(op.f('ix_recommendations_user_id'), table_name='recommendations')
    op.drop_index(op.f('ix_recommendations_id'), table_name='recommendations')
    op.drop_table('recommendations')
