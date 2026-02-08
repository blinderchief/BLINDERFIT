"""
Main FastAPI application for Blinderfit Backend
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_database
from app.middleware import (
    SecurityHeadersMiddleware,
    RequestLoggingMiddleware,
    IPFilterMiddleware,
    rate_limit_middleware
)
from app.routes import (
    auth,
    onboarding,
    ai_chat,
    plans,
    tracking,
    dashboard,
    ml_predictions,
    notifications,
    integrations
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager"""
    # Startup
    logger.info("Starting Blinderfit Backend...")
    await init_database()
    logger.info("PostgreSQL database initialized successfully")

    # Start rate limiting cleanup task
    await rate_limit_middleware.start_cleanup_task()
    logger.info("Rate limiting initialized")

    yield

    # Shutdown
    logger.info("Shutting down Blinderfit Backend...")
    await rate_limit_middleware.stop_cleanup_task()
    logger.info("Rate limiting cleanup completed")

# Create FastAPI app
app = FastAPI(
    title="Blinderfit Backend API",
    description="AI-powered personalized health coach backend",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Add security middleware
app.add_middleware(
    SecurityHeadersMiddleware,
    allowed_origins=settings.ALLOWED_ORIGINS
)
app.add_middleware(RequestLoggingMiddleware)
# app.add_middleware(IPFilterMiddleware, allowed_ips=["127.0.0.1", "localhost"])  # Uncomment to enable IP filtering

# Add rate limiting
@app.middleware("http")
async def rate_limit_middleware_handler(request: Request, call_next):
    """Custom rate limiting middleware"""
    rate_limit_middleware._check_rate_limit(request)
    response = await call_next(request)
    return response

# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

# API info endpoint
@app.get("/")
async def root():
    """API root endpoint"""
    return {
        "message": "Welcome to Blinderfit Backend API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc"
    }

# Include routers
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(onboarding.router, prefix="/onboarding", tags=["Onboarding"])
app.include_router(ai_chat.router, prefix="/ai", tags=["AI Chat"])
app.include_router(plans.router, prefix="/plans", tags=["Plans"])
app.include_router(tracking.router, prefix="/tracking", tags=["Tracking"])
app.include_router(dashboard.router, prefix="/dashboard", tags=["Dashboard"])
app.include_router(ml_predictions.router, prefix="/ml", tags=["ML Predictions"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(integrations.router, prefix="/integrations", tags=["Integrations"])

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )