from typing import Any


def preprocess_image_frame(image_bytes: bytes, target_size: tuple = (224, 224)) -> Any:
    """Decodes raw byte array, resizes frame, and normalizes pixel intensities."""
    # Placeholder for OpenCV decoding: cv2.imdecode & cv2.resize
    return {"status": "preprocessed", "size": target_size}
