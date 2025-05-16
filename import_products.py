import json
from pymongo import MongoClient

# Σύνδεση με MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["dolledupDB"]
collection = db["products"]

# Διαγραφή παλιών εγγραφών (προαιρετικά)
collection.delete_many({})

# Φόρτωση JSON
with open("products.json", encoding="utf-8") as f:
    data = json.load(f)


for item in data:
    if "_id" in item:
        del item["_id"]

# Εισαγωγή στη βάση
collection.insert_many(data)
