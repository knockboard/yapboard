from .routes.auth import router as auth_router
from .routes.image import router as image_router

__all__ = ["auth_router", "image_router"]
