"""
Unit Conversion Service
Handles all unit conversions
"""

async def convert_length(value: float, from_unit: str, to_unit: str) -> float:
    """Convert length units"""
    # All conversions to meters
    to_meters = {
        'm': 1,
        'km': 1000,
        'mile': 1609.34,
        'ft': 0.3048,
        'inch': 0.0254,
        'cm': 0.01,
        'mm': 0.001,
        'yd': 0.9144
    }

    if from_unit not in to_meters or to_unit not in to_meters:
        raise ValueError(f"Invalid unit: {from_unit} or {to_unit}")

    meters = value * to_meters[from_unit]
    return meters / to_meters[to_unit]

async def convert_weight(value: float, from_unit: str, to_unit: str) -> float:
    """Convert weight units"""
    to_grams = {
        'g': 1,
        'kg': 1000,
        'lb': 453.592,
        'oz': 28.3495,
        'ton': 1000000,
        'mg': 0.001
    }

    if from_unit not in to_grams or to_unit not in to_grams:
        raise ValueError(f"Invalid unit: {from_unit} or {to_unit}")

    grams = value * to_grams[from_unit]
    return grams / to_grams[to_unit]

async def convert_temperature(value: float, from_unit: str, to_unit: str) -> float:
    """Convert temperature units"""
    if from_unit == to_unit:
        return value

    # Convert to Celsius first
    if from_unit == 'C':
        celsius = value
    elif from_unit == 'F':
        celsius = (value - 32) * 5/9
    elif from_unit == 'K':
        celsius = value - 273.15
    else:
        raise ValueError(f"Invalid temperature unit: {from_unit}")

    # Convert from Celsius to target
    if to_unit == 'C':
        return celsius
    elif to_unit == 'F':
        return celsius * 9/5 + 32
    elif to_unit == 'K':
        return celsius + 273.15
    else:
        raise ValueError(f"Invalid temperature unit: {to_unit}")

async def convert_volume(value: float, from_unit: str, to_unit: str) -> float:
    """Convert volume units"""
    to_liters = {
        'l': 1,
        'ml': 0.001,
        'gallon': 3.78541,
        'cup': 0.236588,
        'm3': 1000,
        'cm3': 0.001,
        'fl_oz': 0.0295735,
        'pint': 0.473176,
        'quart': 0.946353
    }

    if from_unit not in to_liters or to_unit not in to_liters:
        raise ValueError(f"Invalid unit: {from_unit} or {to_unit}")

    liters = value * to_liters[from_unit]
    return liters / to_liters[to_unit]

async def convert_area(value: float, from_unit: str, to_unit: str) -> float:
    """Convert area units"""
    to_m2 = {
        'm2': 1,
        'km2': 1000000,
        'ft2': 0.092903,
        'acre': 4046.86,
        'hectare': 10000
    }

    if from_unit not in to_m2 or to_unit not in to_m2:
        raise ValueError(f"Invalid unit: {from_unit} or {to_unit}")

    m2 = value * to_m2[from_unit]
    return m2 / to_m2[to_unit]

async def convert_speed(value: float, from_unit: str, to_unit: str) -> float:
    """Convert speed units"""
    to_ms = {
        'm/s': 1,
        'km/h': 0.277778,
        'mph': 0.44704,
        'ft/s': 0.3048,
        'knot': 0.51444
    }

    if from_unit not in to_ms or to_unit not in to_ms:
        raise ValueError(f"Invalid unit: {from_unit} or {to_unit}")

    ms = value * to_ms[from_unit]
    return ms / to_ms[to_unit]

async def convert_time(value: float, from_unit: str, to_unit: str) -> float:
    """Convert time units"""
    to_seconds = {
        's': 1,
        'min': 60,
        'h': 3600,
        'day': 86400,
        'week': 604800,
        'month': 2592000,  # 30 days
        'year': 31536000   # 365 days
    }

    if from_unit not in to_seconds or to_unit not in to_seconds:
        raise ValueError(f"Invalid unit: {from_unit} or {to_unit}")

    seconds = value * to_seconds[from_unit]
    return seconds / to_seconds[to_unit]
