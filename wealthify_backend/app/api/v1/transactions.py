from fastapi import APIRouter, Depends, HTTPException, status
from typing import List, Dict, Any
from app.core.get_current_user_supabase import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionUpdate, Transaction
from app.services.transaction_service import TransactionService
from app.models.user import User
from app.core.database import get_db
from app.core.user_mapping import get_user_db_id, ensure_user_exists
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=Transaction)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Create a new transaction"""
    print(f"Received transaction data: {transaction_data}")
    try:
        # Map Supabase UUID to database integer ID
        user_db_id = await get_user_db_id(current_user["id"], db)
        if not user_db_id:
            # Try to create user if they don't exist
            user_db_id = await ensure_user_exists(current_user, db)
            if not user_db_id:
                raise HTTPException(status_code=404, detail="User not found in database and could not be created")
        
        transaction_service = TransactionService(db)
        return await transaction_service.create_transaction(str(user_db_id), transaction_data)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error creating transaction: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to create transaction: {str(e)}")

@router.get("/", response_model=List[Transaction])
async def get_transactions(
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get all user transactions"""
    # Map Supabase UUID to database integer ID
    user_db_id = await get_user_db_id(current_user["id"], db)
    if not user_db_id:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    transaction_service = TransactionService(db)
    return await transaction_service.get_transactions(str(user_db_id))

@router.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(
    transaction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Get a specific transaction"""
    # Map Supabase UUID to database integer ID
    user_db_id = await get_user_db_id(current_user["id"], db)
    if not user_db_id:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    transaction_service = TransactionService(db)
    transaction = await transaction_service.get_transaction(str(user_db_id), transaction_id)
    if not transaction:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return transaction

@router.put("/{transaction_id}", response_model=Transaction)
async def update_transaction(
    transaction_id: str,
    transaction_data: TransactionUpdate,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Update a transaction"""
    # Map Supabase UUID to database integer ID
    user_db_id = await get_user_db_id(current_user["id"], db)
    if not user_db_id:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    transaction_service = TransactionService(db)
    updated = await transaction_service.update_transaction(
        str(user_db_id),
        transaction_id,
        transaction_data
    )
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return updated

@router.delete("/{transaction_id}")
async def delete_transaction(
    transaction_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """Delete a transaction"""
    # Map Supabase UUID to database integer ID
    user_db_id = await get_user_db_id(current_user["id"], db)
    if not user_db_id:
        raise HTTPException(status_code=404, detail="User not found in database")
    
    transaction_service = TransactionService(db)
    success = await transaction_service.delete_transaction(str(user_db_id), transaction_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return {"message": "Transaction deleted successfully"}
