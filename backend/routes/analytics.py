from fastapi import APIRouter, Depends
from database import db
from dependencies import get_admin_user, UserResponse

router = APIRouter(prefix="/analytics", tags=["analytics"])

@router.get("/wastage")
async def get_wastage_stats(admin: UserResponse = Depends(get_admin_user)):
    # Simple aggregation: Count skipped meals vs total meals
    total_meals = await db.meals.count_documents({})
    total_selections = await db.meal_selections.count_documents({})
    skipped_count = await db.meal_selections.count_documents({"status": "skipped"})
    
    # Mock data for the graph if empty
    if total_selections == 0:
        return {
            "total_meals_served": 1200,
            "meals_skipped": 150,
            "wastage_saved_kg": 45.5,
            "participation_rate": 88
        }
        
    return {
        "total_meals_served": total_selections,
        "meals_skipped": skipped_count,
        "wastage_saved_kg": skipped_count * 0.3, # Assuming 0.3kg per meal
        "participation_rate": ((total_selections - skipped_count) / total_selections) * 100 if total_selections > 0 else 0
    }
