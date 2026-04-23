# Salesforce Revenue Validation Scenario

This pack is ready for Canary's current CSV upload flow and also includes Excel workbooks for analyst review.

## Files

1. `csv/salesforce-opportunities.csv`
2. `csv/salesforce-bookings.csv`
3. `csv/salesforce-revenue-schedule.csv`

Matching workbook versions live under `xlsx/`.

## Upload Order

1. Opportunities
2. Bookings
3. Revenue schedule

## Seeded Issues

- Missing `amount_usd` on `OPP-1003`
- Duplicate `opportunity_id` for `OPP-1008`
- Reversed contract dates on `OPP-1004`
- Orphan booking `BKG-5006` tied to `OPP-9999`
- Orphan schedule `SCH-7007` tied to `BKG-5999`
- Blank `booking_id` on `SCH-7008`
- Negative recognized revenue on `SCH-7009`
