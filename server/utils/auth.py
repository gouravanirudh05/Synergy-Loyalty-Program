from jose import jwt, JWTError
from datetime import datetime, timedelta
from config import SECRET_KEY

ALGORITHM = "HS256"
TOKEN_EXPIRE_MINUTES = 60

def create_volunteer_token(volunteer_email: str, event_id: str):
    payload = {
        "sub": volunteer_email,
        "event_id": event_id,
        "exp": datetime.utcnow() + timedelta(minutes=TOKEN_EXPIRE_MINUTES)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_volunteer_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload  # {sub: email, event_id: ...}
    except JWTError:
        return None
