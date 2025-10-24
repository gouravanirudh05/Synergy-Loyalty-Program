from fastapi import Request, HTTPException, Depends
from datetime import datetime

def serialize_datetime_fields(obj):
    if isinstance(obj, dict):
        result = {}
        for k, v in obj.items():
            if isinstance(v, datetime):
                result[k] = v.isoformat()
            elif isinstance(v, dict):
                result[k] = serialize_datetime_fields(v)
            elif isinstance(v, list):
                result[k] = [serialize_datetime_fields(i) if isinstance(i, dict) else i for i in v]
            else:
                result[k] = v
        return result
    return obj

async def get_current_user(request: Request):
    user = request.session.get("user")
    if not user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    return user

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def require_admin_or_volunteer(user: dict = Depends(get_current_user)):
    if user.get("role") not in ["admin", "volunteer"]:
        raise HTTPException(status_code=403, detail="Access denied")
    return user
