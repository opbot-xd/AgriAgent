from pydantic import BaseModel

class UserCreate(BaseModel):
    username: str
    password: str
    language_preference: str = "en"

class UserLogin(BaseModel):
    username: str
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
