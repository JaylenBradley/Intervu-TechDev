import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv('DATABASE_URL')

engine = create_engine(DATABASE_URL, echo=True, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()




# import os
# import sqlite3
# from dotenv import load_dotenv
# load_dotenv()
# # Database
# DB_PATH = os.getenv('DB_PATH')
# def init_db():
#     conn = sqlite3.connect(DB_PATH)
#     c = conn.cursor()
#     c.execute("""
#       CREATE TABLE IF NOT EXISTS raw_resume (
#         id INTEGER PRIMARY KEY,
#         file_path TEXT NOT NULL,
#         content TEXT NOT NULL
#       )
#     """)
#     conn.commit()
#     #creates table for questionnaire too
#     c.execute("""
#       CREATE TABLE IF NOT EXISTS questionnaire (
#         user_id                TEXT    PRIMARY KEY,
#         career_goal            TEXT,
#         major                  TEXT,
#         education_level        TEXT,
#         passions               TEXT,
#         institution            TEXT,
#         target_companies       TEXT,
#         skills                 TEXT,
#         certifications         TEXT,
#         projects               TEXT,
#         experience             TEXT,
#         timeline               TEXT,
#         learning_preference    TEXT,
#         available_hours_per_week TEXT
#       )
#     """)
#     conn.commit()
#     conn.close()