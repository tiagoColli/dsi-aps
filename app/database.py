from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, scoped_session

db = SQLAlchemy()

DATABASE_URI = 'postgresql://postgres:postgres@db:5432/flaskdb'
engine = create_engine(DATABASE_URI)

SessionLocal = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

def init_db(app):
    db.init_app(app)
