from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import SessionLocal
from app.schemas.friendship import FriendshipCreate, FriendshipResponse, UserSearchResponse, FollowersResponse
from app.crud.friendship import (
    create_friendship, 
    delete_friendship, 
    get_followers, 
    get_following, 
    search_users,
    is_following
)
from app.schemas.user import UserResponse
from app.models.user import User
from sqlalchemy import distinct

router = APIRouter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/career-goals")
def get_all_career_goals(db: Session = Depends(get_db)):
    """Get all unique career goals from the database"""
    try:
        # Get distinct career goals that are not null or empty
        career_goals = db.query(distinct(User.career_goal)).filter(
            User.career_goal.isnot(None),
            User.career_goal != ""
        ).all()
        
        # Extract the career goals from the result
        goals = [goal[0] for goal in career_goals if goal[0]]
        
        return {"career_goals": goals}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch career goals: {str(e)}")

@router.post("/friendship", response_model=FriendshipResponse)
def follow_user(friendship: FriendshipCreate, db: Session = Depends(get_db)):
    """Follow a user"""
    if friendship.follower_id == friendship.following_id:
        raise HTTPException(status_code=400, detail="Cannot follow yourself")
    
    result = create_friendship(db, friendship.follower_id, friendship.following_id)
    if not result:
        raise HTTPException(status_code=400, detail="Already following this user")
    
    return result

@router.delete("/friendship/{follower_id}/{following_id}")
def unfollow_user(follower_id: int, following_id: int, db: Session = Depends(get_db)):
    """Unfollow a user"""
    success = delete_friendship(db, follower_id, following_id)
    if not success:
        raise HTTPException(status_code=404, detail="Friendship not found")
    return {"detail": "Unfollowed successfully"}

@router.get("/users/search", response_model=list[UserSearchResponse])
def search_users_endpoint(
    current_user_id: int = Query(..., description="Current user ID"),
    search_term: str = Query("", description="Search term for username or name"),
    career_goal: str = Query("", description="Filter by career goal"),
    limit: int = Query(20, description="Maximum number of results")
):
    """Search for users to follow"""
    db = next(get_db())
    try:
        return search_users(db, current_user_id, search_term, career_goal, limit)
    finally:
        db.close()

@router.get("/friendship/{user_id}/followers", response_model=list[UserResponse])
def get_user_followers(user_id: int, db: Session = Depends(get_db)):
    """Get users who follow the given user"""
    followers = get_followers(db, user_id)
    return followers

@router.get("/friendship/{user_id}/following", response_model=list[UserResponse])
def get_user_following(user_id: int, db: Session = Depends(get_db)):
    """Get users that the given user follows"""
    following = get_following(db, user_id)
    return following

@router.get("/friendship/{follower_id}/following/{following_id}")
def check_following_status(follower_id: int, following_id: int, db: Session = Depends(get_db)):
    """Check if one user is following another"""
    is_following_user = is_following(db, follower_id, following_id)
    return {"is_following": is_following_user} 