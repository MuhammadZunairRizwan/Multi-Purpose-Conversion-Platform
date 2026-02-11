from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, PageTemplate, Frame
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.pdfgen import canvas
from reportlab.lib.utils import ImageReader
from io import BytesIO
from datetime import datetime
from typing import List, Dict, any
import os


class WatermarkCanvas(canvas.Canvas):
    """Custom Canvas class that adds watermark to pages"""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.watermark_text = "FREE TIER"

    def showPage(self):
        """Add watermark before showing page"""
        # Save the current state
        self.saveState()

        # Set watermark properties
        self.setFont("Helvetica", 60)
        self.setFillAlpha(0.1)
        self.setFillColor(colors.grey)

        # Rotate and position watermark
        width, height = letter
        self.translate(width / 2, height / 2)
        self.rotate(45)
        self.drawCentredString(0, 0, self.watermark_text)

        # Restore state
        self.restoreState()

        # Call parent to show page
        super().showPage()


async def generate_invoice_pdf(invoice_data: Dict) -> bytes:
    """
    Generate a PDF invoice with watermark.

    Args:
        invoice_data: Dictionary containing invoice details

    Returns:
        PDF content as bytes
    """
    buffer = BytesIO()

    # Create PDF document with custom canvas class
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        canvasmaker=WatermarkCanvas
    )

    elements = []
    styles = getSampleStyleSheet()

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#EF4444'),
        spaceAfter=30,
        alignment=1  # Center alignment
    )
    elements.append(Paragraph("INVOICE", title_style))

    # Invoice header info
    invoice_info = f"""
    <b>Invoice #:</b> {invoice_data.get('invoice_number', 'N/A')}<br/>
    <b>Date:</b> {invoice_data.get('invoice_date', 'N/A')}<br/>
    <b>Due Date:</b> {invoice_data.get('due_date', 'N/A')}
    """
    elements.append(Paragraph(invoice_info, styles['Normal']))
    elements.append(Spacer(1, 0.2 * inch))

    # From/To section
    from_to_data = [
        ["FROM", "TO"],
        [
            f"""<b>{invoice_data.get('from_company', '')}</b><br/>
            {invoice_data.get('from_address', '')}<br/>
            Email: {invoice_data.get('from_email', '')}<br/>
            Phone: {invoice_data.get('from_phone', '')}""",
            f"""<b>{invoice_data.get('to_client', '')}</b><br/>
            {invoice_data.get('to_address', '')}<br/>
            Email: {invoice_data.get('to_email', '')}"""
        ]
    ]

    from_to_table = Table(from_to_data, colWidths=[3.5 * inch, 3.5 * inch])
    from_to_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FEE2E2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#991B1B')),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('FONTSIZE', (0, 1), (-1, -1), 9),
    ]))

    elements.append(from_to_table)
    elements.append(Spacer(1, 0.3 * inch))

    # Line items table
    line_items_data = [["Description", "Qty", "Rate", "Amount"]]

    for item in invoice_data.get('line_items', []):
        amount = item.get('quantity', 0) * item.get('rate', 0)
        line_items_data.append([
            item.get('description', ''),
            str(item.get('quantity', 0)),
            f"${item.get('rate', 0):.2f}",
            f"${amount:.2f}"
        ])

    line_items_table = Table(line_items_data, colWidths=[3 * inch, 1 * inch, 1 * inch, 1 * inch])
    line_items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FEE2E2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#991B1B')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FAFAFA')]),
    ]))

    elements.append(line_items_table)
    elements.append(Spacer(1, 0.2 * inch))

    # Totals section
    subtotal = sum(item.get('quantity', 0) * item.get('rate', 0) for item in invoice_data.get('line_items', []))
    discount_amount = subtotal * (invoice_data.get('discount', 0) / 100)
    taxable_amount = subtotal - discount_amount
    tax_amount = taxable_amount * (invoice_data.get('tax_rate', 0) / 100)
    total = taxable_amount + tax_amount

    totals_data = [
        ["", "SUBTOTAL", f"${subtotal:.2f}"],
    ]

    if invoice_data.get('discount', 0) > 0:
        totals_data.append(["", f"DISCOUNT ({invoice_data.get('discount', 0)}%)", f"-${discount_amount:.2f}"])

    if invoice_data.get('tax_rate', 0) > 0:
        totals_data.append(["", f"TAX ({invoice_data.get('tax_rate', 0)}%)", f"${tax_amount:.2f}"])

    totals_data.append(["", "TOTAL", f"${total:.2f}"])

    totals_table = Table(totals_data, colWidths=[3 * inch, 2 * inch, 1.5 * inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (1, 0), (1, -1), 'Helvetica-Bold'),
        ('FONTNAME', (2, 0), (2, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (1, -1), (2, -1), 12),
        ('BACKGROUND', (0, -1), (-1, -1), colors.HexColor('#FEE2E2')),
        ('TEXTCOLOR', (0, -1), (-1, -1), colors.HexColor('#991B1B')),
        ('GRID', (0, -1), (-1, -1), 1, colors.grey),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, -1), (-1, -1), 12),
    ]))

    elements.append(totals_table)
    elements.append(Spacer(1, 0.3 * inch))

    # Notes section
    if invoice_data.get('notes'):
        notes_style = ParagraphStyle(
            'Notes',
            parent=styles['Normal'],
            fontSize=9,
            textColor=colors.grey,
        )
        elements.append(Paragraph(f"<b>Notes:</b> {invoice_data.get('notes')}", notes_style))

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()


async def generate_receipt_pdf(receipt_data: Dict) -> bytes:
    """
    Generate a PDF receipt with watermark.

    Args:
        receipt_data: Dictionary containing receipt details

    Returns:
        PDF content as bytes
    """
    buffer = BytesIO()

    # Create PDF document with custom canvas class
    doc = SimpleDocTemplate(
        buffer,
        pagesize=letter,
        rightMargin=0.5 * inch,
        leftMargin=0.5 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.5 * inch,
        canvasmaker=WatermarkCanvas
    )

    elements = []
    styles = getSampleStyleSheet()

    # Title
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=24,
        textColor=colors.HexColor('#EF4444'),
        spaceAfter=20,
        alignment=1  # Center alignment
    )
    elements.append(Paragraph("RECEIPT", title_style))

    # Receipt header info
    receipt_info = f"""
    <b>Receipt #:</b> {receipt_data.get('receipt_number', 'N/A')}<br/>
    <b>Date:</b> {receipt_data.get('receipt_date', 'N/A')}<br/>
    <b>Payment Method:</b> {receipt_data.get('payment_method', 'Cash')}
    """
    elements.append(Paragraph(receipt_info, styles['Normal']))
    elements.append(Spacer(1, 0.2 * inch))

    # Business info
    business_info = f"""
    <b>{receipt_data.get('from_business', '')}</b><br/>
    {receipt_data.get('from_address', '')}<br/>
    Phone: {receipt_data.get('from_phone', '')}<br/>
    Email: {receipt_data.get('from_email', '')}
    """
    business_style = ParagraphStyle(
        'BusinessInfo',
        parent=styles['Normal'],
        fontSize=9,
        textColor=colors.grey,
    )
    elements.append(Paragraph(business_info, business_style))
    elements.append(Spacer(1, 0.2 * inch))

    # Customer name if provided
    if receipt_data.get('customer_name'):
        elements.append(Paragraph(f"<b>Customer:</b> {receipt_data.get('customer_name')}", styles['Normal']))
        elements.append(Spacer(1, 0.1 * inch))

    # Line items table
    line_items_data = [["Description", "Qty", "Rate", "Amount"]]

    for item in receipt_data.get('line_items', []):
        amount = item.get('quantity', 0) * item.get('rate', 0)
        line_items_data.append([
            item.get('description', ''),
            str(item.get('quantity', 0)),
            f"${item.get('rate', 0):.2f}",
            f"${amount:.2f}"
        ])

    line_items_table = Table(line_items_data, colWidths=[3 * inch, 1 * inch, 1 * inch, 1 * inch])
    line_items_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FEE2E2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#991B1B')),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (0, 0), (0, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
        ('GRID', (0, 0), (-1, -1), 1, colors.grey),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#FAFAFA')]),
    ]))

    elements.append(line_items_table)
    elements.append(Spacer(1, 0.2 * inch))

    # Total
    total = sum(item.get('quantity', 0) * item.get('rate', 0) for item in receipt_data.get('line_items', []))

    totals_data = [
        ["", "TOTAL", f"${total:.2f}"]
    ]

    totals_table = Table(totals_data, colWidths=[3 * inch, 2 * inch, 1.5 * inch])
    totals_table.setStyle(TableStyle([
        ('ALIGN', (0, 0), (-1, -1), 'RIGHT'),
        ('FONTNAME', (1, 0), (2, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (1, 0), (2, 0), 12),
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#FEE2E2')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.HexColor('#991B1B')),
        ('GRID', (0, 0), (-1, 0), 1, colors.grey),
        ('TOPPADDING', (0, 0), (-1, 0), 12),
        ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
    ]))

    elements.append(totals_table)

    # Build PDF
    doc.build(elements)
    buffer.seek(0)
    return buffer.getvalue()
