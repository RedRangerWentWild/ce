from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from typing import List, Optional
from database import db
from models import ComplaintCreate, ComplaintResponse, UserResponse
from dependencies import get_current_user
from datetime import datetime, timezone
import shutil
import os
import uuid

router = APIRouter(prefix="/complaints", tags=["complaints"])

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/", response_model=ComplaintResponse)
async def create_complaint(
    category: str = Form(...),
    description: str = Form(...),
    file: Optional[UploadFile] = File(None),
    current_user: UserResponse = Depends(get_current_user)
):
    image_url = None
    if file:
        file_ext = file.filename.split(".")[-1]
        filename = f"{uuid.uuid4()}.{file_ext}"
        file_path = os.path.join(UPLOAD_DIR, filename)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        image_url = f"/uploads/{filename}"
        
    complaint = ComplaintResponse(
        user_id=current_user.id,
        category=category,
        description=description,
        image_url=image_url
    )
    
    comp_dict = complaint.model_dump()
    comp_dict['created_at'] = comp_dict['created_at'].isoformat()
    
    await db.complaints.insert_one(comp_dict)
    return complaint

@router.get("/", response_model=List[ComplaintResponse])
async def get_complaints(current_user: UserResponse = Depends(get_current_user)):
    # Admin sees all, Student sees own
    filter_query = {}
    if current_user.role == "student":
        filter_query["user_id"] = current_user.id
        
    complaints = await db.complaints.find(filter_query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return complaints
