"""Main application entry point for the Smart Internship Management FastAPI backend."""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings

# Initialize FastAPI application with configuration metadata
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Backend API service for Smart Internship Management platform.",
    version="1.0.0",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
)

# Configure Cross-Origin Resource Sharing (CORS) for frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get(
    "/api/health",
    tags=["Health"],
    summary="Health Check",
    description="Returns a simple JSON response confirming that the backend is running.",
)
def health_check():
    """Health check endpoint verifying API service availability."""
    return {
        "status": "healthy",
        "message": "Smart Internship Management Backend is running",
        "environment": settings.ENVIRONMENT,
    }


@app.get(
    "/",
    tags=["Root"],
    summary="API Root",
    description="Welcome endpoint providing API status and documentation links.",
)
def read_root():
    """Root endpoint linking to API documentation and health status."""
    return {
        "message": f"Welcome to {settings.PROJECT_NAME}",
        "docs": f"{settings.API_V1_STR}/docs",
        "health": "/api/health",
    }
