# Implementation Guide - CalNConvert

This guide covers the remaining implementation tasks to complete the FREE TIER of CalNConvert.

## ✅ What's Been Completed

### Frontend Structure
- ✅ Next.js 14 project with TypeScript and Tailwind CSS
- ✅ Clerk authentication setup
- ✅ Landing page (iLovePDF-style design)
- ✅ Sign-in and Sign-up pages
- ✅ Protected dashboard with sidebar
- ✅ Layout components (Header, Footer, Sidebar)
- ✅ UI components (Button, Card)
- ✅ Database schema and Drizzle ORM setup
- ✅ Middleware for route protection

### Backend Structure
- ✅ FastAPI project structure
- ✅ API routes for conversions, calculators, documents
- ✅ Unit conversion service (all units)
- ✅ Calculator service (all formulas)
- ✅ File converter service (PDF/JPG)
- ✅ Usage tracking system
- ✅ CORS configuration

## 🚀 Remaining Implementation Tasks

### 1. Frontend Pages (High Priority)

#### File Converter Page
**Location**: `frontend/src/app/(dashboard)/converters/file/page.tsx`

```typescript
// Create a page with:
- Drag & drop file upload
- Format selector (PDF, JPG)
- File size display (max 15MB)
- Progress indicator
- Download button
- Error handling
- Usage limit check
```

#### Currency Converter Page
**Location**: `frontend/src/app/(dashboard)/converters/currency/page.tsx`

```typescript
// Create a page with:
- From/To currency dropdowns
- Amount input
- Real-time conversion display
- Exchange rate display
- Popular pair shortcuts
- Usage limit check
```

#### Unit Converter Page
**Location**: `frontend/src/app/(dashboard)/converters/unit/page.tsx`

```typescript
// Create a page with:
- Category selector (Length, Weight, Temp, etc.)
- From/To unit dropdowns
- Input value field
- Real-time result
- Responsive layout
```

#### Calculator Pages (5 pages)
**Location**: `frontend/src/app/(dashboard)/calculators/[type]/page.tsx`

Create separate pages for:
- Loan calculator
- Interest calculator
- Percentage calculator
- Date difference calculator
- Unit price calculator

Each should have:
- Form inputs with validation
- Real-time results
- Result breakdown/formula display
- Print/Save functionality

#### Document Generator Pages
**Location**: `frontend/src/app/(dashboard)/documents/[type]/page.tsx`

Create pages for:
- Invoice generator (with form for all invoice fields)
- Receipt generator (with form for all receipt fields)

Each should have:
- Form with all required fields
- Live preview
- PDF download
- Watermark indicator

### 2. Backend Services

#### Document Generator Implementation
**File**: `backend/services/document_generator.py`

```python
# Implement using ReportLab:
- Create professional invoice PDF layout
- Create professional receipt PDF layout
- Add "FREE TIER" diagonal watermark
- Include all required fields
- Format numbers and dates properly
```

Example implementation:
```python
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph
from reportlab.lib import colors

async def generate_invoice(invoice_data: dict) -> bytes:
    # Create PDF document
    # Add company header
    # Add line items table
    # Add totals and watermark
    # Return as bytes
    pass
```

### 3. Error Handling & UX

#### Global Error Boundary
**Location**: `frontend/src/app/error.tsx`

```typescript
// Create error page component with:
- Error message display
- Recovery options
- Stack trace in development mode
- Redirect to home button
```

#### 404 Page
**Location**: `frontend/src/app/not-found.tsx`

```typescript
// Create 404 page with:
- Friendly message
- Navigation back to home
- Link to contact
```

#### Toast Notifications
Add to frontend dependencies: `sonner` or `react-toastify`

```typescript
// Use in components for:
- Success notifications
- Error messages
- Loading states
- Warnings
```

### 4. Environment Configuration

#### Frontend .env.local Requirements
```
# Already configured, verify:
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_... (get from Clerk dashboard)
DATABASE_URL=postgresql://... (Neon)
NEXT_PUBLIC_API_URL=http://localhost:8000 (or production URL)
NEXT_PUBLIC_CURRENCY_API_KEY=9813bb9d4d47637162c085ad
```

#### Backend .env Requirements
```
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
PORT=8000
ENV=development (or production)
```

### 5. Database Migrations

```bash
cd frontend

# Generate migrations from schema
npx drizzle-kit generate:pg

# Run migrations
npx drizzle-kit migrate

# View database
npx drizzle-kit studio
```

### 6. Testing Checklist

- [ ] User registration and login
- [ ] File upload with size validation
- [ ] PDF to JPG conversion
- [ ] JPG to PDF conversion
- [ ] Currency conversion with real-time rates
- [ ] Unit conversions (all categories)
- [ ] All 5 calculators
- [ ] Invoice generation with watermark
- [ ] Receipt generation with watermark
- [ ] Daily usage limit (5 conversions)
- [ ] Error handling and error pages
- [ ] Mobile responsiveness
- [ ] Accessibility (keyboard navigation, ARIA labels)

### 7. Frontend Performance Optimization

```typescript
// Add to components:
- React.memo for expensive components
- useMemo for calculations
- useCallback for event handlers
- Dynamic imports for code splitting

Example:
const CalculatorComponent = React.memo(({ data }) => {
  // Component code
});
```

### 8. Security Hardening

**Backend**:
- [ ] Add rate limiting (use `slowapi` or `fastapi-limiter`)
- [ ] Validate all file types and sizes
- [ ] Sanitize file names
- [ ] Add request signing/verification
- [ ] Implement API key authentication (future)

**Frontend**:
- [ ] Sanitize user inputs
- [ ] Add CSRF tokens to forms
- [ ] Implement CSP headers
- [ ] Validate file uploads on client side

### 9. Deployment Preparation

#### Vercel (Frontend)
```bash
# Create .env.production.local with production values
# Push to GitHub
# Connect Vercel to GitHub repo
# Deploy

# Vercel will auto-deploy on push to main
```

#### Railway or Render (Backend)

**Railway**:
```bash
# 1. Push backend to GitHub
# 2. Connect Railway account
# 3. Create new project from GitHub
# 4. Add environment variables
# 5. Deploy
```

**Render**:
```bash
# 1. Push backend to GitHub
# 2. Connect Render account
# 3. Create new Web Service
# 4. Select GitHub repository
# 5. Set build command: pip install -r requirements.txt
# 6. Set start command: uvicorn main:app --host 0.0.0.0 --port $PORT
# 7. Deploy
```

## 📦 Dependencies to Install

### Additional Frontend Dependencies
```bash
cd frontend
npm install sonner  # For toast notifications
npm install next-themes  # For theme support (optional)
npm install zod  # For form validation
```

### Python Dependencies (Already in requirements.txt)
The essential packages are already listed. Key ones:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `python-multipart` - File uploads
- `PyPDF2`, `Pillow`, `pdf2image` - File conversion
- `reportlab` - PDF generation
- `requests` - HTTP calls

## 🔧 Quick Start After Setup

1. **Frontend**
```bash
cd frontend
npm install
npm run dev
# Visit http://localhost:3000
```

2. **Backend**
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python main.py
# API available at http://localhost:8000
# Docs at http://localhost:8000/docs
```

3. **Database**
```bash
cd frontend
npx drizzle-kit migrate
```

## 🐛 Troubleshooting

### Clerk Authentication Not Working
- Verify webhook secret is set in Clerk dashboard
- Check `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` in .env.local
- Ensure redirect URLs are correct in Clerk dashboard

### Database Connection Failing
- Verify `DATABASE_URL` is correct
- Check Neon connection string format
- Ensure `@neondatabase/serverless` is installed

### File Conversion Not Working
- On Linux: Install `poppler-utils`
- On Mac: `brew install poppler`
- On Windows: Download from https://github.com/oschwartz10612/poppler-windows

### API 429 Error (Rate Limited)
- Usage limit reached for the day
- Limits reset at midnight UTC
- Free tier: 5 conversions/day

## 📚 Additional Resources

- [Next.js Docs](https://nextjs.org/docs)
- [FastAPI Docs](https://fastapi.tiangolo.com/)
- [Clerk Docs](https://clerk.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [ReportLab Docs](https://www.reportlab.com/)

## 🎯 Phase 2: After FREE Tier

Once FREE tier is complete, implement:
- Starter tier (paid) with unlimited conversions
- Pro tier with advanced features
- User dashboard with statistics
- Payment integration (Stripe)
- Email notifications
- Bulk conversion support

---

**Total Estimated Time**: 20-30 hours for a developer
**Difficulty Level**: Intermediate

Need help? Check existing code in `frontend/src/app` and `backend/` directories for patterns.
