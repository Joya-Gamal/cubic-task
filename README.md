#Banking Portal - Angular Front-End Technical Solution

A modern, high-performance banking portal built with **Angular 19 (latest stable)**, **Angular Signals & RxJS**, **Reactive Forms**, **PrimeNG**, and **Clean Architecture**.

---

## 🏛️ Architectural Overview & Design Pattern

The application is architected following **Clean Architecture / Screaming Architecture** principles, with clear separation of concerns between domain entities, state management, shared UI components, custom validators, and routed feature modules:

```
src/
├── app/
│   ├── core/                                # Enterprise Domain & Infrastructure Layer
│   │   ├── guards/
│   │   │   └── auth.guard.ts                # Functional CanActivateFn route protection
│   │   ├── models/
│   │   │   ├── customer.model.ts            # Customer & Segment entities
│   │   │   ├── account.model.ts             # Account, AccountType & Status models
│   │   │   ├── transaction.model.ts         # Transaction, Filters, and Sorting interfaces
│   │   │   └── auth.model.ts                # UserSession & Login interfaces
│   │   ├── services/
│   │   │   ├── data.service.ts              # Data loader with shareReplay caching
│   │   │   ├── banking.service.ts           # Core Business Logic & Signal State Store
│   │   │   ├── auth.service.ts              # Session management & user context
│   │   │   ├── export.service.ts            # CSV export generator with UTF-8 BOM
│   │   │   └── notification.service.ts      # Reactive toast notification service
│   │   └── state/
│   │       └── (Signal-based reactive store integrated in BankingService)
│   ├── shared/                              # Reusable UI Components, Pipes & Validators
│   │   ├── components/
│   │   │   ├── header/                      # Navigation bar with customer context switcher
│   │   │   ├── sidebar/                     # Responsive sidebar with active account card
│   │   │   ├── stat-card/                   # Dynamic KPI widget with trend badges
│   │   │   ├── mini-statement-dialog/       # Layer 3: Modal mini-statement (last N txs)
│   │   │   ├── empty-state/                 # Polished empty result visual cards
│   │   │   └── toast/                       # Global animated notification toaster
│   │   ├── pipes/
│   │   │   ├── egp-currency.pipe.ts         # Standardized EGP currency formatter
│   │   │   └── iban-formatter.pipe.ts       # IBAN chunking and masking pipe
│   │   └── validators/
│   │       ├── no-future-date.validator.ts  # Date constraint: date <= today
│   │       ├── max-decimals.validator.ts    # Precision constraint: max 2 decimal places
│   │       ├── amount-range.validator.ts    # Amount limits: > 0 and <= 100,000 EGP
│   │       └── debit-balance.validator.ts   # Cross-field: Debit amount <= account balance
│   ├── features/                            # Routed Feature Modules
│   │   ├── auth/login/                      # Layer 1: Login Screen with demo presets
│   │   ├── dashboard/                       # Layer 1: Executive Dashboard & Customer Directory
│   │   ├── customer-details/                # Layer 1: Customer Profile & Accounts Grid
│   │   ├── transactions/
│   │   │   ├── transaction-list/            # Layer 2: Transactions view, filters & sorting
│   │   │   └── transaction-create/          # Layer 2: Reactive Form with real-time balance projection
│   │   └── insights/                        # Layer 3: Monthly Analytics & Category Spend Breakdown
│   ├── app.routes.ts                        # Route configurations with auth guards & lazy loading
│   ├── app.config.ts                        # Zone change detection, HttpClient, Animations, Router
│   └── app.component.ts                     # Responsive shell with conditional layout chrome
├── assets/mock/                             # Static JSON Mock Data Files
│   ├── customers.json                       # Customer records (C001 Ahmed Ali, C002 Mona Hassan)
│   ├── accounts.json                        # Accounts (A1001, A1002, A2001, A2002)
│   ├── transactions.json                    # Transaction history with balances
│   ├── transaction-types.json               # Transaction type definitions (Debit / Credit)
│   └── transaction-categories.json          # Spending categories (Groceries, Bills, etc.)
└── styles.scss                              # High-end banking design system & CSS tokens
```

---

## 🚀 Layer Specification & Feature Matrix

### Layer One: Core Portal & Customer Directory
1. **Login Screen (`/login`)**:
   - Built with **Reactive Forms** (`email` format validator, `password` minlength validator).
   - Quick-login demo buttons for:
     - **Bank Admin** (`admin@bank.com`)
     - **Ahmed Ali** (`ahmed.ali@mail.com` - CIF C001)
     - **Mona Hassan** (`mona.hassan@mail.com` - CIF C002)
   - Route protection via `auth.guard.ts` redirecting unauthenticated traffic to `/login`.
2. **Executive Dashboard (`/dashboard`)**:
   - KPI metrics: Total Portfolio Balance, Active Customers, Total Accounts, Total Transactions.
   - Real-time search filter across Name, CIF, and National ID.
   - Segment tags (`Retail`, `Priority`) and account counters.
3. **Customer Details (`/customers/:cif`)**:
   - Detailed customer header card (CIF, National ID, Segment, Email, Phone).
   - Linked accounts grid (`Current`, `Savings`) with balance, status, and IBAN copy functionality.
   - Quick navigation to "View Transactions" and "New Transaction".

---

### Layer Two: Transactions & Business Logic Handling
1. **Transactions Page (`/accounts/:id/transactions`)**:
   - Selected account summary banner with live balance and customer context.
   - Account switcher strip to swap between multiple accounts of the customer.
   - **Multi-criteria filtering**:
     - Date range filter (`startDate` to `endDate`).
     - Transaction Type filter (`All`, `Debit`, `Credit`).
     - Category dropdown filter (`Groceries`, `Bills`, `Shopping`, `Transfer`, `Income`, `Fees`, `Entertainment`).
     - Keyword search across merchant, ID, and notes.
     - One-click "Reset Filters" action.
   - **Multi-field sorting**:
     - Sort by Date (newest / oldest).
     - Sort by Amount (highest / lowest).
     - Sort by Merchant or Category.
2. **Create New Transaction (`transaction-create`)**:
   - Strictly built using **Angular Reactive Forms** (`FormGroup`, `FormControl`, `FormBuilder`).
   - Fields:
     - `Transaction Type`: Radio cards for Debit / Credit [Required].
     - `Amount`: Numeric input [Required, $> 0$, max 2 decimals, max 100,000 EGP].
     - `Date`: Date picker [Required, must not be in future].
     - `Merchant`: Text input [Required, 3 to 50 characters].
     - `Category`: Dropdown populated dynamically from `transaction-categories.json` [Required].
     - `Description`: Optional transfer memo.
3. **Business Rules**:
   - **Rule 3.1**: Debit amount cannot exceed current account balance (overdraft prevention).
   - **Rule 3.2**: Debit transactions subtract immediately from the account balance.
   - **Rule 3.3**: Credit transactions add immediately to the account balance.
   - **Rule 3.4**: Transaction IDs generated on the client side (format: `T` + unique identifier).
4. **Validation & UX**:
   - `noFutureDateValidator`: Custom validator rejecting dates past today.
   - `maxDecimalsValidator(2)`: Custom validator rejecting $> 2$ decimal places.
   - `amountRangeValidator(0.01, 100000)`: Custom validator ensuring valid positive amounts up to 100,000.
   - `debitBalanceValidator`: Cross-field validator evaluating if `type === 'Debit'` and `amount > availableBalance`, displaying instant warning alerts and preventing submission.
   - Real-time projected balance calculation ribbon in form.
   - Optimistic reactive UI updates and `localStorage` persistence with a "Reset Mock Data" button.

---

### Layer Three: Advanced Features, Performance & UX
1. **Mini Statement (Last $N$ Transactions)**:
   - Quick-access modal drawer displaying the last 5, 10, or 15 transactions for the selected account.
   - Print view and direct CSV export actions.
2. **Export Transactions to CSV**:
   - `ExportService` creates a formatted CSV with UTF-8 BOM encoding for Microsoft Excel & Numbers compatibility.
3. **Monthly Financial Insights (`/insights`)**:
   - **Total Credit (Inflows)** for the month.
   - **Total Debit (Outflows)** for the month.
   - **Net Cash Flow** (surplus / deficit indicator).
   - **Highest Spending Category** identification with spending amount.
   - Visual category distribution progress bars with proportional percentage calculations.
4. **Architecture & Performance**:
   - **JSON Caching**: `DataService` uses RxJS `shareReplay({ bufferSize: 1, refCount: false })` to avoid redundant HTTP requests for static JSON files.
   - **State Persistence**: Customer & account selections, updated account balances, and new transactions persist in `localStorage`.
   - **Pagination**: Configurable page size (5, 10, 25 items per page) with clean navigation controls.
   - **UX Polish**: Toast notifications, animated loading states, accessible contrast ratios, and responsive mobile sidebar.

---

## 🛠️ Technology Stack

- **Framework**: Angular 19.2 (Standalone Components)
- **State Management**: Angular Signals (`signal`, `computed`, `effect`) + RxJS
- **Forms**: Angular Reactive Forms (`FormBuilder`, `FormGroup`, Custom Validators)
- **UI & Icons**: PrimeNG & PrimeIcons + Custom Banking Design System
- **Styling**: SCSS with tailored HSL tokens, CSS Grid & Flexbox
- **Mock Data**: Static JSON files in `public/assets/mock/` and `src/assets/mock/`

---

## 💻 Getting Started & Running Locally

### Prerequisites
- Node.js (v18.x or later recommended)
- npm (v9.x or later)

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm start
```
Navigate your browser to: `http://localhost:4200`

### 3. Run Production Build
```bash
npm run build
```

### 4. Run Automated Unit Tests
```bash
npm test -- --watch=false
```

---

## 👤 Demo User Accounts

| User Role | Email | Password | Linked Customer |
| :--- | :--- | :--- | :--- |
| **Bank Administrator** | `admin@bank.com` | `password123` | All Customers & Accounts |
| **Ahmed Ali** | `ahmed.ali@mail.com` | `password123` | CIF C001 (Current & Savings) |
| **Mona Hassan** | `mona.hassan@mail.com` | `password123` | CIF C002 (Priority Banking) |

*(You can also use the **Quick Demo Login** buttons on the login screen for one-click access).*
# cubic-task
# task-cubic
