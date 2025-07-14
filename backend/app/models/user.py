from sqlalchemy import Column, String, Integer
from app.core.database import Base

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    firebase_id = Column(String, unique=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    login_method = Column(String, nullable=False)
<<<<<<< HEAD
    career_goal = Column(String, nullable=True)
=======
>>>>>>> 8a1cf5ad29a66954c473bf180408282888c2e607
