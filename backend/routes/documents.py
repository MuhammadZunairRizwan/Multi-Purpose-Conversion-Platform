from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
from services import document_generator

router = APIRouter()

class LineItem(BaseModel):
    description: str
    quantity: float
    rate: float

class InvoiceRequest(BaseModel):
    invoice_number: str
    invoice_date: str
    due_date: str
    from_company: str
    from_address: str
    from_email: str
    from_phone: str
    to_client: str
    to_address: str
    to_email: str
    line_items: List[LineItem]
    tax_rate: float = 0
    discount: float = 0
    notes: Optional[str] = None
    tier: Optional[str] = "FREE"

class ReceiptRequest(BaseModel):
    receipt_number: str
    receipt_date: str
    from_business: str
    from_address: str
    from_phone: str
    from_email: str
    customer_name: Optional[str] = None
    line_items: List[LineItem]
    payment_method: str = "Cash"
    notes: Optional[str] = None
    tier: Optional[str] = "FREE"


class NDARequest(BaseModel):
    effective_date: str
    disclosing_party_name: str
    disclosing_party_address: str
    receiving_party_name: str
    receiving_party_address: str
    purpose: str
    duration_years: int = 2
    governing_law: str = "the State of Delaware"


class EmploymentLetterRequest(BaseModel):
    letter_type: str = "offer"  # 'offer' or 'confirmation'
    letter_date: str
    company_name: str
    company_address: str
    company_phone: str
    company_email: str
    employee_name: str
    employee_address: str
    position: str
    department: str
    salary: float
    salary_frequency: str = "annually"
    start_date: Optional[str] = None
    hire_date: Optional[str] = None
    reporting_manager: Optional[str] = None
    employment_status: str = "Full-time"
    benefits: Optional[str] = None
    additional_terms: Optional[str] = None
    hr_name: str
    hr_title: str

@router.post("/generate-invoice")
async def generate_invoice(request: InvoiceRequest):
    """
    Generate an invoice PDF with optional watermark based on tier
    """
    print("====== ROUTE: /generate-invoice called ======", flush=True)
    print(f"Invoice number: {request.invoice_number}, Tier: {request.tier}", flush=True)
    try:
        print("Calling document_generator.generate_invoice_pdf...", flush=True)
        # Pass tier separately, exclude it from the dict
        data = request.dict()
        tier = data.pop('tier', 'FREE')
        pdf_bytes = await document_generator.generate_invoice_pdf(data, tier=tier)
        print(f"Invoice PDF generated, size: {len(pdf_bytes)} bytes", flush=True)

        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=invoice_{request.invoice_number}.pdf"
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/generate-receipt")
async def generate_receipt(request: ReceiptRequest):
    """
    Generate a receipt PDF with optional watermark based on tier
    """
    print("====== ROUTE: /generate-receipt called ======", flush=True)
    print(f"Receipt number: {request.receipt_number}, Tier: {request.tier}", flush=True)
    try:
        print("Calling document_generator.generate_receipt_pdf...", flush=True)
        # Pass tier separately, exclude it from the dict
        data = request.dict()
        tier = data.pop('tier', 'FREE')
        pdf_bytes = await document_generator.generate_receipt_pdf(data, tier=tier)
        print(f"Receipt PDF generated, size: {len(pdf_bytes)} bytes", flush=True)

        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=receipt_{request.receipt_number}.pdf"
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-nda")
async def generate_nda(request: NDARequest):
    """
    Generate a Non-Disclosure Agreement PDF (Pro tier only)
    """
    print("====== ROUTE: /generate-nda called ======", flush=True)
    try:
        pdf_bytes = await document_generator.generate_nda_pdf(
            request.dict()
        )
        print(f"NDA PDF generated, size: {len(pdf_bytes)} bytes", flush=True)

        # Create a safe filename
        safe_name = request.receiving_party_name.replace(" ", "_")[:20]
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=NDA_{safe_name}.pdf"
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-employment-letter")
async def generate_employment_letter(request: EmploymentLetterRequest):
    """
    Generate an Employment Offer/Confirmation Letter PDF (Pro tier only)
    """
    print("====== ROUTE: /generate-employment-letter called ======", flush=True)
    try:
        pdf_bytes = await document_generator.generate_employment_letter_pdf(
            request.dict()
        )
        print(f"Employment Letter PDF generated, size: {len(pdf_bytes)} bytes", flush=True)

        # Create a safe filename
        safe_name = request.employee_name.replace(" ", "_")[:20]
        letter_type = request.letter_type.capitalize()
        return StreamingResponse(
            iter([pdf_bytes]),
            media_type="application/pdf",
            headers={
                "Content-Disposition": f"attachment; filename=Employment_{letter_type}_{safe_name}.pdf"
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== DOCX Export Routes (Pro Tier) ====================

@router.post("/export-invoice-docx")
async def export_invoice_docx(request: InvoiceRequest):
    """
    Export invoice as DOCX (Pro tier only)
    """
    print("====== ROUTE: /export-invoice-docx called ======", flush=True)
    if request.tier and request.tier.upper() != "PRO":
        raise HTTPException(status_code=403, detail="DOCX export is a Pro tier feature")

    try:
        data = request.dict()
        data.pop('tier', None)
        docx_bytes = await document_generator.generate_invoice_docx(data)
        print(f"Invoice DOCX generated, size: {len(docx_bytes)} bytes", flush=True)

        return StreamingResponse(
            iter([docx_bytes]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename=invoice_{request.invoice_number}.docx"
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/export-receipt-docx")
async def export_receipt_docx(request: ReceiptRequest):
    """
    Export receipt as DOCX (Pro tier only)
    """
    print("====== ROUTE: /export-receipt-docx called ======", flush=True)
    if request.tier and request.tier.upper() != "PRO":
        raise HTTPException(status_code=403, detail="DOCX export is a Pro tier feature")

    try:
        data = request.dict()
        data.pop('tier', None)
        docx_bytes = await document_generator.generate_receipt_docx(data)
        print(f"Receipt DOCX generated, size: {len(docx_bytes)} bytes", flush=True)

        return StreamingResponse(
            iter([docx_bytes]),
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            headers={
                "Content-Disposition": f"attachment; filename=receipt_{request.receipt_number}.docx"
            }
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
