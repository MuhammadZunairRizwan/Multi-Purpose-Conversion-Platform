from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any
from services import calculator_service

router = APIRouter()

class LoanCalculatorRequest(BaseModel):
    principal: float
    annual_rate: float
    years: int

class InterestCalculatorRequest(BaseModel):
    principal: float
    rate: float
    time: float

class PercentageCalculatorRequest(BaseModel):
    operation: str  # "is_percent_of", "percent_of", "increase", "decrease"
    values: Dict[str, float]

class DateDifferenceRequest(BaseModel):
    start_date: str  # "YYYY-MM-DD"
    end_date: str    # "YYYY-MM-DD"

class UnitPriceCalculatorRequest(BaseModel):
    total_price: float
    quantity: float

# Starter Tier Calculator Requests
class AmortizationCalculatorRequest(BaseModel):
    principal: float
    annual_rate: float
    years: int

class ProfitMarginCalculatorRequest(BaseModel):
    cost: float
    revenue: float

class SalaryHourlyCalculatorRequest(BaseModel):
    amount: float
    conversion_type: str  # "salary_to_hourly" or "hourly_to_salary"
    hours_per_week: float = 40
    weeks_per_year: float = 52

class SavingsCalculatorRequest(BaseModel):
    initial_deposit: float
    monthly_contribution: float
    annual_rate: float
    years: int

# Pro Tier Calculator Requests
class ROICalculatorRequest(BaseModel):
    initial_investment: float
    final_value: float
    time_years: float = 1

class BreakevenCalculatorRequest(BaseModel):
    fixed_costs: float
    price_per_unit: float
    variable_cost_per_unit: float

@router.post("/loan")
async def loan_calculator(request: LoanCalculatorRequest):
    """
    Calculate loan payment
    Formula: M = P[r(1+r)^n]/[(1+r)^n-1]
    where M = Monthly payment, P = Principal, r = Monthly rate, n = Number of payments
    """
    try:
        result = await calculator_service.calculate_loan(
            request.principal,
            request.annual_rate,
            request.years
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/interest")
async def simple_interest_calculator(request: InterestCalculatorRequest):
    """
    Calculate simple interest
    Formula: SI = (P × R × T) / 100
    where SI = Simple Interest, P = Principal, R = Rate, T = Time
    """
    try:
        result = await calculator_service.calculate_simple_interest(
            request.principal,
            request.rate,
            request.time
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/percentage")
async def percentage_calculator(request: PercentageCalculatorRequest):
    """
    Calculate percentage based on operation:
    - is_percent_of: X is what % of Y
    - percent_of: What is X% of Y
    - increase: X increased by Y%
    - decrease: X decreased by Y%
    """
    try:
        result = await calculator_service.calculate_percentage(
            request.operation,
            request.values
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/date-difference")
async def date_difference_calculator(request: DateDifferenceRequest):
    """
    Calculate the difference between two dates
    """
    try:
        result = await calculator_service.calculate_date_difference(
            request.start_date,
            request.end_date
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/unit-price")
async def unit_price_calculator(request: UnitPriceCalculatorRequest):
    """
    Calculate unit price
    """
    try:
        result = await calculator_service.calculate_unit_price(
            request.total_price,
            request.quantity
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== STARTER TIER CALCULATORS ====================

@router.post("/amortization")
async def amortization_calculator(request: AmortizationCalculatorRequest):
    """
    Calculate amortization schedule with monthly payment breakdown
    Requires: Starter tier or higher
    """
    try:
        result = await calculator_service.calculate_amortization(
            request.principal,
            request.annual_rate,
            request.years
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/profit-margin")
async def profit_margin_calculator(request: ProfitMarginCalculatorRequest):
    """
    Calculate profit margin, gross margin, and markup
    Requires: Starter tier or higher
    """
    try:
        result = await calculator_service.calculate_profit_margin(
            request.cost,
            request.revenue
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/salary-hourly")
async def salary_hourly_calculator(request: SalaryHourlyCalculatorRequest):
    """
    Convert between annual salary and hourly rate
    Requires: Starter tier or higher
    """
    try:
        result = await calculator_service.calculate_salary_hourly(
            request.amount,
            request.conversion_type,
            request.hours_per_week,
            request.weeks_per_year
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/savings")
async def savings_calculator(request: SavingsCalculatorRequest):
    """
    Calculate future value of savings with compound interest
    Requires: Starter tier or higher
    """
    try:
        result = await calculator_service.calculate_savings(
            request.initial_deposit,
            request.monthly_contribution,
            request.annual_rate,
            request.years
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PRO TIER CALCULATORS ====================

@router.post("/roi")
async def roi_calculator(request: ROICalculatorRequest):
    """
    Calculate Return on Investment (ROI) and annualized ROI
    Requires: Pro tier
    """
    try:
        result = await calculator_service.calculate_roi(
            request.initial_investment,
            request.final_value,
            request.time_years
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/breakeven")
async def breakeven_calculator(request: BreakevenCalculatorRequest):
    """
    Calculate break-even point in units and revenue
    Requires: Pro tier
    """
    try:
        result = await calculator_service.calculate_breakeven(
            request.fixed_costs,
            request.price_per_unit,
            request.variable_cost_per_unit
        )
        return result
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
