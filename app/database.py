from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

db = SQLAlchemy()

# Create the engine using the same URI as Flask
DATABASE_URI = 'postgresql://postgres:postgres@db:5432/flaskdb'
engine = create_engine(DATABASE_URI)

# Create SessionLocal for background tasks
SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def init_db(app):
    db.init_app(app)
