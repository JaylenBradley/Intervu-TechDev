from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    email: EmailStr
    login_method: str
    career_goal: str | None = None

class UserCreate(UserBase):
    firebase_id: str
    password: str

class UserResponse(UserBase):
    id: int
    firebase_id: str

    class Config:
        orm_mode = True