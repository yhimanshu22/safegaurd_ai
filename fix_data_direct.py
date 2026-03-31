import sqlite3

# The direct way to fix it
db_path = 'backend/database.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 1. Get all unique user_ids from posts
cursor.execute("SELECT DISTINCT user_id FROM post")
post_user_ids = {row[0] for row in cursor.fetchall()}

# 2. Get all existing user_ids from users
cursor.execute("SELECT id FROM user")
existing_user_ids = {row[0] for row in cursor.fetchall()}

missing_ids = post_user_ids - existing_user_ids
print(f"Missing IDs: {missing_ids}")

# 3. Insert placeholders for missing users
for mid in missing_ids:
    if mid is None: continue
    try:
        # We use a placeholder for hashed_password and other required fields
        cursor.execute(
            "INSERT INTO user (id, username, hashed_password, role, created_at) VALUES (?, ?, ?, ?, ?)",
            (mid, f"user_{mid}", "placeholder_hash", "user", "2026-03-31 00:00:00")
        )
        print(f"Inserted user {mid}")
    except Exception as e:
        print(f"Failed to insert user {mid}: {e}")

conn.commit()
conn.close()
print("Migration finished.")
