from fastapi import APIRouter
from app.api.v1.endpoints import dashboard
from app.api.v1 import auth, assets, transactions, portfolio, predictions

# Do NOT set a prefix here. The top-level application will mount this
# `api_router` with the desired `settings.API_V1_PREFIX` to avoid double
# prefixing (e.g. /api/v1/api/v1). Sub-routers (auth, assets, transactions,
# portfolio) already define their own prefixes like '/auth' or '/transactions'.
api_router = APIRouter()

# Include all routers (they provide their own prefixes)
api_router.include_router(auth.router)
api_router.include_router(assets.router)
api_router.include_router(transactions.router)
api_router.include_router(portfolio.router)
api_router.include_router(predictions.router)
api_router.include_router(dashboard.router)
