# CalNConvert - Online File Converter & Calculator Tools

A modern, full-stack SaaS platform providing free online conversion and calculation tools. Similar to iLovePDF but with broader functionality.

Live Demo: https://calcnconvert.net

## Features

### File Converters
- PDF Conversions: PDF <-> JPG/PNG, PDF <-> DOCX, PDF OCR
- Image Conversions: JPG <-> PNG, JPG <-> JPEG, PNG <-> JPEG
- Office Conversions: DOCX <-> PDF, XLSX/XLS <-> PDF, PPTX/PPT <-> PDF
- Batch Processing: Convert multiple files at once
- Batch Image Combining: Merge multiple images into single PDF/DOCX
- Image Reordering: Drag-and-drop to reorder images before combining
- Image Thumbnails: Visual preview of images in batch mode

### Unit Converters
- 7 Categories: Length, Weight, Temperature, Volume, Area, Speed, Time
- 30+ Units supported

### Currency Converter
- 150+ Currencies with real-time exchange rates

### Calculators (10+ Options)
- Free Tier: Loan, Interest, Percentage, Date Difference, Unit Price
- Starter Tier: Amortization, Profit Margin, Salary, Savings
- Pro Tier: ROI, Break-even

## Technology Stack

### Frontend
- Next.js 16, React 19, TypeScript
- Tailwind CSS 4, shadcn/ui Components
- Clerk Authentication, Drizzle ORM
- Neon PostgreSQL, Stripe Integration

### Backend
- FastAPI (Python 3.11), Uvicorn
- SQLAlchemy, PostgreSQL
- Pillow, PyPDF2, python-docx
- Tesseract OCR

### DevOps
- AWS EC2 (t3.micro, Ubuntu 22.04)
- PM2 Process Manager
- Nginx Reverse Proxy
- Let's Encrypt SSL

## Quick Start

### Frontend
cd frontend
npm install
npm run dev
# Open http://localhost:3000

### Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# API at http://localhost:8000

## Deployment

See DEPLOYMENT_MEMORY.md for AWS EC2 deployment instructions.

Quick Deploy:
ssh -i aws/calnconvert-key.pem ubuntu@54.80.17.59
cd /var/www/calnconvert/backend
source venv/bin/activate
pm2 restart calnconvert-api
cd /var/www/calnconvert/frontend
npm run build
pm2 restart calnconvert-web

## API Endpoints

File Conversions:
- POST /convert/jpg-to-pdf
- POST /convert/png-to-pdf
- POST /convert/pdf-to-jpg
- POST /convert/batch/images-to-pdf
- POST /convert/batch/images-to-docx
- POST /convert/pdf-ocr

Unit Conversions:
- POST /convert/length, /weight, /temperature, /volume, /area, /speed, /time

Calculators:
- POST /calculate/loan, /interest, /percentage, /date-diff, /unit-price

Auto-generated Swagger docs: http://localhost:8000/docs

## Database Schema

Tables:
- users (Clerk auth)
- subscriptions (Stripe)
- conversion_usage (daily tracking)
- conversion_history (logs)
- calculator_usage (metrics)
- document_history (documents)
- anonymous_usage (IP-based tracking)

## Security

- Clerk Authentication
- File Type & Size Validation
- XSS Protection
- SQL Injection Prevention
- CORS Configuration
- Temp File Auto-cleanup
- SSL/TLS HTTPS
- Rate Limiting Ready

## Project Statistics

- Lines of Code: 4,500+
- API Endpoints: 80+
- File Formats: 20+
- Units: 30+
- Currencies: 150+
- Database Tables: 7
- TypeScript Files: 50+
- Python Files: 10+
- Status: Production Ready

## Support

Email: support@calcnconvert.net
Website: https://calcnconvert.net
Deployment: DEPLOYMENT_MEMORY.md
Progress: PROGRESS_REPORT.md

## License

MIT License

---

Version: 1.0.0
Last Updated: February 2026
Status: Production Ready
