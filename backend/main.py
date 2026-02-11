import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import conversions, calculators, documents, usage, history

# Load environment variables
load_dotenv()

# Create FastAPI app
app = FastAPI(
    title="CalNConvert API",
    description="Multi-purpose conversion platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(conversions.router, prefix="/convert", tags=["Conversions"])
app.include_router(calculators.router, prefix="/calculate", tags=["Calculators"])
app.include_router(documents.router, prefix="/documents", tags=["Documents"])
app.include_router(usage.router, prefix="/usage", tags=["Usage Tracking"])
app.include_router(history.router, prefix="/history", tags=["Document History"])

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "version": "1.0.0"}

@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "CalNConvert API",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=int(os.getenv("PORT", 8000)),
        reload=os.getenv("ENV", "development") == "development"
    )
