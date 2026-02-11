from fastapi import APIRouter, File, UploadFile, HTTPException, Depends, Query
from fastapi.responses import FileResponse, StreamingResponse
import os
import tempfile
from typing import Optional
from services import file_converter, unit_converter, currency_converter, ocr_service
from models import ConversionRequest

router = APIRouter()

# Maximum file size: 100MB (Pro tier limit - frontend enforces tier-specific limits)
MAX_FILE_SIZE = 100 * 1024 * 1024

@router.post("/pdf-to-jpg")
async def convert_pdf_to_jpg(file: UploadFile = File(...)):
    """
    Convert PDF to JPG (always returns ZIP for consistency)
    """
    try:
        # Check file size
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        # Save temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            # Convert PDF to JPG (all pages)
            image_paths, is_multipage = await file_converter.convert_pdf_to_images(tmp_path, 'jpg')

            # Always return ZIP file for consistency with frontend
            zip_content = file_converter.create_images_zip(image_paths, 'jpg')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )

        finally:
            # Clean up temp file if it still exists
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/jpg-to-pdf")
async def convert_jpg_to_pdf(file: UploadFile = File(...)):
    """
    Convert JPG to PDF
    """
    try:
        # Check file size
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        # Save temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            # Convert JPG to PDF
            output_path = await file_converter.convert_jpg_to_pdf(tmp_path)

            # Read the output file
            with open(output_path, "rb") as f:
                output_content = f.read()

            # Clean up
            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=converted.pdf"}
            )

        finally:
            # Clean up temp file if it still exists
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/length")
async def convert_length(request: ConversionRequest):
    """
    Convert length units
    """
    try:
        result = await unit_converter.convert_length(request.value, request.from_unit, request.to_unit)
        return {"value": result, "from": request.from_unit, "to": request.to_unit}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/weight")
async def convert_weight(request: ConversionRequest):
    """
    Convert weight units
    """
    try:
        result = await unit_converter.convert_weight(request.value, request.from_unit, request.to_unit)
        return {"value": result, "from": request.from_unit, "to": request.to_unit}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/temperature")
async def convert_temperature(request: ConversionRequest):
    """
    Convert temperature units
    """
    try:
        result = await unit_converter.convert_temperature(request.value, request.from_unit, request.to_unit)
        return {"value": result, "from": request.from_unit, "to": request.to_unit}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/volume")
async def convert_volume(request: ConversionRequest):
    """
    Convert volume units
    """
    try:
        result = await unit_converter.convert_volume(request.value, request.from_unit, request.to_unit)
        return {"value": result, "from": request.from_unit, "to": request.to_unit}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/area")
async def convert_area(request: ConversionRequest):
    """
    Convert area units
    """
    try:
        result = await unit_converter.convert_area(request.value, request.from_unit, request.to_unit)
        return {"value": result, "from": request.from_unit, "to": request.to_unit}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/speed")
async def convert_speed(request: ConversionRequest):
    """
    Convert speed units
    """
    try:
        result = await unit_converter.convert_speed(request.value, request.from_unit, request.to_unit)
        return {"value": result, "from": request.from_unit, "to": request.to_unit}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/time")
async def convert_time(request: ConversionRequest):
    """
    Convert time units
    """
    try:
        result = await unit_converter.convert_time(request.value, request.from_unit, request.to_unit)
        return {"value": result, "from": request.from_unit, "to": request.to_unit}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/currency/rate")
async def get_exchange_rate(
    from_currency: str,
    to_currency: str
):
    """
    Get exchange rate between two currencies
    """
    try:
        rate = await currency_converter.get_exchange_rate(from_currency, to_currency)
        return {
            "from": from_currency.upper(),
            "to": to_currency.upper(),
            "rate": rate
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/currency/convert")
async def convert_currency(
    amount: float,
    from_currency: str,
    to_currency: str
):
    """
    Convert an amount from one currency to another
    """
    try:
        result = await currency_converter.convert_currency(amount, from_currency, to_currency)
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PDF ↔ DOCX Conversion Routes ====================

@router.post("/pdf-to-docx")
async def convert_pdf_to_docx(file: UploadFile = File(...)):
    """
    Convert PDF to DOCX
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_pdf_to_docx(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": "attachment; filename=converted.docx"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/docx-to-pdf")
async def convert_docx_to_pdf(file: UploadFile = File(...)):
    """
    Convert DOCX to PDF
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_docx_to_pdf(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=converted.pdf"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Image Format Conversion Routes ====================

@router.post("/jpg-to-png")
async def convert_jpg_to_png(file: UploadFile = File(...)):
    """
    Convert JPG to PNG
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_jpg_to_png(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="image/png",
                headers={"Content-Disposition": "attachment; filename=converted.png"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/png-to-jpg")
async def convert_png_to_jpg(file: UploadFile = File(...)):
    """
    Convert PNG to JPG
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_png_to_jpg(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="image/jpeg",
                headers={"Content-Disposition": "attachment; filename=converted.jpg"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jpeg-to-png")
async def convert_jpeg_to_png(file: UploadFile = File(...)):
    """
    Convert JPEG to PNG
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpeg") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_jpeg_to_png(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="image/png",
                headers={"Content-Disposition": "attachment; filename=converted.png"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/png-to-jpeg")
async def convert_png_to_jpeg(file: UploadFile = File(...)):
    """
    Convert PNG to JPEG
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_png_to_jpeg(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="image/jpeg",
                headers={"Content-Disposition": "attachment; filename=converted.jpeg"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jpg-to-jpeg")
async def convert_jpg_to_jpeg(file: UploadFile = File(...)):
    """
    Convert JPG to JPEG (rename file extension)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_jpg_to_jpeg(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="image/jpeg",
                headers={"Content-Disposition": "attachment; filename=converted.jpeg"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jpeg-to-jpg")
async def convert_jpeg_to_jpg(file: UploadFile = File(...)):
    """
    Convert JPEG to JPG (rename file extension)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpeg") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_jpeg_to_jpg(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="image/jpeg",
                headers={"Content-Disposition": "attachment; filename=converted.jpg"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PDF to Image Conversions (Multi-page support) ====================

@router.post("/pdf-to-png")
async def convert_pdf_to_png(file: UploadFile = File(...)):
    """
    Convert PDF to PNG (always returns ZIP for consistency)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_pdf_to_images(tmp_path, 'png')

            # Always return ZIP file for consistency with frontend
            zip_content = file_converter.create_images_zip(image_paths, 'png')
            # Clean up image files
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pdf-to-jpeg")
async def convert_pdf_to_jpeg(file: UploadFile = File(...)):
    """
    Convert PDF to JPEG (always returns ZIP for consistency)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_pdf_to_images(tmp_path, 'jpeg')

            # Always return ZIP file for consistency with frontend
            zip_content = file_converter.create_images_zip(image_paths, 'jpeg')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== DOCX to Image Conversions (Multi-page support) ====================

@router.post("/docx-to-png")
async def convert_docx_to_png(file: UploadFile = File(...)):
    """
    Convert DOCX to PNG (always returns ZIP for consistency)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_docx_to_images(tmp_path, 'png')

            # Always return ZIP file for consistency with frontend
            zip_content = file_converter.create_images_zip(image_paths, 'png')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/docx-to-jpg")
async def convert_docx_to_jpg(file: UploadFile = File(...)):
    """
    Convert DOCX to JPG (always returns ZIP for consistency)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_docx_to_images(tmp_path, 'jpg')

            # Always return ZIP file for consistency with frontend
            zip_content = file_converter.create_images_zip(image_paths, 'jpg')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/docx-to-jpeg")
async def convert_docx_to_jpeg(file: UploadFile = File(...)):
    """
    Convert DOCX to JPEG (always returns ZIP for consistency)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".docx") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_docx_to_images(tmp_path, 'jpeg')

            # Always return ZIP file for consistency with frontend
            zip_content = file_converter.create_images_zip(image_paths, 'jpeg')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Image to DOCX Conversions ====================

@router.post("/jpg-to-docx")
async def convert_jpg_to_docx(file: UploadFile = File(...)):
    """
    Convert JPG to DOCX
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_image_to_docx(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": "attachment; filename=converted.docx"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/jpeg-to-docx")
async def convert_jpeg_to_docx(file: UploadFile = File(...)):
    """
    Convert JPEG to DOCX
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpeg") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_image_to_docx(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": "attachment; filename=converted.docx"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/png-to-docx")
async def convert_png_to_docx(file: UploadFile = File(...)):
    """
    Convert PNG to DOCX
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_image_to_docx(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": "attachment; filename=converted.docx"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Image to PDF Conversions (already have jpg-to-pdf) ====================

@router.post("/jpeg-to-pdf")
async def convert_jpeg_to_pdf(file: UploadFile = File(...)):
    """
    Convert JPEG to PDF
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".jpeg") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_jpg_to_pdf(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=converted.pdf"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/png-to-pdf")
async def convert_png_to_pdf(file: UploadFile = File(...)):
    """
    Convert PNG to PDF
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_jpg_to_pdf(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=converted.pdf"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Batch Image Conversions ====================

@router.post("/batch/images-to-pdf")
async def batch_images_to_pdf(files: list[UploadFile] = File(...)):
    """
    Combine multiple images into a single PDF with one page per image.

    Accepts: JPG, JPEG, PNG
    Returns: Single PDF file with one page per image

    Validation:
    - Minimum 2 files required
    - Maximum 50 files
    - Only JPG, JPEG, PNG formats allowed
    - Total size must not exceed 100MB
    """
    try:
        # Validate file count
        if len(files) < 2:
            raise HTTPException(
                status_code=400,
                detail="Minimum 2 files required for batch conversion"
            )
        if len(files) > 50:
            raise HTTPException(
                status_code=400,
                detail="Maximum 50 files allowed for batch conversion"
            )

        # Save temporary files and validate formats
        temp_paths = []
        total_size = 0
        file_contents = []  # Store file contents to avoid reading twice

        for file in files:
            # Validate file type
            file_ext = os.path.splitext(file.filename)[1].lower()
            if file_ext not in ['.jpg', '.jpeg', '.png']:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file format: {file.filename}. Only JPG, JPEG, PNG are allowed."
                )

            # Read content and check size
            content = await file.read()
            file_size = len(content)
            total_size += file_size

            if file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"Single file too large: {file.filename}. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
                )

            # Store content for later use
            file_contents.append((file_ext, content))

        # Check total size
        if total_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Total file size too large. Maximum combined size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        # Save all files to temporary locations using stored contents
        for file_ext, content in file_contents:
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
                tmp_file.write(content)
                temp_paths.append(tmp_file.name)

        try:
            # Convert images to single PDF
            output_path = await file_converter.convert_images_to_single_pdf(temp_paths)

            # Read the output file
            with open(output_path, "rb") as f:
                output_content = f.read()

            # Clean up temp files
            for tmp_path in temp_paths:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=combined_images.pdf"}
            )

        finally:
            # Ensure cleanup on error
            for tmp_path in temp_paths:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch/images-to-docx")
async def batch_images_to_docx(files: list[UploadFile] = File(...)):
    """
    Combine multiple images into a single DOCX with one page per image.

    Accepts: JPG, JPEG, PNG
    Returns: Single DOCX file with one page per image

    Validation:
    - Minimum 2 files required
    - Maximum 50 files
    - Only JPG, JPEG, PNG formats allowed
    - Total size must not exceed 100MB
    """
    try:
        # Validate file count
        if len(files) < 2:
            raise HTTPException(
                status_code=400,
                detail="Minimum 2 files required for batch conversion"
            )
        if len(files) > 50:
            raise HTTPException(
                status_code=400,
                detail="Maximum 50 files allowed for batch conversion"
            )

        # Save temporary files and validate formats
        temp_paths = []
        total_size = 0
        file_contents = []  # Store file contents to avoid reading twice

        for file in files:
            # Validate file type
            file_ext = os.path.splitext(file.filename)[1].lower()
            if file_ext not in ['.jpg', '.jpeg', '.png']:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid file format: {file.filename}. Only JPG, JPEG, PNG are allowed."
                )

            # Read content and check size
            content = await file.read()
            file_size = len(content)
            total_size += file_size

            if file_size > MAX_FILE_SIZE:
                raise HTTPException(
                    status_code=413,
                    detail=f"Single file too large: {file.filename}. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
                )

            # Store content for later use
            file_contents.append((file_ext, content))

        # Check total size
        if total_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"Total file size too large. Maximum combined size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        # Save all files to temporary locations using stored contents
        for file_ext, content in file_contents:
            with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp_file:
                tmp_file.write(content)
                temp_paths.append(tmp_file.name)

        try:
            # Convert images to single DOCX
            output_path = await file_converter.convert_images_to_single_docx(temp_paths)

            # Read the output file
            with open(output_path, "rb") as f:
                output_content = f.read()

            # Clean up temp files
            for tmp_path in temp_paths:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": "attachment; filename=combined_images.docx"}
            )

        finally:
            # Ensure cleanup on error
            for tmp_path in temp_paths:
                if os.path.exists(tmp_path):
                    os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PDF OCR Conversion ====================

@router.post("/pdf-ocr")
async def convert_pdf_to_searchable(
    file: UploadFile = File(...),
    language: str = Query(default="eng", description="OCR language code (e.g., 'eng', 'fra', 'deu')")
):
    """
    Convert scanned PDF to searchable PDF using OCR.
    Adds a text layer to image-based PDFs so text can be selected and searched.
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Maximum size is {MAX_FILE_SIZE / 1024 / 1024}MB"
            )

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await ocr_service.convert_scanned_pdf_to_searchable(tmp_path, language)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=searchable.pdf"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/ocr/status")
async def get_ocr_status():
    """
    Check if OCR is available and get supported languages
    """
    try:
        status = await ocr_service.check_ocr_available()
        return {
            "available": status["pytesseract"] and status["pdf2image"] and status["tesseract"],
            "pytesseract": status["pytesseract"],
            "pdf2image": status["pdf2image"],
            "tesseract": status["tesseract"],
            "installed_languages": status["languages"],
            "supported_languages": ocr_service.SUPPORTED_LANGUAGES
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== Excel (XLSX) Conversions ====================

@router.post("/xlsx-to-pdf")
async def convert_xlsx_to_pdf(file: UploadFile = File(...)):
    """
    Convert Excel (XLSX) to PDF using LibreOffice
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_xlsx_to_pdf(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=converted.pdf"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/xlsx-to-jpg")
async def convert_xlsx_to_jpg(file: UploadFile = File(...)):
    """
    Convert Excel (XLSX) to JPG images (returns ZIP)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_xlsx_to_images(tmp_path, 'jpg')

            zip_content = file_converter.create_images_zip(image_paths, 'jpg')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/xlsx-to-png")
async def convert_xlsx_to_png(file: UploadFile = File(...)):
    """
    Convert Excel (XLSX) to PNG images (returns ZIP)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xlsx") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_xlsx_to_images(tmp_path, 'png')

            zip_content = file_converter.create_images_zip(image_paths, 'png')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PowerPoint (PPTX) Conversions ====================

@router.post("/pptx-to-pdf")
async def convert_pptx_to_pdf(file: UploadFile = File(...)):
    """
    Convert PowerPoint (PPTX) to PDF using LibreOffice
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_pptx_to_pdf(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=converted.pdf"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pptx-to-jpg")
async def convert_pptx_to_jpg(file: UploadFile = File(...)):
    """
    Convert PowerPoint (PPTX) to JPG images (returns ZIP)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_pptx_to_images(tmp_path, 'jpg')

            zip_content = file_converter.create_images_zip(image_paths, 'jpg')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pptx-to-png")
async def convert_pptx_to_png(file: UploadFile = File(...)):
    """
    Convert PowerPoint (PPTX) to PNG images (returns ZIP)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pptx") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_pptx_to_images(tmp_path, 'png')

            zip_content = file_converter.create_images_zip(image_paths, 'png')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PDF to Office Conversions ====================

@router.post("/pdf-to-xlsx")
async def convert_pdf_to_xlsx(file: UploadFile = File(...)):
    """
    Convert PDF to Excel (XLSX) using LibreOffice
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_pdf_to_xlsx(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=converted.xlsx"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/pdf-to-pptx")
async def convert_pdf_to_pptx(file: UploadFile = File(...)):
    """
    Convert PDF to PowerPoint (PPTX) using LibreOffice
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_pdf_to_pptx(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                headers={"Content-Disposition": "attachment; filename=converted.pptx"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== XLS (Legacy Excel) Conversions ====================

@router.post("/xls-to-pdf")
async def convert_xls_to_pdf(file: UploadFile = File(...)):
    """
    Convert Excel (XLS) to PDF using LibreOffice
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xls") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_xls_to_pdf(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=converted.pdf"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/xls-to-xlsx")
async def convert_xls_to_xlsx(file: UploadFile = File(...)):
    """
    Convert Excel (XLS) to XLSX using LibreOffice
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xls") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_xls_to_xlsx(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                headers={"Content-Disposition": "attachment; filename=converted.xlsx"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/doc-to-docx")
async def convert_doc_to_docx(file: UploadFile = File(...)):
    """
    Convert Word (DOC) to DOCX using LibreOffice
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".doc") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_doc_to_docx(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                headers={"Content-Disposition": "attachment; filename=converted.docx"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/xls-to-jpg")
async def convert_xls_to_jpg(file: UploadFile = File(...)):
    """
    Convert Excel (XLS) to JPG images (returns ZIP)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xls") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_xls_to_images(tmp_path, 'jpg')

            zip_content = file_converter.create_images_zip(image_paths, 'jpg')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/xls-to-png")
async def convert_xls_to_png(file: UploadFile = File(...)):
    """
    Convert Excel (XLS) to PNG images (returns ZIP)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".xls") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_xls_to_images(tmp_path, 'png')

            zip_content = file_converter.create_images_zip(image_paths, 'png')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PPT (Legacy PowerPoint) Conversions ====================

@router.post("/ppt-to-pdf")
async def convert_ppt_to_pdf(file: UploadFile = File(...)):
    """
    Convert PowerPoint (PPT) to PDF using LibreOffice
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".ppt") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_ppt_to_pdf(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/pdf",
                headers={"Content-Disposition": "attachment; filename=converted.pdf"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ppt-to-pptx")
async def convert_ppt_to_pptx(file: UploadFile = File(...)):
    """
    Convert PowerPoint (PPT) to PPTX using LibreOffice
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".ppt") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            output_path = await file_converter.convert_ppt_to_pptx(tmp_path)

            with open(output_path, "rb") as f:
                output_content = f.read()

            os.unlink(tmp_path)
            os.unlink(output_path)

            return StreamingResponse(
                iter([output_content]),
                media_type="application/vnd.openxmlformats-officedocument.presentationml.presentation",
                headers={"Content-Disposition": "attachment; filename=converted.pptx"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ppt-to-jpg")
async def convert_ppt_to_jpg(file: UploadFile = File(...)):
    """
    Convert PowerPoint (PPT) to JPG images (returns ZIP)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".ppt") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_ppt_to_images(tmp_path, 'jpg')

            zip_content = file_converter.create_images_zip(image_paths, 'jpg')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/ppt-to-png")
async def convert_ppt_to_png(file: UploadFile = File(...)):
    """
    Convert PowerPoint (PPT) to PNG images (returns ZIP)
    """
    try:
        content = await file.read()
        if len(content) > MAX_FILE_SIZE:
            raise HTTPException(status_code=413, detail="File too large")

        with tempfile.NamedTemporaryFile(delete=False, suffix=".ppt") as tmp_file:
            tmp_file.write(content)
            tmp_path = tmp_file.name

        try:
            image_paths, is_multipage = await file_converter.convert_ppt_to_images(tmp_path, 'png')

            zip_content = file_converter.create_images_zip(image_paths, 'png')
            for path in image_paths:
                if os.path.exists(path):
                    os.unlink(path)

            return StreamingResponse(
                iter([zip_content]),
                media_type="application/zip",
                headers={"Content-Disposition": "attachment; filename=converted_images.zip"}
            )
        finally:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== LibreOffice Status ====================

@router.get("/libreoffice/status")
async def get_libreoffice_status():
    """
    Check if LibreOffice is available for document conversions
    """
    try:
        status = await file_converter.check_libreoffice_status()
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
