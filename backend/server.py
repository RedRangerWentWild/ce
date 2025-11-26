from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from starlette.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
import logging
from database import db
from auth_utils import get_password_hash
from datetime import datetime, timezone
import uuid

# Import Routes
from routes import auth, meals, wallet, complaints, analytics

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Seed Data
    try:
        # Check if admin exists
        admin = await db.users.find_one({"role": "admin"})
        if not admin:
            logger.info("Seeding Admin User...")
            admin_user = {
                "id": str(uuid.uuid4()),
                "email": "admin@credeat.com",
                "hashed_password": get_password_hash("admin123"),
                "full_name": "Mess Admin",
                "role": "admin",
                "wallet_balance": 0.0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(admin_user)
            
        # Check if vendor exists
        vendor = await db.users.find_one({"role": "vendor"})
        if not vendor:
            logger.info("Seeding Vendor User...")
            vendor_user = {
                "id": str(uuid.uuid4()),
                "email": "vendor@credeat.com",
                "hashed_password": get_password_hash("vendor123"),
                "full_name": "Campus Cafe",
                "role": "vendor",
                "wallet_balance": 0.0,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(vendor_user)

        # Seed some meals
        if await db.meals.count_documents({}) == 0:
            logger.info("Seeding Meals...")
            meals_data = [
                {
                    "id": str(uuid.uuid4()),
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "type": "breakfast",
                    "menu_items": ["Idli", "Sambar", "Chutney", "Coffee"],
                    "price": 40.0,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "type": "lunch",
                    "menu_items": ["Rice", "Dal", "Paneer Butter Masala", "Curd"],
                    "price": 80.0,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                },
                {
                    "id": str(uuid.uuid4()),
                    "date": datetime.now().strftime("%Y-%m-%d"),
                    "type": "dinner",
                    "menu_items": ["Roti", "Mix Veg", "Salad"],
                    "price": 60.0,
                    "is_active": True,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
            ]
            await db.meals.insert_many(meals_data)
            
    except Exception as e:
        logger.error(f"Seeding error: {e}")
        
    yield
    # Shutdown logic if needed

app = FastAPI(lifespan=lifespan)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"], # Allow all for hackathon/dev
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Static Files
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# Include Routers
app.include_router(auth.router, prefix="/api")
app.include_router(meals.router, prefix="/api")
app.include_router(wallet.router, prefix="/api")
app.include_router(complaints.router, prefix="/api")
app.include_router(analytics.router, prefix="/api")

@app.get("/api/")
async def root():
    return {"message": "CredEat API is running"}
