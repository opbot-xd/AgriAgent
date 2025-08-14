from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from schemas.user import UserCreate, UserLogin, TokenResponse
from services.auth_service import signup_user, login_user
from database import get_db
from fastapi import APIRouter

router = APIRouter(tags=["Auth"])

@router.post("/signup", response_model=TokenResponse)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
  
    result = await signup_user(db, user.username, user.password, user.language_preference)
    
    if "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result

@router.post("/login", response_model=TokenResponse)
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    result = await login_user(db, user.username, user.password)
    if "error" in result:
        raise HTTPException(status_code=401, detail=result["error"])
    return result
