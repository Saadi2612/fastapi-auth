from fastapi import FastAPI, HTTPException, Depends, status, Form
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from passlib.context import CryptContext
from models import User
from database import SessionLocal
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

app = FastAPI()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

secret_key = os.getenv("SECRET_KEY")

SECRET_KEY = secret_key
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 2*60


class UserCreate(BaseModel):
    name: str
    email: str
    password: str
    

def get_user_by_email(db, email: str):
    # print("getting user....")
    return db.query(User).filter(User.email == email).first()


def create_user(db, user: UserCreate):
    # print("Creating user...")
    # print(db, user)
    hashed_password = pwd_context.hash(user.password)
    db_user = User(name=user.name, email=user.email.lower(), hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/register")
async def register(user: UserCreate, db: Session = Depends(get_db)):
    try:
        # print("Register endpoint called with user: ", user)
        db_user = get_user_by_email(db, user.email.lower())
        if db_user:
            raise HTTPException(status_code=400, detail="This email is already registered.")
        created_user = create_user(db, user)
        # print("User created: ", created_user)
        return {"message": "Registration successful!.", "user": created_user}
    except HTTPException as e:
        # print("HTTPException occurred: ", e)
        raise e
    except Exception as e:
        # print("Error occurred: ", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not pwd_context.verify(password, user.hashed_password):
        return False
    return user

def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


class OAuth2EmailPasswordRequestForm:
    def __init__(self, email: str = Form(), password: str = Form()):
        self.email = email
        self.password = password

@app.post("/login")
async def login(form_data: OAuth2EmailPasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    # print("Login endpoint called with form_data: ", form_data)
    user = get_user_by_email(db, form_data.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid email")
    
    if not pwd_context.verify(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid password")
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data={"sub": user.email}, expires_delta=access_token_expires)

    return {"access_token": access_token, "token_type": "bearer", "message": "Login successful!"}

@app.post("/get-user-from-token")
async def get_user_from_token(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    verification = verify_token(token)
    payload = verification["payload"]
    status = verification["status"]
    if status:
        user = get_user_by_email(db, payload["sub"])
        if user:
            return {
                "id": user.id,
                "name": user.name,
                "email": user.email,
            }
        else:
            return {"message": "User not found"}
    else:
        return {"message": "Invalid token"}

def verify_token(token: str = Depends(oauth2_scheme)):
    # print(token)
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=403, detail="Invalid or expired token")
        return {"status": True, "payload": payload}

    except JWTError:
        raise HTTPException(status_code=403, detail="Invalid or expired token")


@app.get("/verify-token/{token}")
async def verify_user_token(token: str, db: Session = Depends(get_db)):
    verification = verify_token(token)
    status = verification["status"]
    if status:
        return {"message": "Token is valid", "status": True}
