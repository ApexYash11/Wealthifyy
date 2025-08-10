from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config.settings import settings
from .api.v1 import auth, users, expenses, transactions, assets, portfolio, dashboard, predictions, feedback

# Create FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    debug=settings.debug
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(users.router, prefix="/users", tags=["Users"])
app.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
app.include_router(transactions.router, prefix="/transactions", tags=["Transactions"])
app.include_router(assets.router, prefix="/assets", tags=["Assets"])
app.include_router(portfolio.router, prefix="/portfolio", tags=["Portfolio"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(predictions.router, prefix="/predict", tags=["Predictions"])
app.include_router(feedback.router, prefix="/feedback", tags=["Feedback"])

@app.get("/")
async def root():
    return {
        "message": "Welcome to Wealthify Backend API",
        "version": settings.app_version,
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "version": settings.app_version,
        "environment": settings.environment
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.host,
        port=settings.port,
        reload=settings.reload
    )
