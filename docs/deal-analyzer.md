# Multifamily Deal Analyzer

## Overview
Client-only conservative underwriting tool for small multifamily deals (5-20 units). Provides instant deal analysis with location-aware expense assumptions, plus a max offer price calculator that back-solves from target cap rate or cash-on-cash return.

## User Inputs
- Units (number, 1-20)
- Purchase price ($)
- Avg rent per unit ($/month)
- Location (state dropdown, mapped to regional buckets)
- Down payment % (default 25%)
- Loan term (select: 15, 20, 25, 30 years)
- Interest rate (optional override, defaults to 10Y Treasury + 2.5%)

## Regional Assumptions

| Region | States | Tax Rate | Insurance/Unit | Maintenance | CapEx |
|--------|--------|----------|----------------|-------------|-------|
| Southeast | NC, SC, GA, FL, TN | 1.1% | $350 | 12% | 10% |
| Midwest | MI, OH, IN, IL | 1.5% | $300 | 13% | 11% |
| NE/West | NY, CA, WA, NJ, MA | 1.3% | $400 | 12% | 10% |
| Default | All others | 1.2% | $325 | 12% | 10% |

## Global Assumptions
- Vacancy: 10%
- Utilities: 5% of gross rent
- Other expenses: 3% of gross rent
- Management: 0% (self-managed)

## Calculations
1. Gross Potential Rent = units * avg_rent * 12
2. Effective Gross Income = GPR * (1 - vacancy)
3. Operating Expenses = maintenance + capex + utilities + other + taxes + insurance
4. NOI = EGI - OpEx
5. Cap Rate = NOI / purchase_price
6. Debt Service via standard amortization formula
7. Cash Flow = NOI - Annual Debt Service
8. Cash-on-Cash = Annual Cash Flow / Cash Invested

## Deal Quality Labels
- Cap < 6%: "Tight"
- Cap 6-8%: "Decent"
- Cap > 8%: "Strong"

## Warning Flags
- Negative cash flow
- Expense ratio > 50%
- Interest rate > 7%

## Max Offer Price
- **By Cap Rate:** max_price = NOI / target_cap_rate
- **By CoC Return:** Closed-form algebraic solution (NOI and ADS are both linear in price)

## Output
NOI, Cap Rate, Cash Flow (monthly + annual), Cash-on-Cash Return, Expense Ratio, Deal Label, Flags, Max Offer Prices
