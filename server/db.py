from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["synergy"]

event_collection = db["events"]
team_collection = db["teams"]
volunteer_collection = db["volunteers"]
admin_collection = db["admins"]
