from fastapi import APIRouter, HTTPException, Depends
from typing import List
from database import db
from models import MealCreate, MealResponse, MealSelection, Transaction, UserResponse
from dependencies import get_current_user, get_admin_user
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/meals", tags=["meals"])

@router.get("/", response_model=List[MealResponse])
async def get_meals():
    meals = await db.meals.find({"is_active": True}, {"_id": 0}).to_list(100)
    return meals

@router.post("/", response_model=MealResponse)
async def create_meal(meal: MealCreate, admin: UserResponse = Depends(get_admin_user)):
    meal_obj = MealResponse(**meal.model_dump())
    meal_dict = meal_obj.model_dump()
    meal_dict['created_at'] = meal_dict['created_at'].isoformat()
    
    await db.meals.insert_one(meal_dict)
    return meal_obj

@router.post("/{meal_id}/select")
async def select_meal(
    meal_id: str, 
    status: str, 
    current_user: UserResponse = Depends(get_current_user)
):
    if status not in ["attending", "skipped"]:
        raise HTTPException(status_code=400, detail="Invalid status")
        
    meal = await db.meals.find_one({"id": meal_id})
    if not meal:
        raise HTTPException(status_code=404, detail="Meal not found")
        
    # Check existing selection
    existing = await db.meal_selections.find_one({
        "user_id": current_user.id,
        "meal_id": meal_id
    })
    
    # Logic for credits
    credit_change = 0
    if existing:
        if existing['status'] == "attending" and status == "skipped":
            credit_change = meal['price']
        elif existing['status'] == "skipped" and status == "attending":
            credit_change = -meal['price']
            
        await db.meal_selections.update_one(
            {"id": existing['id']},
            {"$set": {"status": status, "timestamp": datetime.now(timezone.utc).isoformat()}}
        )
    else:
        selection = MealSelection(
            user_id=current_user.id,
            meal_id=meal_id,
            status=status
        )
        sel_dict = selection.model_dump()
        sel_dict['timestamp'] = sel_dict['timestamp'].isoformat()
        await db.meal_selections.insert_one(sel_dict)
        
        if status == "skipped":
            credit_change = meal['price']
            
    # Update wallet if needed
    if credit_change != 0:
        # Check balance if deducting
        if credit_change < 0 and current_user.wallet_balance + credit_change < 0:
             # Revert selection if insufficient funds (edge case if they spent the credits)
             # For now, allow negative or block? Let's block.
             raise HTTPException(status_code=400, detail="Insufficient credits to re-join meal")

        await db.users.update_one(
            {"email": current_user.email},
            {"$inc": {"wallet_balance": credit_change}}
        )
        
        # Log transaction
        tx = Transaction(
            sender_id="SYSTEM",
            receiver_id=current_user.id,
            amount=abs(credit_change),
            type="skip_credit" if credit_change > 0 else "admin_adjustment", # Re-joining is like paying back
            description=f"{'Earned' if credit_change > 0 else 'Spent'} credits for meal {meal['date']} {meal['type']}"
        )
        tx_dict = tx.model_dump()
        tx_dict['timestamp'] = tx_dict['timestamp'].isoformat()
        await db.transactions.insert_one(tx_dict)
        
    return {"status": "success", "new_status": status}

@router.get("/my-selections")
async def get_my_selections(current_user: UserResponse = Depends(get_current_user)):
    selections = await db.meal_selections.find(
        {"user_id": current_user.id}, 
        {"_id": 0}
    ).to_list(100)
    return selections
