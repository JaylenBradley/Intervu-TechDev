from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    email: EmailStr
    login_method: str
    career_goal: str | None = None
    questionnaire_completed: bool = False

class UserCreate(UserBase):
    firebase_id: str

class UserResponse(UserBase):
    id: int
    firebase_id: str

    class Config:
        orm_mode = True