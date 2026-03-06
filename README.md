# Calculater – E-Commerce Calculator Tool

A full-stack Next.js application for calculating product prices, discounts, taxes, shipping costs, and order totals.

## Features

- **Basic Calculator** – Arithmetic operations for quick price math
- **Discount Calculator** – Percentage and fixed-amount discounts with bulk quantity support
- **Tax / VAT Calculator** – Sales tax computation with tax-inclusive/exclusive modes
- **Shipping Cost Calculator** – Estimate shipping based on weight, dimensions, and delivery zone
- **Order Summary** – Full order total with items, discounts, tax, and shipping
- **Calculation History** – Persistent SQLite history with timestamps

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- TypeORM + better-sqlite3
- SQLite database

## Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Docker

```bash
docker-compose up --build
```

Visit http://localhost:3000

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_PATH` | `./data/calculater.db` | Path to SQLite database |
| `DEFAULT_TAX_RATE` | `0.08` | Default tax rate (as decimal) |
| `DEFAULT_CURRENCY` | `USD` | Default currency |
