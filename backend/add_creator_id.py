import sqlalchemy
from sqlalchemy import create_engine, text

DATABASE_URL = "postgresql+psycopg2://postgres:12345678@localhost:5432/team_task_manager"

engine = create_engine(DATABASE_URL)

with engine.connect() as conn:
    try:
        conn.execute(text("ALTER TABLE tasks ADD COLUMN creator_id INTEGER REFERENCES users(id) ON DELETE SET NULL;"))
        conn.commit()
        print("Successfully added creator_id column to tasks table.")
    except Exception as e:
        print(f"Error adding column: {e}")
