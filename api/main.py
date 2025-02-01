from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from api import auth_router, image_router

app = FastAPI(title="Yapboard", description="WE YAP.", docs_url="/api/docs")
app.mount("/images", StaticFiles(directory="./processed_images"), name="images")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix="/api", tags=["auth"])
app.include_router(image_router, prefix="/api", tags=["image"])
