from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["synergy"]

event_collection = db["events"]
team_collection = db["teams"]
volunteer_collection = db["volunteers"]
admin_collection = db["admins"]

from config import APP_NAME, CLUSTER_NAME, DATABASE_NAME, MONGODB_PASSWORD, MONGODB_USERNAME
from motor.motor_asyncio import AsyncIOMotorClient


MONGO_URI = f"mongodb+srv://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{CLUSTER_NAME}.mongodb.net/?retryWrites=true&w=majority&appName={APP_NAME}"

client = AsyncIOMotorClient(MONGO_URI)
db = client[DATABASE_NAME]
volunteer_collection = db.volunteers
user_collection = db.users
event_collection = db.events
