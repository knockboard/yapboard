from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api import image_router

app = FastAPI(title="Yapboard", description="WE YAP.", docs_url="/api/docs")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(image_router, prefix="/api", tags=["image"])
