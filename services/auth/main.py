from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from manus_shared.database import get_db, engine, Base
from manus_shared.security import get_password_hash, verify_password, create_access_token
from pydantic import BaseModel

Base.metadata.create_all(bind=engine)

app = FastAPI(title="Auth Service")

class UserCreate(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    # Logic to create user in DB would go here
    return {"message": "User registered successfully"}

@app.post("/token")
def login(user: UserCreate, db: Session = Depends(get_db)):
    # Logic to verify user and return JWT would go here
    access_token = create_access_token(data={"sub": user.username})
    return {"access_token": access_token, "token_type": "bearer"}
