# 💰 Wealthify - Personal Finance Management App

A modern, AI-powered personal finance application built with Next.js 14, featuring expense tracking, financial insights, and predictive analytics.

![Wealthify Dashboard](https://img.shields.io/badge/Status-Development-blue)
![Next.js](https://img.shields.io/badge/Next.js-14-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-38B2AC)

## ✨ Features

### 🎯 Core Features
- **Expense Tracking**: Monitor spending with beautiful charts and breakdowns
- **AI-Powered Insights**: Get personalized predictions and financial tips
- **Dashboard Analytics**: Comprehensive overview of your financial health
- **Transaction Management**: Add, edit, and categorize transactions
- **Investment Tracking**: Monitor portfolio performance and asset allocation
- **Goal Setting**: Set and track financial goals
- **Predictive Analytics**: AI-driven expense predictions and savings forecasts

### 🎨 UI/UX Features
- **Modern Dark Theme**: Purple-accented Wealthify branding
- **Responsive Design**: Works seamlessly on desktop and mobile
- **Real-time Updates**: Live data synchronization
- **Interactive Charts**: Beautiful visualizations with ApexCharts
- **Smooth Animations**: Enhanced user experience with Framer Motion

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **Framer Motion** - Animation library
- **ApexCharts** - Interactive charts
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend Integration
- **FastAPI** - Python backend for authentication and predictions
- **Supabase** - PostgreSQL database for data storage
- **JWT** - Authentication tokens
- **Axios** - HTTP client for API calls

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/wealthify.git
   cd wealthify
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Add your environment variables:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
wealthify/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Dashboard page
│   ├── transactions/      # Transaction management
│   ├── insights/          # Financial insights
│   ├── predictions/       # AI predictions
│   ├── investments/       # Investment tracking
│   ├── settings/          # User settings
│   ├── login/            # Authentication
│   └── register/         # User registration
├── components/            # Reusable UI components
│   ├── ui/               # shadcn/ui components
│   └── ...               # Custom components
├── lib/                  # Utility functions and API
├── hooks/                # Custom React hooks
├── context/              # React context providers
└── public/               # Static assets
```

## 🎯 Key Features Explained

### Dashboard
- **Summary Cards**: Quick overview of income, expenses, savings, and investments
- **Spending Chart**: Doughnut chart showing expense breakdown by category
- **Recent Transactions**: Latest transaction history
- **Quick Actions**: Add transactions, view insights, and more

### Transactions
- **Modern Card Layout**: Clean, card-based transaction list
- **Smart Filtering**: Filter by date, category, and amount
- **AI Suggestions**: Intelligent transaction categorization
- **Bulk Actions**: Select and manage multiple transactions

### Insights
- **Spending Patterns**: Analyze your spending habits
- **Category Breakdown**: Visual representation of expenses
- **Trend Analysis**: Track spending trends over time
- **AI Recommendations**: Personalized financial advice

### Predictions
- **Expense Forecasting**: Predict future expenses using AI
- **Savings Projections**: Estimate potential savings
- **Budget Recommendations**: AI-powered budget suggestions
- **Financial Goals**: Set and track financial objectives

## 🔧 Configuration

### TailwindCSS
The project uses TailwindCSS with custom configuration for the Wealthify theme:
- Purple color palette
- Dark mode support
- Custom animations
- Responsive breakpoints

### shadcn/ui Components
All UI components are built using shadcn/ui for consistency and maintainability.

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Other Platforms
- **Netlify**: Build command: `npm run build`
- **Railway**: Supports Next.js out of the box
- **AWS Amplify**: Full-stack deployment solution

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **shadcn/ui** for the beautiful component library
- **ApexCharts** for interactive data visualizations
- **Framer Motion** for smooth animations
- **TailwindCSS** for the utility-first styling approach

## 📞 Support

For support, email yashmaheshwari441@gmail.com or create an issue in this repository.

---

**Built with ❤️ by Yash Maheshwari** 