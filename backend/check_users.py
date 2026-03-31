from sqlmodel import Session, select
from models import User, engine

with Session(engine) as session:
    users = session.exec(select(User)).all()
    if users:
        for u in users:
            print(f"User: {u.username} (ID: {u.id})")
    else:
        print("No users found.")
