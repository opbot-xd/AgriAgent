from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from models.user import User
from utils.security import hash_password, verify_password, create_access_token

async def signup_user(db: AsyncSession, username: str, password: str, language: str):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if user:
        return {"error": "User already exists"}

    hashed_password = hash_password(password)
    new_user = User(username=username, password_hash=hashed_password, language_preference=language)
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    token = create_access_token({"sub": new_user.username})
    return {"access_token": token, "token_type": "bearer"}

async def login_user(db: AsyncSession, username: str, password: str):
    result = await db.execute(select(User).where(User.username == username))
    user = result.scalar_one_or_none()
    if not user or not verify_password(password, user.password_hash):
        return {"error": "Invalid credentials"}

    token = create_access_token({"sub": user.username})
    return {"access_token": token, "token_type": "bearer"}
