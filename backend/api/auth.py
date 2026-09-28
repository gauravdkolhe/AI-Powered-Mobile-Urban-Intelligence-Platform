"""
MargaDrishti (मार्गदृष्टि) - Authentication & Role-Based Access Control API
Provides department officer identity, credentials, and switching between:
- TRANSPORT_OPERATOR (Public Transport Fleet)
- TRAFFIC_DEPT (Traffic Police / Traffic Management)
- MUNICIPAL_CORP (Brihanmumbai Municipal Corporation - BMC)
- PWD (Public Works Department)
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from ..database import get_db
from ..models import User
from ..schemas import UserSchema, UserLoginSchema

router = APIRouter(prefix="/api/auth", tags=["Authentication & RBAC"])

@router.get("/users", response_model=List[UserSchema])
def list_department_users(db: Session = Depends(get_db)):
    """
    Returns available department officers representing the 4 core roles
    for quick selection and role-based switching in the dashboard.
    """
    users = db.query(User).all()
    return users

@router.post("/login", response_model=UserSchema)
def login_as_user(payload: UserLoginSchema, db: Session = Depends(get_db)):
    """
    Logs in or activates the session as a specific department officer.
    """
    user = db.query(User).filter(User.user_id == payload.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"User {payload.user_id} not found")
    return user

@router.get("/role/{role}", response_model=UserSchema)
def get_user_by_role(role: str, db: Session = Depends(get_db)):
    """
    Returns the primary representative user for a given department role.
    """
    user = db.query(User).filter(User.role == role.upper()).first()
    if not user:
        raise HTTPException(status_code=404, detail=f"No user found with role {role}")
    return user
