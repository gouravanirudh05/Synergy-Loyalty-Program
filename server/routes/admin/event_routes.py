from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from datetime import datetime
import uuid
from models.schemas import EventCreate, EventUpdate
from utils.helpers import serialize_datetime_fields, get_current_user, require_admin

router = APIRouter(prefix="/api/events", tags=["Events"])
event_collection = None

def init_collections(ec):
    global event_collection
    event_collection = ec

@router.post("")
async def create_event(event_data: EventCreate, admin_user: dict = Depends(require_admin)):
    event_id = str(uuid.uuid4())
    event = {
        "event_id": event_id,
        "event_name": event_data.event_name,
        "secret_code":event_data.secret_code,
        "points": event_data.points,
        "expired": False,
        "participants": 0,
        "created_at": datetime.utcnow(),
    }
    result = await event_collection.insert_one(event)
    event["_id"] = str(result.inserted_id)
    return {"message": "Event created", "event": serialize_datetime_fields(event)}

@router.get("")
async def get_events(user: dict = Depends(get_current_user)):
    events = []
    async for e in event_collection.find():
        e["_id"] = str(e["_id"])
        events.append(serialize_datetime_fields(e))
    return {"events": events}
