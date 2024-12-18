import asyncio
from io import BytesIO

import cv2
import numpy as np
from fastapi import APIRouter, File, HTTPException, UploadFile
from fastapi.responses import StreamingResponse
from logger import logger
from ultralytics import YOLO

router = APIRouter(tags=["image"])

model_path = "./ml/model.pt"
try:
    model = YOLO(model_path)
    logger.info(f"YOLO model loaded successfully from {model_path}")
except Exception as e:
    logger.error(f"Failed to load YOLO model: {e}")
    raise RuntimeError(f"Error loading YOLO model: {e}")


@router.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    try:
        return await asyncio.wait_for(remove_bg(file), timeout=60)
    except asyncio.TimeoutError:
        logger.warning("Image processing timed out")
        raise HTTPException(status_code=408, detail="Request timed out")
    except Exception as e:
        logger.error(f"Unexpected error in processing: {e}")
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


async def remove_bg(file: UploadFile):

    allowed_types = ["image/jpeg", "image/png", "image/webp"]
    if file.content_type not in allowed_types:
        logger.warning(f"Invalid file type uploaded: {file.content_type}")
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed types: {', '.join(allowed_types)}",
        )

    try:
        file_bytes = await file.read()
        file_array = np.frombuffer(file_bytes, np.uint8)
        img = cv2.imdecode(file_array, cv2.IMREAD_COLOR)

        if img is None:
            logger.warning("Failed to decode image")
            raise HTTPException(status_code=400, detail="Invalid image file.")

        H, W, _ = img.shape

        logger.info(f"Processing image: {W}x{H} pixels")

        results = model(img)
        processed_images = []

        for result in results:
            if (
                hasattr(result, "masks")
                and result.masks is not None
                and len(result.masks) > 0
            ):
                for j, (mask,box) in enumerate(zip(result.masks.data, result.boxes.xyxy)):
                    mask = mask.numpy() * 255
                    mask = cv2.resize(mask, (W, H)).astype(np.uint8)\

                    x1, y1, x2, y2 = map(int, box)
                    logger.info(f"Cropping to bounding box: {(x1, y1, x2, y2)}")

                    cropped_img = img[y1:y2, x1:x2]

                    rgba_cropped_image = cv2.cvtColor(cropped_img, cv2.COLOR_BGR2BGRA)
                    cropped_mask = mask[y1:y2, x1:x2]
                    rgba_cropped_image[:, :, 3] = cropped_mask


                    _, buffer = cv2.imencode(".png", rgba_cropped_image)
                    processed_images.append(BytesIO(buffer.tobytes()))

        if processed_images:
            logger.info("Successfully processed image")
            return StreamingResponse(
                processed_images[0],
                media_type="image/png",
                headers={"Content-Disposition": "attachment; filename=output.png"},
            )

        logger.warning("No masks found in the image")
        raise HTTPException(
            status_code=404, detail="No objects detected. Unable to remove background."
        )

    except Exception as e:
        logger.error(f"Error in background removal: {e}")
        raise HTTPException(status_code=500, detail=f"Processing failed: {str(e)}")


@router.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}
