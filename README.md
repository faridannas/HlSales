# Internal Finance Dashboard

An enterprise-grade internal finance dashboard built with Next.js, Prisma, and SQLite to manage customers, products, sales transactions, receivables (Piutang), and financial reports.

## Features

- **Dashboard**: Real-time overview of accounts receivable, net revenue, company profit, and recent transactions.
- **Customers**: Manage customer data, set bonus thresholds, and define cascading discounts (e.g., 10% + 5%).
- **Products**: Manage product catalog for Precious Metals (LM) and Jewelry (BR) with base costs, selling prices, and margin calculations.
- **Transactions**: Create and manage sales invoices. Handles paid and unpaid (Piutang) statuses, automatic discount calculations, shipping fees, and free bonus items.
- **Financial Reports**: Comprehensive reports including net profit, active receivables, product type overview, and detailed transaction records.
- **Authentication**: Secure login system.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS / Vanilla CSS Variables
- **Database**: SQLite
- **ORM**: Prisma
- **Icons**: Custom SVG Icons

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Initialize the database and run migrations:
   ```bash
   npx prisma migrate dev
   ```

3. Seed the database with initial sample data (optional):
   ```bash
   node prisma/seed.js
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Login Credentials

By default (if using seeded/default data), use the following credentials to access the dashboard:

- **Username**: admin
- **Password**: admin123

## Usage Guide

- **Creating a Transaction**: Go to the Transactions page and click "+ Create New Invoice". Select a customer, add products, and the system will automatically apply cascading discounts. You can toggle whether the invoice is paid or unpaid (Piutang).
- **Managing Receivables**: In the Transactions page, you can easily filter by "Unpaid" to see which invoices need to be collected. Clicking the status badge will toggle it to "Paid".
- **Customer Bonuses**: Customers have a "Bonus Threshold" set in their profile. When their total transactions reach this amount, they are eligible for a free bonus item in their next transaction. This will be indicated when creating an invoice for them.

## Folder Structure

- `src/app`: Next.js App Router pages and API routes.
- `src/components`: Reusable React components (Navigation, Icons).
- `src/lib`: Utility functions and Prisma client setup.
- `prisma`: Prisma schema, migrations, and seed script.

## License

Private / Proprietary.
