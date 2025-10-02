from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.responses import RedirectResponse, JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from authlib.integrations.starlette_client import OAuth
import redis
from starlette_session import SessionMiddleware
from starlette_session.backends import BackendType
from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Optional
from pydantic import BaseModel
import uuid
from datetime import datetime
import httpx
import json

# Import configurations and models
from config import (
    CLIENT_ID, CLIENT_SECRET,SESSION_SECRET_KEY, ADMIN_EMAIL,REDIS_URL,
    FRONTEND_URL, MONGODB_USERNAME, MONGODB_PASSWORD, CLUSTER_NAME,
    DATABASE_NAME, APP_NAME
)
from models import User, Event, Volunteer

''' The backend API Endpoints setup '''

app = FastAPI()

# --- CORS Configuration ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        FRONTEND_URL
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

if not SESSION_SECRET_KEY:
    raise ValueError("SESSION_SECRET_KEY environment variable not set!")

if REDIS_URL:
    redis_client = redis.from_url(REDIS_URL)
    app.add_middleware(
        SessionMiddleware,
        cookie_name="session_id",
        secret_key=SESSION_SECRET_KEY,
        backend_type=BackendType.redis,
        backend_client=redis_client,
        https_only=True,
        same_site="lax"
    )
else:
    app.add_middleware(
        SessionMiddleware, 
        cookie_name="session_id",
        secret_key=SESSION_SECRET_KEY
    )

# --- MongoDB Connection ---
try:
    # Debug: Print the connection details (without password)
    print(f"Attempting MongoDB connection...")
    print(f"Cluster Name: {CLUSTER_NAME}")
    print(f"Database Name: {DATABASE_NAME}")
    print(f"App Name: {APP_NAME}")
    print(f"Username: {MONGODB_USERNAME}")
    
    MONGO_URI = f"mongodb+srv://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{CLUSTER_NAME}.mongodb.net/?retryWrites=true&w=majority&appName={APP_NAME}"
    
    # Test DNS resolution with multiple approaches
    import socket
    hostname = f"{CLUSTER_NAME}.mongodb.net"
    
    print(f"Testing DNS resolution for: {hostname}")
    
    # Try different DNS resolution methods
    dns_success = False
    
    try:
        # Method 1: Standard DNS lookup
        ip = socket.gethostbyname(hostname)
        print(f"✅ Standard DNS resolution successful: {hostname} -> {ip}")
        dns_success = True
    except socket.gaierror as dns_error:
        print(f"❌ Standard DNS resolution failed: {dns_error}")
        
        # Method 2: Try with timeout
        try:
            socket.setdefaulttimeout(10)
            ip = socket.gethostbyname(hostname)
            print(f"✅ DNS resolution with timeout successful: {hostname} -> {ip}")
            dns_success = True
        except socket.gaierror as dns_error2:
            print(f"❌ DNS resolution with timeout also failed: {dns_error2}")
    
    if not dns_success:
        print("\n🚨 DNS RESOLUTION TROUBLESHOOTING:")
        print("1. Check if you're behind a corporate firewall/proxy")
        print("2. Try using a different DNS server (8.8.8.8 or 1.1.1.1)")
        print("3. Check if MongoDB Atlas is accessible from your network")
        print("4. Verify the cluster name in MongoDB Atlas dashboard")
        print("\n⚠️  Continuing without DNS verification - connection may still work...")
        # Don't raise exception - let MongoDB driver handle it
    
    client = AsyncIOMotorClient(MONGO_URI)
    db = client[DATABASE_NAME]
    volunteer_collection = db.volunteers
    user_collection = db.users
    event_collection = db.events
    print("MongoDB connection initialized successfully")
except Exception as mongo_e:
    print(f"MongoDB connection error: {mongo_e}")
    # Initialize collections as None - the app will handle this gracefully
    client = None
    db = None
    volunteer_collection = None
    event_collection = None


# --- Request Models ---
class EventCreate(BaseModel):
    event_name: str
    points: int

class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    points: Optional[int] = None
    expired: Optional[bool] = None

class VolunteerCreate(BaseModel):
    rollNumber: str
    name: str
    email: str

# --- Helper Functions ---
def serialize_datetime_fields(obj):
    """Convert datetime objects in a dictionary to ISO format strings"""
    if isinstance(obj, dict):
        result = {}
        for key, value in obj.items():
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, dict):
                result[key] = serialize_datetime_fields(value)
            elif isinstance(value, list):
                result[key] = [serialize_datetime_fields(item) if isinstance(item, dict) else item for item in value]
            else:
                result[key] = value
        return result
    return obj

async def get_current_user(request: Request):
    user = request.session.get('user')
    if not user:
        raise HTTPException(status_code=401, detail="User not authenticated")
    return user

async def require_admin(user: dict = Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")
    return user

async def require_admin_or_volunteer(user: dict = Depends(get_current_user)):
    if user.get("role") not in ["admin", "volunteer"]:
        raise HTTPException(status_code=403, detail="Admin or volunteer access required")
    return user

# --- OAuth Client Setup ---
oauth = OAuth()
oauth.register(
    name='microsoft',
    client_id=CLIENT_ID,
    client_secret=CLIENT_SECRET,
    server_metadata_url='https://login.microsoftonline.com/organizations/v2.0/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile User.Read',
        'verify_iss': False  # Disable issuer validation to handle multi-tenant
    }
)


# --- Authentication Routes ---

@app.get('/api/login')
async def login(request: Request):
    redirect_uri = request.url_for('auth')
    return await oauth.microsoft.authorize_redirect(request, redirect_uri)

@app.get('/api/auth')
async def auth(request: Request):
    try:
        code = request.query_params.get('code')
        if not code:
            return JSONResponse(status_code=400, content={"error": "No authorization code received"})
        
        token_url = "https://login.microsoftonline.com/organizations/oauth2/v2.0/token"
        
        async with httpx.AsyncClient() as client:
            token_response = await client.post(
                token_url,
                data={
                    'client_id': CLIENT_ID,
                    'client_secret': CLIENT_SECRET,
                    'code': code,
                    'grant_type': 'authorization_code',
                    'redirect_uri': str(request.url_for('auth')),
                    'scope': 'openid email profile User.Read'
                },
                headers={'Content-Type': 'application/x-www-form-urlencoded'}
            )
            
            if token_response.status_code != 200:
                print(f"Token exchange failed: {token_response.text}")
                return JSONResponse(status_code=401, content={
                    "error": "Token exchange failed", 
                    "details": token_response.text
                })
            
            token_data = token_response.json()
            access_token = token_data.get('access_token')
            
            if not access_token:
                return JSONResponse(status_code=401, content={
                    "error": "No access token received", 
                    "details": str(token_data)
                })
            
            # Get user info from Microsoft Graph API
            async with httpx.AsyncClient() as client:
                user_response = await client.get(
                    'https://graph.microsoft.com/v1.0/me',
                    headers={'Authorization': f'Bearer {access_token}'}
                )
                
                if user_response.status_code != 200:
                    return JSONResponse(status_code=401, content={
                        "error": "Failed to get user info", 
                        "details": user_response.text
                    })
                
                user_data = user_response.json()
            
            # Process user data
            email = user_data.get("mail") or user_data.get("userPrincipalName")

            if not email or not email.endswith('@iiitb.ac.in'):
                return JSONResponse(
                    status_code=403,
                    content={"error": "Access Denied: Only users with an 'iiitb.ac.in' email can log in."}
                )
            
            name = user_data.get("displayName")
            roll_number = user_data.get("employeeId", "N/A")
            
            role = "participant"
            if email.lower() == ADMIN_EMAIL.lower():
                role = "admin"
            else:
                try:
                    is_volunteer = await volunteer_collection.find_one({"rollNumber": roll_number})
                    if is_volunteer:
                        role = "volunteer"
                except Exception as db_e:
                    print(f"Database error when checking volunteer status: {db_e}")
                    # Continue with default role if DB is unavailable
                    
            # --- Create final user object and store in session ---
            processed_user = {
                "name": name,
                "email": email,
                "rollNumber": roll_number,
                "role": role
            }
            request.session['user'] = processed_user

            return RedirectResponse(url=f"{FRONTEND_URL}/dashboard")
                
    except Exception as e:
        print(f"OAuth error details: {e}")
        return JSONResponse(status_code=401, content={
            "error": "Authorization failed", 
            "details": str(e),
            "error_type": type(e).__name__
        })

@app.get('/api/health')
async def health_check():
    """Simple health check endpoint"""
    return JSONResponse(content={"status": "healthy", "message": "Server is running"})

@app.get('/api/user/profile')
async def user_profile(request: Request):
    user = request.session.get('user')
    if user:
        return JSONResponse(content=user)
    return JSONResponse(status_code=401, content={"error": "User not authenticated"})

@app.get('/api/logout')
async def logout(request: Request):
    request.session.pop('user', None)
    return RedirectResponse(url=FRONTEND_URL or "/")


# --- Event Management Endpoints ---

@app.post('/api/events')
async def create_event(request: Request, event_data: EventCreate, admin_user: dict = Depends(require_admin)):
    """Create a new event (Admin only)"""
    try:
        event_id = str(uuid.uuid4())
        event = {
            "event_id": event_id,
            "event_name": event_data.event_name,
            "points": event_data.points,
            "expired": False,
            "participants": 0,
        }
        
        result = await event_collection.insert_one(event)
        if result.inserted_id:
            event["_id"] = str(result.inserted_id)
            # Serialize datetime fields
            event = serialize_datetime_fields(event)
            return JSONResponse(content={"message": "Event created successfully", "event": event})
        else:
            raise HTTPException(status_code=500, detail="Failed to create event")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating event: {str(e)}")

@app.get('/api/events')
async def get_events(request: Request, user: dict = Depends(get_current_user)):
    """Get all events"""
    if event_collection is None:
        raise HTTPException(status_code=503, detail="Database connection not available. Please check MongoDB configuration.")
    
    try:
        events = []
        async for event in event_collection.find():
            # Convert ObjectId to string
            event["_id"] = str(event["_id"])
            # Serialize datetime fields
            event = serialize_datetime_fields(event)
            events.append(event)
        return JSONResponse(content={"events": events})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching events: {str(e)}")

@app.put('/api/events/{event_id}')
async def update_event(event_id: str, event_data: EventUpdate, request: Request, admin_user: dict = Depends(require_admin)):
    """Update an existing event (Admin only)"""
    try:
        update_data = {}
        if event_data.event_name is not None:
            update_data["event_name"] = event_data.event_name
        if event_data.points is not None:
            update_data["points"] = event_data.points
        if event_data.expired is not None:
            update_data["expired"] = event_data.expired
        
        if not update_data:
            raise HTTPException(status_code=400, detail="No fields to update")
        
        update_data["updated_at"] = datetime.utcnow()
        update_data["updated_by"] = admin_user["email"]
        
        result = await event_collection.update_one(
            {"event_id": event_id},
            {"$set": update_data}
        )
        
        if result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Event not found")
        
        # Get updated event
        updated_event = await event_collection.find_one({"event_id": event_id})
        if updated_event:
            updated_event["_id"] = str(updated_event["_id"])
            # Serialize datetime fields
            updated_event = serialize_datetime_fields(updated_event)
        
        return JSONResponse(content={"message": "Event updated successfully", "event": updated_event})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating event: {str(e)}")

@app.delete('/api/events/{event_id}')
async def delete_event(event_id: str, request: Request, admin_user: dict = Depends(require_admin)):
    """Delete an event (Admin only)"""
    try:
        result = await event_collection.delete_one({"event_id": event_id})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Event not found")
        
        return JSONResponse(content={"message": "Event deleted successfully"})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error deleting event: {str(e)}")


# --- Volunteer Management Endpoints ---

@app.post('/api/volunteers')
async def add_volunteer(volunteer_data: VolunteerCreate, request: Request, admin_user: dict = Depends(require_admin)):
    """Add a new volunteer (Admin only)"""
    try:
        # Check if volunteer already exists
        existing_volunteer = await volunteer_collection.find_one({"rollNumber": volunteer_data.rollNumber})
        if existing_volunteer:
            raise HTTPException(status_code=400, detail="Volunteer with this roll number already exists")
        
        volunteer = {
            "rollNumber": volunteer_data.rollNumber,
            "name": volunteer_data.name,
            "email": volunteer_data.email,
        }
        
        result = await volunteer_collection.insert_one(volunteer)
        if result.inserted_id:
            volunteer["_id"] = str(result.inserted_id)
            # Serialize datetime fields
            volunteer = serialize_datetime_fields(volunteer)
            return JSONResponse(content={"message": "Volunteer added successfully", "volunteer": volunteer})
        else:
            raise HTTPException(status_code=500, detail="Failed to add volunteer")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error adding volunteer: {str(e)}")

@app.get('/api/volunteers')
async def get_volunteers(request: Request, user: dict = Depends(require_admin_or_volunteer)):
    """Get all volunteers (Admin and Volunteer access)"""
    try:
        volunteers = []
        async for volunteer in volunteer_collection.find():
            # Convert ObjectId to string
            volunteer["_id"] = str(volunteer["_id"])
            # Serialize datetime fields
            volunteer = serialize_datetime_fields(volunteer)
            volunteers.append(volunteer)
        return JSONResponse(content={"volunteers": volunteers})
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching volunteers: {str(e)}")

@app.delete('/api/volunteers/{roll_number}')
async def remove_volunteer(roll_number: str, request: Request, admin_user: dict = Depends(require_admin)):
    """Remove a volunteer (Admin only)"""
    try:
        result = await volunteer_collection.delete_one({"rollNumber": roll_number})
        
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Volunteer not found")
        
        return JSONResponse(content={"message": "Volunteer removed successfully"})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error removing volunteer: {str(e)}")

@app.get('/api/volunteers/{roll_number}')
async def get_volunteer(roll_number: str, request: Request, user: dict = Depends(require_admin_or_volunteer)):
    """Get a specific volunteer by roll number (Admin and Volunteer access)"""
    try:
        volunteer = await volunteer_collection.find_one({"rollNumber": roll_number})
        if not volunteer:
            raise HTTPException(status_code=404, detail="Volunteer not found")
        
        volunteer["_id"] = str(volunteer["_id"])
        return JSONResponse(content={"volunteer": volunteer})
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching volunteer: {str(e)}")