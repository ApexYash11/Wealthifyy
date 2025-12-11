# 💰 Wealthify - Intelligent Personal Finance Management

Wealthify is a comprehensive, AI-powered personal finance application designed to help users track expenses, manage budgets, and gain actionable financial insights. It combines a modern, responsive frontend with a robust, data-driven backend.

## 🏗️ System Architecture

The project follows a modern decoupled architecture:

```mermaid
graph TD
    Client[Next.js Frontend] <-->|REST API / JSON| API[FastAPI Backend]
    Client <-->|Auth SDK| Auth[Supabase Auth]
    API <-->|Async SQLAlchemy| DB[(Supabase PostgreSQL)]
    API -->|Inference| ML[ML Models (Scikit-Learn/XGBoost)]
    
    subgraph "Frontend Layer"
        Client
    end
    
    subgraph "Backend Layer"
        API
        ML
    end
    
    subgraph "Data Layer"
        DB
        Auth
    end
```

### Components

1.  **Frontend (Client)**: Built with Next.js 15 and TypeScript. It handles user interaction, data visualization, and communicates with the backend via REST endpoints. It also interacts directly with Supabase for authentication flows.
2.  **Backend (API)**: A high-performance FastAPI application. It serves as the central logic hub, handling data processing, database interactions, and executing machine learning models for budget predictions and categorization.
3.  **Database**: Hosted on Supabase (PostgreSQL). It stores user profiles, transaction history, and budget configurations.
4.  **ML Engine**: Integrated directly into the FastAPI backend, providing real-time predictions for future expenses and intelligent transaction categorization.

---

## 🛠️ Tech Stack

### Frontend (`/wealthify_frontend`)
*   **Framework**: Next.js 15 (App Router)
*   **Language**: TypeScript
*   **Styling**: Tailwind CSS, Shadcn UI
*   **State Management**: React Hooks
*   **Data Fetching**: Axios
*   **Visualization**: Recharts, Chart.js
*   **Auth**: Supabase Auth Helpers

### Backend (`/wealthify_backend`)
*   **Framework**: FastAPI
*   **Language**: Python 3.12+
*   **Server**: Uvicorn
*   **Database ORM**: SQLAlchemy (AsyncIO)
*   **Validation**: Pydantic v2
*   **Data Science**: Pandas, NumPy, Scikit-learn, XGBoost
*   **Scheduling**: APScheduler (for recurring tasks)

### Infrastructure
*   **Database**: PostgreSQL (Supabase)
*   **Authentication**: Supabase Auth (JWT)

---

## 📂 Project Structure

The repository is structured as a monorepo containing both client and server code:

```
Wealthify/
├── wealthify_backend/       # Python FastAPI Server
│   ├── app/
│   │   ├── api/            # API Route Controllers
│   │   ├── core/           # Config & DB Setup
│   │   ├── ml/             # Machine Learning Logic
│   │   ├── models/         # SQLAlchemy DB Models
│   │   ├── schemas/        # Pydantic Data Schemas
│   │   └── services/       # Business Logic Layer
│   ├── ml_model.py         # ML Training/Inference Scripts
│   └── requirements.txt    # Python Dependencies
│
├── wealthify_frontend/      # Next.js Client Application
│   ├── app/                # App Router Pages
│   ├── components/         # React Components
│   ├── lib/                # API Clients & Utils
│   └── package.json        # Node Dependencies
│
└── README.md               # This file
```

---

## 🚀 Getting Started

### Prerequisites
*   Node.js 18+
*   Python 3.10+
*   PostgreSQL Database (or Supabase project)

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd wealthify_backend
```

Create a virtual environment and install dependencies:
```bash
python -m venv env
# Windows
.\env\Scripts\activate
# Mac/Linux
source env/bin/activate

pip install -r requirements.txt
```

Configure Environment Variables:
Create a `.env` file in `wealthify_backend/` with:
```env
DATABASE_URL=postgresql+asyncpg://user:pass@host:5432/db
SECRET_KEY=your_secret_key
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
```

Run the Server:
```bash
uvicorn run:app --reload
```
*The API will be available at `http://localhost:8000`*
*API Docs: `http://localhost:8000/docs`*

### 2. Frontend Setup

Navigate to the frontend directory:
```bash
cd wealthify_frontend
```

Install dependencies:
```bash
npm install
# or
pnpm install
```

Configure Environment Variables:
Create a `.env.local` file in `wealthify_frontend/` with:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Run the Development Server:
```bash
npm run dev
```
*The application will be available at `http://localhost:3000`*

---

## ✨ Key Features

*   **Dashboard**: Real-time overview of financial health, recent transactions, and monthly spending limits.
*   **Smart Transactions**: Add income/expenses with automatic categorization.
*   **Budgeting**: Set monthly budgets and track progress with visual indicators.
*   **AI Insights**:
    *   **Expense Prediction**: Forecast next month's spending based on historical data.
    *   **Anomalies**: Detect unusual spending patterns.
*   **Secure Auth**: Full login/registration flow with Google OAuth support.

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes.
4.  Push to the branch and open a Pull Request.

## 📄 License

This project is licensed under the MIT License.
>>>>>>> 5cc2c96 (Bulk commit: save workspace changes)
