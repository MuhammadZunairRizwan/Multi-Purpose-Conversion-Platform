"""
OCR Service
Handles PDF OCR - converts scanned PDFs to searchable PDFs
Uses pdf2image + pytesseract + reportlab (avoids problematic pikepdf)
"""

import os
import tempfile
import asyncio
from typing import List, Tuple
from PIL import Image

# Check dependencies
try:
    import pytesseract
    PYTESSERACT_AVAILABLE = True
except ImportError:
    PYTESSERACT_AVAILABLE = False

try:
    from pdf2image import convert_from_path
    PDF2IMAGE_AVAILABLE = True
except ImportError:
    PDF2IMAGE_AVAILABLE = False

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.pdfgen import canvas
    from reportlab.lib.units import inch
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False

try:
    from PyPDF2 import PdfMerger, PdfReader, PdfWriter
    PYPDF2_AVAILABLE = True
except ImportError:
    PYPDF2_AVAILABLE = False


async def convert_scanned_pdf_to_searchable(pdf_path: str, language: str = 'eng') -> str:
    """
    Convert a scanned PDF to a searchable PDF by:
    1. Converting PDF pages to images
    2. Running OCR on each image with pytesseract
    3. Creating a new PDF with the searchable text layer

    Args:
        pdf_path: Path to the input scanned PDF
        language: OCR language code (default: 'eng' for English)

    Returns:
        Path to the output searchable PDF
    """
    if not PYTESSERACT_AVAILABLE:
        raise ValueError("pytesseract not available. Please install: pip install pytesseract")
    if not PDF2IMAGE_AVAILABLE:
        raise ValueError("pdf2image not available. Please install: pip install pdf2image")

    try:
        # Run OCR in thread pool to not block async event loop
        loop = asyncio.get_event_loop()
        output_path = await loop.run_in_executor(
            None,
            lambda: _perform_ocr_sync(pdf_path, language)
        )
        return output_path

    except Exception as e:
        raise ValueError(f"OCR processing failed: {str(e)}")


def _perform_ocr_sync(pdf_path: str, language: str) -> str:
    """
    Synchronous OCR processing using pytesseract's built-in PDF output.
    """
    # Convert PDF to images
    images = convert_from_path(pdf_path, dpi=150)

    if not images:
        raise ValueError("Could not convert PDF to images")

    # Create output path
    output_fd, output_path = tempfile.mkstemp(suffix='.pdf')
    os.close(output_fd)

    if len(images) == 1:
        # Single page - use pytesseract directly to create searchable PDF
        pdf_bytes = pytesseract.image_to_pdf_or_hocr(
            images[0],
            lang=language,
            extension='pdf'
        )
        with open(output_path, 'wb') as f:
            f.write(pdf_bytes)
    else:
        # Multiple pages - create individual PDFs and merge
        temp_pdfs = []
        try:
            for i, image in enumerate(images):
                temp_fd, temp_path = tempfile.mkstemp(suffix='.pdf')
                os.close(temp_fd)

                pdf_bytes = pytesseract.image_to_pdf_or_hocr(
                    image,
                    lang=language,
                    extension='pdf'
                )
                with open(temp_path, 'wb') as f:
                    f.write(pdf_bytes)
                temp_pdfs.append(temp_path)

            # Merge all PDFs
            if PYPDF2_AVAILABLE:
                merger = PdfMerger()
                for temp_pdf in temp_pdfs:
                    merger.append(temp_pdf)
                merger.write(output_path)
                merger.close()
            else:
                # If PyPDF2 not available, just return first page
                import shutil
                shutil.copy(temp_pdfs[0], output_path)

        finally:
            # Cleanup temp files
            for temp_pdf in temp_pdfs:
                if os.path.exists(temp_pdf):
                    os.unlink(temp_pdf)

    return output_path


async def check_ocr_available() -> dict:
    """
    Check if OCR dependencies are available.
    """
    result = {
        "pytesseract": PYTESSERACT_AVAILABLE,
        "pdf2image": PDF2IMAGE_AVAILABLE,
        "tesseract": False,
        "languages": []
    }

    # Check if Tesseract is installed
    try:
        process = await asyncio.create_subprocess_exec(
            "tesseract", "--version",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await process.communicate()
        result["tesseract"] = process.returncode == 0

        # Get available languages
        if result["tesseract"]:
            process = await asyncio.create_subprocess_exec(
                "tesseract", "--list-langs",
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await process.communicate()
            if process.returncode == 0:
                output = stdout.decode() if stdout else stderr.decode()
                lines = output.strip().split('\n')
                result["languages"] = [lang.strip() for lang in lines[1:] if lang.strip()]

    except FileNotFoundError:
        result["tesseract"] = False

    return result


# Supported OCR languages with display names
SUPPORTED_LANGUAGES = {
    'eng': 'English',
    'fra': 'French',
    'deu': 'German',
    'spa': 'Spanish',
    'ita': 'Italian',
    'por': 'Portuguese',
    'nld': 'Dutch',
    'pol': 'Polish',
    'rus': 'Russian',
    'chi_sim': 'Chinese (Simplified)',
    'chi_tra': 'Chinese (Traditional)',
    'jpn': 'Japanese',
    'kor': 'Korean',
    'ara': 'Arabic',
    'hin': 'Hindi',
    'tha': 'Thai',
    'vie': 'Vietnamese',
    'tur': 'Turkish',
}
