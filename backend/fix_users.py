from sqlmodel import Session, select
from models import Post, User, engine

with Session(engine) as session:
    # 1. Find all user_ids in Post table
    all_post_user_ids = set(session.exec(select(Post.user_id)).all())
    
    # 2. Find all existing user_ids in User table
    existing_user_ids = set(session.exec(select(User.id)).all())
    
    # 3. Find missing user_ids
    missing_user_ids = all_post_user_ids - existing_user_ids
    
    print(f"Missing user IDs found: {missing_user_ids}")
    
    # 4. Create placeholder users for each missing ID
    for mid in missing_user_ids:
        # Note: We must specify the ID explicitly to match the Post.user_id
        placeholder = User(
            id=mid,
            username=f"restored_user_{mid}",
            hashed_password="placeholder_hash",
            role="user"
        )
        session.add(placeholder)
        print(f"Created restored_user_{mid}")
    
    session.commit()
    print("Database reconciliation complete.")
