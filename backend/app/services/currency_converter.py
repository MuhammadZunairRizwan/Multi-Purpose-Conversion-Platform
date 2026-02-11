import httpx
import asyncio
from datetime import datetime, timedelta
from typing import Dict, Tuple

# ExchangeRate-API key - provided in environment or hardcoded for testing
API_KEY = "9813bb9d4d47637162c085ad"
BASE_URL = "https://v6.exchangerate-api.com/v6"

# Cache for exchange rates to avoid excessive API calls
_rate_cache: Dict[str, Tuple[float, datetime]] = {}
CACHE_DURATION = timedelta(hours=1)


async def get_exchange_rate(from_currency: str, to_currency: str) -> float:
    """
    Get exchange rate between two currencies using ExchangeRate-API.
    Returns the rate to convert 1 unit of from_currency to to_currency.
    Uses caching to avoid excessive API calls.

    Args:
        from_currency: Source currency code (e.g., 'USD')
        to_currency: Target currency code (e.g., 'EUR')

    Returns:
        Exchange rate as float

    Raises:
        ValueError: If currencies are invalid or API call fails
    """
    cache_key = f"{from_currency}_{to_currency}"

    # Check cache
    if cache_key in _rate_cache:
        rate, timestamp = _rate_cache[cache_key]
        if datetime.now() - timestamp < CACHE_DURATION:
            return rate

    try:
        # Validate currency codes (basic validation)
        if not from_currency or not to_currency:
            raise ValueError("Currency codes cannot be empty")

        if len(from_currency) != 3 or len(to_currency) != 3:
            raise ValueError("Currency codes must be 3 letters long")

        # Build API URL
        url = f"{BASE_URL}/{API_KEY}/latest/{from_currency.upper()}"

        # Make async HTTP request
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url)
            response.raise_for_status()

            data = response.json()

            # Check for API errors
            if data.get("result") == "error":
                error_type = data.get("error-type", "unknown")
                raise ValueError(f"Currency conversion error: {error_type}")

            # Extract the exchange rate
            rates = data.get("conversion_rates", {})
            to_currency_upper = to_currency.upper()

            if to_currency_upper not in rates:
                raise ValueError(f"Currency {to_currency} not supported")

            rate = float(rates[to_currency_upper])

            # Cache the result
            _rate_cache[cache_key] = (rate, datetime.now())

            return rate

    except httpx.HTTPError as e:
        raise ValueError(f"API request failed: {str(e)}")
    except ValueError:
        raise
    except Exception as e:
        raise ValueError(f"Unexpected error during currency conversion: {str(e)}")


async def convert_currency(
    amount: float,
    from_currency: str,
    to_currency: str
) -> Dict[str, any]:
    """
    Convert an amount from one currency to another.

    Args:
        amount: Amount to convert
        from_currency: Source currency code
        to_currency: Target currency code

    Returns:
        Dictionary with conversion result and rate
    """
    if amount < 0:
        raise ValueError("Amount cannot be negative")

    # If currencies are the same, return 1:1 conversion
    if from_currency.upper() == to_currency.upper():
        return {
            "amount": amount,
            "from_currency": from_currency,
            "to_currency": to_currency,
            "converted_amount": amount,
            "exchange_rate": 1.0
        }

    # Get exchange rate
    rate = await get_exchange_rate(from_currency, to_currency)

    # Calculate converted amount
    converted_amount = amount * rate

    return {
        "amount": amount,
        "from_currency": from_currency.upper(),
        "to_currency": to_currency.upper(),
        "converted_amount": converted_amount,
        "exchange_rate": rate
    }


def clear_cache():
    """Clear the exchange rate cache"""
    global _rate_cache
    _rate_cache.clear()
