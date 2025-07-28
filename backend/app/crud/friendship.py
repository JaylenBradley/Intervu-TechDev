from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from app.models.friendship import Friendship
from app.models.user import User
from app.schemas.friendship import FriendshipCreate, UserSearchResponse

def create_friendship(db: Session, follower_id: int, following_id: int):
    """Create a new friendship (follow relationship)"""
    if follower_id == following_id:
        return None  # Can't follow yourself
    
    # Check if friendship already exists
    existing = db.query(Friendship).filter(
        and_(Friendship.follower_id == follower_id, Friendship.following_id == following_id)
    ).first()
    
    if existing:
        return existing  # Already following
    
    friendship = Friendship(follower_id=follower_id, following_id=following_id)
    db.add(friendship)
    db.commit()
    db.refresh(friendship)
    return friendship

def delete_friendship(db: Session, follower_id: int, following_id: int):
    """Delete a friendship (unfollow)"""
    friendship = db.query(Friendship).filter(
        and_(Friendship.follower_id == follower_id, Friendship.following_id == following_id)
    ).first()
    
    if friendship:
        db.delete(friendship)
        db.commit()
        return True
    return False

def get_followers(db: Session, user_id: int):
    """Get users who follow the given user"""
    followers = db.query(User).join(Friendship, User.id == Friendship.follower_id).filter(
        Friendship.following_id == user_id
    ).all()
    return followers

def get_following(db: Session, user_id: int):
    """Get users that the given user follows"""
    following = db.query(User).join(Friendship, User.id == Friendship.following_id).filter(
        Friendship.follower_id == user_id
    ).all()
    return following

def search_users(db: Session, current_user_id: int, search_term: str = "", career_goal: str = "", limit: int = 20):
    """Search for users by username or name and optionally filter by career goal"""
    query = db.query(User).filter(User.id != current_user_id)  # Exclude current user
    
    if search_term:
        query = query.filter(
            or_(
                User.username.ilike(f"%{search_term}%"),
                User.name.ilike(f"%{search_term}%")
            )
        )
    
    if career_goal:
        query = query.filter(User.career_goal == career_goal)
    
    users = query.limit(limit).all()
    
    # Get current user's following list to mark who they're already following
    following_ids = set()
    following = get_following(db, current_user_id)
    for user in following:
        following_ids.add(user.id)
    
    # Convert to response format
    result = []
    for user in users:
        result.append(UserSearchResponse(
            id=user.id,
            username=user.username,
            name=user.name,
            avatar=user.avatar,
            career_goal=user.career_goal,
            is_following=user.id in following_ids
        ))
    
    return result

def is_following(db: Session, follower_id: int, following_id: int):
    """Check if one user is following another"""
    friendship = db.query(Friendship).filter(
        and_(Friendship.follower_id == follower_id, Friendship.following_id == following_id)
    ).first()
    return friendship is not None 