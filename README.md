# Wealthify - Personal Finance Dashboard

A modern Next.js 14 application for tracking personal finances with AI-powered predictions.

## Features

- 🔐 **Authentication**: Secure login and registration system
- 📊 **Expense Tracking**: Track expenses across 12 categories
- 📈 **Visual Analytics**: Interactive charts and tables
- 🤖 **AI Predictions**: Get expense and savings predictions
- 📱 **Responsive Design**: Works on desktop and mobile
- 🌙 **Dark Mode**: Built-in theme support

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: TailwindCSS + shadcn/ui components
- **Authentication**: JWT-based with localStorage
- **Charts**: Recharts for data visualization
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios for API calls
- **Icons**: Lucide React

## API Endpoints

The frontend integrates with the following backend endpoints:

- `POST /login` - User authentication
- `POST /register` - User registration
- `GET /expenses/:user_id?month=` - Fetch user expenses
- `POST /expenses` - Add new expense
- `POST /predict-expense` - Get expense predictions
- `POST /predict/savings` - Get savings predictions

## Project Structure

```
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── register/          # Registration page
│   ├── dashboard/         # Main dashboard
│   ├── add-expense/       # Add expense form
│   ├── predictions/       # AI predictions page
│   └── layout.tsx         # Root layout
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   ├── ExpenseTable.tsx  # Expense data table
│   └── ExpenseChart.tsx  # Expense visualization
├── context/              # React contexts
│   └── AuthContext.tsx   # Authentication context
├── lib/                  # Utility libraries
│   └── api.ts           # API client configuration
├── hooks/                # Custom React hooks
└── middleware.ts         # Next.js middleware
```

## Getting Started

### Prerequisites

- Node.js 18+ 
- pnpm (recommended) or npm

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd wealthify
```

2. Install dependencies:
```bash
pnpm install
```

3. Set up environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_API_URL=http://localhost:8000
```

4. Run the development server:
```bash
pnpm dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Pages Overview

### 1. Login Page (`/login`)
- Email and password authentication
- Form validation with Zod
- Redirects to dashboard on success

### 2. Register Page (`/register`)
- User registration with name, email, and password
- Password confirmation validation
- Automatic login after successful registration

### 3. Dashboard (`/dashboard`)
- Overview of financial data
- Expense chart visualization
- Quick action buttons
- Navigation to other features

### 4. Add Expense (`/add-expense`)
- Form with 12 expense categories:
  - Food & Dining
  - Transportation
  - Entertainment
  - Shopping
  - Healthcare
  - Education
  - Housing
  - Utilities
  - Insurance
  - Savings
  - Debt Payments
  - Other
- Real-time total calculation
- Month selection

### 5. Predictions (`/predictions`)
- Income input form
- Month selection
- Two prediction cards:
  - Predicted Expenses
  - Predicted Savings
- Percentage breakdowns
- AI explanation section

## Authentication Flow

1. **Login**: Users enter email/password → JWT stored in localStorage
2. **Registration**: New users create account → Automatic login
3. **Protected Routes**: All pages except login/register require authentication
4. **Logout**: Clears localStorage and redirects to login

## API Integration

The application uses a centralized API client (`lib/api.ts`) with:

- Automatic JWT token injection
- Error handling and 401 redirects
- TypeScript interfaces for all API calls
- Axios interceptors for request/response handling

## Styling

- **TailwindCSS**: Utility-first CSS framework
- **shadcn/ui**: High-quality React components
- **Responsive Design**: Mobile-first approach
- **Dark Mode**: System preference detection

## Development

### Available Scripts

```bash
pnpm dev          # Start development server
pnpm build        # Build for production
pnpm start        # Start production server
pnpm lint         # Run ESLint
```

### Code Quality

- TypeScript for type safety
- ESLint for code linting
- Prettier for code formatting
- Zod for runtime validation

## Deployment

The application can be deployed to:

- **Vercel** (recommended for Next.js)
- **Netlify**
- **Railway**
- Any Node.js hosting platform

### Environment Variables

Set the following environment variables in production:

```bash
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License. 