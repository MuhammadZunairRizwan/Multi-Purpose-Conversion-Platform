"""
Calculator Service
Handles all calculator functions
"""

from datetime import datetime

async def calculate_loan(principal: float, annual_rate: float, years: int) -> dict:
    """
    Calculate loan payment
    Formula: M = P[r(1+r)^n]/[(1+r)^n-1]
    """
    if principal <= 0 or annual_rate < 0 or years <= 0:
        raise ValueError("Invalid input values")

    monthly_rate = annual_rate / 100 / 12
    num_payments = years * 12

    if monthly_rate == 0:
        monthly_payment = principal / num_payments
    else:
        monthly_payment = principal * (monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)

    total_payment = monthly_payment * num_payments
    total_interest = total_payment - principal

    return {
        "monthly_payment": round(monthly_payment, 2),
        "total_payment": round(total_payment, 2),
        "total_interest": round(total_interest, 2),
        "principal": principal,
        "annual_rate": annual_rate,
        "years": years
    }

async def calculate_simple_interest(principal: float, rate: float, time: float) -> dict:
    """
    Calculate simple interest
    Formula: SI = (P × R × T) / 100
    """
    if principal <= 0 or rate < 0 or time <= 0:
        raise ValueError("Invalid input values")

    interest = (principal * rate * time) / 100
    total_amount = principal + interest

    return {
        "interest": round(interest, 2),
        "total_amount": round(total_amount, 2),
        "principal": principal,
        "rate": rate,
        "time": time
    }

async def calculate_percentage(operation: str, values: dict) -> dict:
    """
    Calculate percentage based on operation
    """
    if operation == "is_percent_of":
        # X is what % of Y
        x = values.get("x", 0)
        y = values.get("y", 0)
        if y == 0:
            raise ValueError("Division by zero")
        result = (x / y) * 100
        return {"result": round(result, 2), "operation": operation, "values": values}

    elif operation == "percent_of":
        # What is X% of Y
        x = values.get("percent", 0)
        y = values.get("value", 0)
        result = (x / 100) * y
        return {"result": round(result, 2), "operation": operation, "values": values}

    elif operation == "increase":
        # X increased by Y%
        x = values.get("value", 0)
        y = values.get("percent", 0)
        result = x + (x * y / 100)
        return {"result": round(result, 2), "operation": operation, "values": values}

    elif operation == "decrease":
        # X decreased by Y%
        x = values.get("value", 0)
        y = values.get("percent", 0)
        result = x - (x * y / 100)
        return {"result": round(result, 2), "operation": operation, "values": values}

    else:
        raise ValueError("Invalid operation")

async def calculate_date_difference(start_date_str: str, end_date_str: str) -> dict:
    """
    Calculate the difference between two dates
    """
    try:
        start_date = datetime.strptime(start_date_str, "%Y-%m-%d")
        end_date = datetime.strptime(end_date_str, "%Y-%m-%d")
    except ValueError:
        raise ValueError("Invalid date format. Use YYYY-MM-DD")

    difference = end_date - start_date
    total_days = difference.days

    years = total_days // 365
    remaining_days = total_days % 365
    months = remaining_days // 30
    days = remaining_days % 30

    return {
        "years": years,
        "months": months,
        "days": days,
        "total_days": total_days,
        "start_date": start_date_str,
        "end_date": end_date_str
    }

async def calculate_unit_price(total_price: float, quantity: float) -> dict:
    """
    Calculate unit price
    """
    if total_price < 0 or quantity <= 0:
        raise ValueError("Invalid input values")

    unit_price = total_price / quantity

    return {
        "unit_price": round(unit_price, 2),
        "total_price": total_price,
        "quantity": quantity
    }


# ==================== STARTER TIER CALCULATORS ====================

async def calculate_amortization(principal: float, annual_rate: float, years: int) -> dict:
    """
    Calculate amortization schedule
    Shows monthly payment breakdown over the loan term
    """
    if principal <= 0 or annual_rate < 0 or years <= 0:
        raise ValueError("Invalid input values")

    monthly_rate = annual_rate / 100 / 12
    num_payments = years * 12

    if monthly_rate == 0:
        monthly_payment = principal / num_payments
    else:
        monthly_payment = principal * (monthly_rate * (1 + monthly_rate) ** num_payments) / ((1 + monthly_rate) ** num_payments - 1)

    # Generate amortization schedule (first 12 months + summary)
    schedule = []
    balance = principal
    total_interest = 0
    total_principal = 0

    for month in range(1, min(num_payments + 1, 13)):  # Show first 12 months
        interest_payment = balance * monthly_rate
        principal_payment = monthly_payment - interest_payment
        balance -= principal_payment
        total_interest += interest_payment
        total_principal += principal_payment

        schedule.append({
            "month": month,
            "payment": round(monthly_payment, 2),
            "principal": round(principal_payment, 2),
            "interest": round(interest_payment, 2),
            "balance": round(max(balance, 0), 2)
        })

    # Calculate totals for full loan
    full_total_interest = (monthly_payment * num_payments) - principal

    return {
        "monthly_payment": round(monthly_payment, 2),
        "total_payment": round(monthly_payment * num_payments, 2),
        "total_interest": round(full_total_interest, 2),
        "principal": principal,
        "annual_rate": annual_rate,
        "years": years,
        "num_payments": num_payments,
        "schedule": schedule
    }


async def calculate_profit_margin(cost: float, revenue: float) -> dict:
    """
    Calculate profit margin
    Gross Margin = ((Revenue - Cost) / Revenue) * 100
    Markup = ((Revenue - Cost) / Cost) * 100
    """
    if cost < 0 or revenue < 0:
        raise ValueError("Invalid input values")
    if revenue == 0:
        raise ValueError("Revenue cannot be zero")

    profit = revenue - cost
    gross_margin = (profit / revenue) * 100 if revenue > 0 else 0
    markup = (profit / cost) * 100 if cost > 0 else 0

    return {
        "cost": round(cost, 2),
        "revenue": round(revenue, 2),
        "profit": round(profit, 2),
        "gross_margin": round(gross_margin, 2),
        "markup": round(markup, 2)
    }


async def calculate_salary_hourly(amount: float, conversion_type: str, hours_per_week: float = 40, weeks_per_year: float = 52) -> dict:
    """
    Convert between annual salary and hourly rate
    conversion_type: "salary_to_hourly" or "hourly_to_salary"
    """
    if amount <= 0 or hours_per_week <= 0 or weeks_per_year <= 0:
        raise ValueError("Invalid input values")

    total_hours_per_year = hours_per_week * weeks_per_year

    if conversion_type == "salary_to_hourly":
        hourly_rate = amount / total_hours_per_year
        monthly_salary = amount / 12
        weekly_salary = amount / weeks_per_year
        daily_rate = weekly_salary / 5  # Assuming 5 work days

        return {
            "annual_salary": round(amount, 2),
            "monthly_salary": round(monthly_salary, 2),
            "weekly_salary": round(weekly_salary, 2),
            "daily_rate": round(daily_rate, 2),
            "hourly_rate": round(hourly_rate, 2),
            "hours_per_week": hours_per_week,
            "weeks_per_year": weeks_per_year
        }
    elif conversion_type == "hourly_to_salary":
        annual_salary = amount * total_hours_per_year
        monthly_salary = annual_salary / 12
        weekly_salary = amount * hours_per_week
        daily_rate = weekly_salary / 5

        return {
            "hourly_rate": round(amount, 2),
            "daily_rate": round(daily_rate, 2),
            "weekly_salary": round(weekly_salary, 2),
            "monthly_salary": round(monthly_salary, 2),
            "annual_salary": round(annual_salary, 2),
            "hours_per_week": hours_per_week,
            "weeks_per_year": weeks_per_year
        }
    else:
        raise ValueError("Invalid conversion type. Use 'salary_to_hourly' or 'hourly_to_salary'")


async def calculate_savings(initial_deposit: float, monthly_contribution: float, annual_rate: float, years: int) -> dict:
    """
    Calculate future value of savings with compound interest
    FV = P(1+r)^n + PMT * [((1+r)^n - 1) / r]
    """
    if initial_deposit < 0 or monthly_contribution < 0 or annual_rate < 0 or years <= 0:
        raise ValueError("Invalid input values")

    monthly_rate = annual_rate / 100 / 12
    num_months = years * 12

    if monthly_rate == 0:
        future_value = initial_deposit + (monthly_contribution * num_months)
    else:
        # Future value of initial deposit
        fv_initial = initial_deposit * ((1 + monthly_rate) ** num_months)
        # Future value of monthly contributions
        fv_contributions = monthly_contribution * (((1 + monthly_rate) ** num_months - 1) / monthly_rate)
        future_value = fv_initial + fv_contributions

    total_contributions = initial_deposit + (monthly_contribution * num_months)
    total_interest = future_value - total_contributions

    # Year-by-year breakdown (first 5 years)
    yearly_breakdown = []
    balance = initial_deposit
    for year in range(1, min(years + 1, 6)):
        for month in range(12):
            balance = balance * (1 + monthly_rate) + monthly_contribution
        yearly_breakdown.append({
            "year": year,
            "balance": round(balance, 2)
        })

    return {
        "future_value": round(future_value, 2),
        "total_contributions": round(total_contributions, 2),
        "total_interest": round(total_interest, 2),
        "initial_deposit": initial_deposit,
        "monthly_contribution": monthly_contribution,
        "annual_rate": annual_rate,
        "years": years,
        "yearly_breakdown": yearly_breakdown
    }


# ==================== PRO TIER CALCULATORS ====================

async def calculate_roi(initial_investment: float, final_value: float, time_years: float = 1) -> dict:
    """
    Calculate Return on Investment
    ROI = ((Final Value - Initial Investment) / Initial Investment) * 100
    Annualized ROI = ((Final/Initial)^(1/years) - 1) * 100
    """
    if initial_investment <= 0:
        raise ValueError("Initial investment must be greater than zero")
    if final_value < 0 or time_years <= 0:
        raise ValueError("Invalid input values")

    gain = final_value - initial_investment
    roi = (gain / initial_investment) * 100

    # Annualized ROI (CAGR)
    if time_years > 0 and final_value > 0:
        annualized_roi = (((final_value / initial_investment) ** (1 / time_years)) - 1) * 100
    else:
        annualized_roi = 0

    return {
        "initial_investment": round(initial_investment, 2),
        "final_value": round(final_value, 2),
        "gain_loss": round(gain, 2),
        "roi_percent": round(roi, 2),
        "annualized_roi": round(annualized_roi, 2),
        "time_years": time_years,
        "is_profit": gain > 0
    }


async def calculate_breakeven(fixed_costs: float, price_per_unit: float, variable_cost_per_unit: float) -> dict:
    """
    Calculate Break-even point
    Break-even Units = Fixed Costs / (Price per Unit - Variable Cost per Unit)
    """
    if fixed_costs < 0 or price_per_unit < 0 or variable_cost_per_unit < 0:
        raise ValueError("Values cannot be negative")

    contribution_margin = price_per_unit - variable_cost_per_unit

    if contribution_margin <= 0:
        raise ValueError("Price per unit must be greater than variable cost per unit")

    breakeven_units = fixed_costs / contribution_margin
    breakeven_revenue = breakeven_units * price_per_unit
    contribution_margin_ratio = (contribution_margin / price_per_unit) * 100

    # Calculate profit at different sales levels
    profit_analysis = []
    for multiplier in [0.5, 1, 1.5, 2, 2.5]:
        units = breakeven_units * multiplier
        revenue = units * price_per_unit
        total_costs = fixed_costs + (units * variable_cost_per_unit)
        profit = revenue - total_costs
        profit_analysis.append({
            "units": round(units, 0),
            "revenue": round(revenue, 2),
            "total_costs": round(total_costs, 2),
            "profit": round(profit, 2)
        })

    return {
        "breakeven_units": round(breakeven_units, 2),
        "breakeven_revenue": round(breakeven_revenue, 2),
        "contribution_margin": round(contribution_margin, 2),
        "contribution_margin_ratio": round(contribution_margin_ratio, 2),
        "fixed_costs": fixed_costs,
        "price_per_unit": price_per_unit,
        "variable_cost_per_unit": variable_cost_per_unit,
        "profit_analysis": profit_analysis
    }
