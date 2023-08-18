"""empty message

Revision ID: 598c2214c9f0
Revises: 23d75fd54898
Create Date: 2023-08-17 09:09:56.468683

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '598c2214c9f0'
down_revision = '23d75fd54898'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('integrations',
    sa.Column('id', sa.String(length=80), nullable=False),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('deleted_date', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('id')
    )
    with op.batch_alter_table('integrations', schema=None) as batch_op:
        batch_op.create_index(batch_op.f('ix_integrations_deleted_date'), ['deleted_date'], unique=False)

    with op.batch_alter_table('companies', schema=None) as batch_op:
        batch_op.drop_column('customer_id')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('phone', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('is_active', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('email_confirmed_datetime', sa.DateTime(), nullable=True))
        batch_op.add_column(sa.Column('birthday', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('gender', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('company_id', sa.BigInteger(), nullable=True))
        batch_op.add_column(sa.Column('password', sa.String(), nullable=True))
        batch_op.alter_column('id',
               existing_type=sa.INTEGER(),
               type_=sa.BigInteger(),
               existing_nullable=False,
               autoincrement=True)
        batch_op.create_foreign_key(None, 'companies', ['company_id'], ['id'])
        batch_op.drop_column('org_id')

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('org_id', sa.BIGINT(), autoincrement=False, nullable=True))
        batch_op.drop_constraint(None, type_='foreignkey')
        batch_op.alter_column('id',
               existing_type=sa.BigInteger(),
               type_=sa.INTEGER(),
               existing_nullable=False,
               autoincrement=True)
        batch_op.drop_column('password')
        batch_op.drop_column('company_id')
        batch_op.drop_column('gender')
        batch_op.drop_column('birthday')
        batch_op.drop_column('email_confirmed_datetime')
        batch_op.drop_column('is_active')
        batch_op.drop_column('phone')

    with op.batch_alter_table('companies', schema=None) as batch_op:
        batch_op.add_column(sa.Column('customer_id', sa.VARCHAR(length=50), autoincrement=False, nullable=True))

    with op.batch_alter_table('integrations', schema=None) as batch_op:
        batch_op.drop_index(batch_op.f('ix_integrations_deleted_date'))

    op.drop_table('integrations')
    # ### end Alembic commands ###
