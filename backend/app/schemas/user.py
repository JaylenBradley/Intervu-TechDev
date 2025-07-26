from pydantic import BaseModel, EmailStr

class UserBase(BaseModel):
    username: str
    email: EmailStr
    login_method: str
    career_goal: str | None = None
    questionnaire_completed: bool = False
    avatar: str | None = None
    name: str | None = None
    bio: str | None = None
    education: str | None = None
    linkedin: str | None = None
    github: str | None = None

class UserCreate(UserBase):
    firebase_id: str

class UserUpdate(BaseModel):
    username: str | None = None
    career_goal: str | None = None
    avatar: str | None = None
    name: str | None = None
    bio: str | None = None
    education: str | None = None
    linkedin: str | None = None
    github: str | None = None

class UserResponse(UserBase):
    id: int
    firebase_id: str

    class Config:
        orm_mode = True