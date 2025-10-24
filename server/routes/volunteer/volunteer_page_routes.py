from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
from jose import JWTError
from datetime import datetime

from models.schemas import Volunteer, Team, Event
from db import (
    event_collection,
    team_collection
)
from utils.helpers import require_admin_or_volunteer
from utils.auth import create_volunteer_token, verify_volunteer_token

router = APIRouter(
    prefix="/api/volunteer",
    tags=["Volunteer"]
)

security = HTTPBearer()

# --- Models ---
class VolunteerEventAuth(BaseModel):
    event_id: str
    secret_code: str

class QRScanRequest(BaseModel):
    team_id: str


# --- Routes ---

def init_collections(ec, tc):
    global event_collection
    event_collection = ec

    global team_collection
    team_collection = tc

@router.post("/authorize")
async def authorize_volunteer(
    data: VolunteerEventAuth,
    request: Request,
    user=Depends(require_admin_or_volunteer)
):
    """
    Authorize a logged-in volunteer for an event using secret code.
    Returns a short-lived JWT token bound to that event.
    """
    email = user["email"]  # coming from Redis session (require_admin_or_volunteer)
    role = user["role"]

    event = await event_collection.find_one({"event_id": data.event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    if data.secret_code != event.get("secret_code"):
        raise HTTPException(status_code=401, detail="Invalid secret code")

    # ✅ Generate token for this volunteer
    token = create_volunteer_token(email, data.event_id)

    return {
        "message": f"Authorization successful for event '{event['event_name']}'",
        "volunteer_email": email,
        "role": role,
        "token": token
    }


@router.post("/scan")
async def scan_qr(
    data: QRScanRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
    user=Depends(require_admin_or_volunteer)
):
    """
    Scans team QR (containing team_id). JWT in header proves event authorization.
    """
    token = credentials.credentials
    payload = verify_volunteer_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid or expired event token")

    event_id = payload["event_id"]
    volunteer_email = payload["sub"]

    # Verify event exists
    event = await event_collection.find_one({"event_id": event_id})
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")

    team = await team_collection.find_one({"team_id": data.team_id})
    if not team:
        raise HTTPException(status_code=404, detail="Team not found")

    if event.get("expired"):
        raise HTTPException(status_code=400, detail="Event expired")

    if event_id in team.get("events_participated", []):
        raise HTTPException(status_code=400, detail="Team already participated in this event")

    # Update team’s points and participation
    new_points = team.get("points", 0) + event.get("points", 0)
    team_collection.update_one(
        {"team_id": data.team_id},
        {"$set": {"points": new_points}, "$push": {"events_participated": event_id}}
    )

    # Increment event’s participant count
    event_collection.update_one({"event_id": event_id}, {"$inc": {"participants": 1}})

    return {
        "message": f"✅ Team '{team['team_name']}' successfully scanned for event '{event['event_name']}'",
        "volunteer": volunteer_email,
        "points_awarded": event["points"],
        "team_points": new_points
    }
