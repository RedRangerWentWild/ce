import asyncio
from database import db

async def create_indexes():
    print("Creating indexes...")
    
    # Users
    await db.users.create_index("email", unique=True)
    await db.users.create_index("id", unique=True)
    
    # Meals
    await db.meals.create_index("id", unique=True)
    await db.meals.create_index("date")
    await db.meals.create_index("is_active")
    
    # Meal Selections
    await db.meal_selections.create_index("id", unique=True)
    await db.meal_selections.create_index([("user_id", 1), ("meal_id", 1)], unique=True)
    await db.meal_selections.create_index("status")
    
    # Transactions
    await db.transactions.create_index("id", unique=True)
    await db.transactions.create_index("sender_id")
    await db.transactions.create_index("receiver_id")
    await db.transactions.create_index("timestamp")
    
    # Complaints
    await db.complaints.create_index("id", unique=True)
    await db.complaints.create_index("user_id")
    await db.complaints.create_index("created_at")
    
    print("Indexes created successfully.")

if __name__ == "__main__":
    asyncio.run(create_indexes())
