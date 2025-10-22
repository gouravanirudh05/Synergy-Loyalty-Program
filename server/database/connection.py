from motor.motor_asyncio import AsyncIOMotorClient
import socket
from config import (
    MONGODB_USERNAME, MONGODB_PASSWORD, CLUSTER_NAME,
    DATABASE_NAME, APP_NAME
)

def connect_mongo():
    """Initialize MongoDB connection and return collections."""
    try:
        hostname = f"{CLUSTER_NAME}.mongodb.net"
        print(f"Testing DNS for {hostname}")
        try:
            ip = socket.gethostbyname(hostname)
            print(f"✅ DNS resolved: {ip}")
        except Exception as e:
            print(f"⚠️ DNS resolution failed: {e}")

        uri = (
            f"mongodb+srv://{MONGODB_USERNAME}:{MONGODB_PASSWORD}@{CLUSTER_NAME}.mongodb.net/"
            f"?retryWrites=true&w=majority&appName={APP_NAME}"
        )

        client = AsyncIOMotorClient(uri)
        db = client[DATABASE_NAME]

        print("✅ MongoDB connected successfully")
        return {
            "event_collection": db.events,
            "volunteer_collection": db.volunteers,
            "user_collection": db.users,
        }

    except Exception as e:
        print(f"❌ MongoDB connection error: {e}")
        return {}
