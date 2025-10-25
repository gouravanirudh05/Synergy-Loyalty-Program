from typing import List, Optional
from pydantic import BaseModel, Field
from datetime import datetime

class User(BaseModel):
    name: str
    email: str
    rollNumber: str
    role:str

class Team(BaseModel):
    team_id: str
    team_name: str
    members: List[User] = Field(default_factory=list)
    points: int = 0
    events_participated: List[str] = Field(default_factory=list)
    
class Event(BaseModel):
    event_id: str
    event_name: str
    points: int
    secret_code: str
    expired: bool = False
    participants: int = 0
    created_at: Optional[datetime] = None
    created_by: Optional[str] = None
    updated_at: Optional[datetime] = None
    updated_by: Optional[str] = None

class EventCreate(BaseModel):
    event_name: str
    points: int
    secret_code:str

class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    points: Optional[int] = None
    expired: Optional[bool] = None

class Volunteer(BaseModel):
    rollNumber: str
    name: str
    email: str
    added_at: Optional[datetime] = None
    added_by: Optional[str] = None

class VolunteerCreate(BaseModel):
    rollNumber: str
    name: str
    email: str
