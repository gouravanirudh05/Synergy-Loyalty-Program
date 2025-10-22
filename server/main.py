from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from middleware.session_config import setup_sessions
from database.connection import connect_mongo
from config import FRONTEND_URL
from routes.auth import auth_routes
from routes.admin import event_routes, volunteer_routes
from routes.volunteer import volunteer_page_routes

# Initialize app
app = FastAPI(title="Synergy Loyalty Program API")

# --- CORS ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

# --- Sessions ---
setup_sessions(app)

# --- MongoDB ---
db_collections = connect_mongo()
event_collection = db_collections["event_collection"]
volunteer_collection = db_collections["volunteer_collection"]
user_collection = db_collections["user_collection"]

# Pass collections to routes
auth_routes.init_collections(volunteer_collection)
event_routes.init_collections(event_collection)
volunteer_routes.init_collections(volunteer_collection)

# --- Include routers ---
app.include_router(auth_routes.router)
app.include_router(event_routes.router)
app.include_router(volunteer_routes.router)
app.include_router(volunteer_page_routes.router)

# --- Health Check ---
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "message": "Server running"}
