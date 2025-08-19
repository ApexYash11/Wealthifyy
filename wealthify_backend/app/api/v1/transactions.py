from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from app.core.get_current_user_supabase import get_current_user
from app.schemas.transaction import TransactionCreate, TransactionUpdate, Transaction
from app.services.transaction_service import TransactionService
from app.models.user import User
from app.core.database import get_db
from sqlalchemy.orm import Session

router = APIRouter(prefix="/transactions", tags=["Transactions"])

@router.post("/", response_model=Transaction)
async def create_transaction(
    transaction_data: TransactionCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new transaction"""
    transaction_service = TransactionService(db)
    return transaction_service.create_transaction(str(current_user["id"]), transaction_data)

@router.get("/", response_model=List[Transaction])
async def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all user transactions"""
    transaction_service = TransactionService(db)
    return transaction_service.get_transactions(str(current_user["id"]))

@router.get("/{transaction_id}", response_model=Transaction)
async def get_transaction(
    transaction_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific transaction"""
    transaction_service = TransactionService(db)
    transaction = transaction_service.get_transaction(str(current_user["id"]), transaction_id)
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a transaction"""
    transaction_service = TransactionService(db)
    updated = transaction_service.update_transaction(
        str(current_user["id"]),
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
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a transaction"""
    transaction_service = TransactionService(db)
    success = transaction_service.delete_transaction(str(current_user["id"]), transaction_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Transaction not found"
        )
    return {"message": "Transaction deleted successfully"}
