from pydantic import BaseModel, Field

class ConversionRequest(BaseModel):
    value: float
    from_unit: str
    to_unit: str

class CurrencyConversionRequest(BaseModel):
    amount: float
    from_currency: str
    to_currency: str
