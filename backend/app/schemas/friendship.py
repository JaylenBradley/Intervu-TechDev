from pydantic import BaseModel
from datetime import datetime
from typing import List

class FriendshipBase(BaseModel):
    follower_id: int
    following_id: int

class FriendshipCreate(FriendshipBase):
    pass

class FriendshipResponse(FriendshipBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

class UserSearchResponse(BaseModel):
    id: int
    username: str
    name: str | None = None
    avatar: str | None = None
    career_goal: str | None = None
    is_following: bool = False

    class Config:
        from_attributes = True

class FollowersResponse(BaseModel):
    followers: List[UserSearchResponse]
    following: List[UserSearchResponse] 