import io
import logging
from typing import Dict, Any
import pypdf

logger = logging.getLogger(__name__)


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> Dict[str, Any]:
    """
    Safely extracts plain text and page metadata from PDF byte stream using pypdf.
    Returns structured result dictionary with extracted_text, num_pages, and status.
    """
    if not pdf_bytes or len(pdf_bytes) == 0:
        return {
            "status": "error",
            "error": "Empty PDF file payload",
            "extracted_text": "",
            "num_pages": 0,
        }

    try:
        reader = pypdf.PdfReader(io.BytesIO(pdf_bytes))
        num_pages = len(reader.pages)
        pages_text = []

        for idx, page in enumerate(reader.pages):
            text = page.extract_text() or ""
            pages_text.append(text)

        full_text = "\n".join(pages_text).strip()

        if not full_text:
            return {
                "status": "empty",
                "error": "No readable text found in PDF (scanned image or empty document)",
                "extracted_text": "",
                "num_pages": num_pages,
            }

        return {
            "status": "success",
            "error": None,
            "extracted_text": full_text,
            "num_pages": num_pages,
        }
    except pypdf.errors.PdfReadError as e:
        logger.warning(f"Failed to read PDF file: {e}")
        return {
            "status": "error",
            "error": f"Invalid or corrupted PDF file: {str(e)}",
            "extracted_text": "",
            "num_pages": 0,
        }
    except Exception as e:
        logger.error(f"Unexpected error during PDF text extraction: {e}")
        return {
            "status": "error",
            "error": f"Failed to process PDF: {str(e)}",
            "extracted_text": "",
            "num_pages": 0,
        }
