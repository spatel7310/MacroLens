# Single Family Rental (SFR) Calculator

## Overview
Client-only conservative underwriting tool for single family long-term rental properties. Shares the same address lookup, stress test, max offer price, and saved deals features as the Multifamily Deal Analyzer. Accessible via tabs on the Deal Analyzer section.

## User Inputs
- Bedrooms (select: 1-5)
- Bathrooms (select: 1-4, including half baths)
- Monthly rent (nullable — auto-fills from HUD FMR if address is looked up)
- Purchase price ($)
- Location (state dropdown, mapped to regional buckets)
- Down payment % (default 20%)
- Loan term (select: 15, 20, 25, 30 years — default 30)
- Interest rate (optional override, defaults to 10Y Treasury + 2.5%)

## Rent Estimation
When an address is looked up and the monthly rent field is empty, the calculator auto-fills rent from HUD Fair Market Rent data based on bedroom count:
- Maps bedroom count (0-4) to the corresponding FMR tier (Studio through 4BR)
- 5+ bedrooms use the 4BR FMR value
- Applies a **5% conservative haircut** to the FMR value

## Regional Assumptions

| Region | States | Tax Rate | Insurance (annual) | Maintenance | CapEx |
|--------|--------|----------|--------------------|-------------|-------|
| Southeast | NC, SC, GA, FL, TN | 1.1% | $1,200 | 10% | 8% |
| Midwest | MI, OH, IN, IL | 1.5% | $1,000 | 11% | 9% |
| NE/West | NY, CA, WA, NJ, MA | 1.3% | $1,500 | 10% | 8% |
| Default | All others | 1.2% | $1,200 | 10% | 8% |

Key differences from Multifamily:
- Insurance is a **fixed annual amount** (not per-unit)
- Maintenance and CapEx percentages are slightly lower (single property)

## Global Assumptions
- Vacancy: 8% (lower than MF's 10% — single family tenants tend to stay longer)
- Other expenses: 3% of gross rent
- Management: 0% (self-managed)

## Calculations
1. Gross Annual Rent = monthly_rent * 12
2. Effective Gross Income = GAR * (1 - vacancy)
3. Operating Expenses = taxes + insurance + maintenance + capex + leasing + other
4. NOI = EGI - OpEx
5. Cap Rate = NOI / purchase_price
6. Debt Service via standard amortization formula
7. Cash Flow = NOI - Annual Debt Service
8. Cash-on-Cash = Annual Cash Flow / Cash Invested

## Deal Quality Labels
Based on monthly cash flow (more intuitive for SFR than cap rate):
- Monthly cash flow < $0: **"Negative Cash Flow"**
- Monthly cash flow $0-$199: **"Thin Margin"**
- Monthly cash flow >= $200: **"Healthy Cash Flow"**

## Warning Flags
- Negative Cash Flow
- High Expense Load (expense ratio > 55%)
- High Tax Market (tax rate >= 1.5%)
- High Debt Cost (interest rate > 7%)
- No Rent Entered (rent field is empty)

## Max Offer Price
- **By Cap Rate:** max_price = NOI / target_cap_rate
- **By CoC Return:** Closed-form algebraic solution (same approach as MF — NOI and ADS are both linear in price)

## Stress Test
Same as Multifamily: -10% rent, +10% expenses. Toggled via shared stress test button.

## Saved Deals
Shares the same saved deals list as Multifamily. Each saved deal stores its type (MF or SFR) and displays a label in the saved deals list. Loading a saved deal switches to the correct tab.

## Output
NOI, Cap Rate, Cash Flow (monthly + annual), Cash-on-Cash Return, Expense Ratio, Deal Label, Flags, Max Offer Prices
