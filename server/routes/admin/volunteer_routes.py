from fastapi import APIRouter, HTTPException, Request, Depends
from fastapi.responses import JSONResponse
from models.schemas import VolunteerCreate
from utils.helpers import serialize_datetime_fields, require_admin, require_admin_or_volunteer

router = APIRouter(prefix="/api/volunteers", tags=["Volunteers"])
volunteer_collection = None

def init_collections(vc):
    global volunteer_collection
    volunteer_collection = vc

@router.post("")
async def add_volunteer(volunteer_data: VolunteerCreate, admin_user: dict = Depends(require_admin)):
    if await volunteer_collection.find_one({"rollNumber": volunteer_data.rollNumber}):
        raise HTTPException(status_code=400, detail="Volunteer already exists")

    volunteer = volunteer_data.dict()
    result = await volunteer_collection.insert_one(volunteer)
    volunteer["_id"] = str(result.inserted_id)
    return {"message": "Volunteer added", "volunteer": serialize_datetime_fields(volunteer)}

@router.get("")
async def list_volunteers(user: dict = Depends(require_admin_or_volunteer)):
    volunteers = []
    async for v in volunteer_collection.find():
        v["_id"] = str(v["_id"])
        volunteers.append(serialize_datetime_fields(v))
    return {"volunteers": volunteers}
