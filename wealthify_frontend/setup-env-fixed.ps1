# PowerShell script to create .env.local file
# Run this script in the wealthify_frontend directory

$envContent = @"
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8000

# NextAuth Configuration (REQUIRED)
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3001

# OAuth Provider Configuration (OPTIONAL - for Google/GitHub OAuth)
# Uncomment and configure these if you want OAuth to work
# GOOGLE_CLIENT_ID=your-google-client-id
# GOOGLE_CLIENT_SECRET=your-google-client-secret
# GITHUB_ID=your-github-client-id
# GITHUB_SECRET=your-github-client-secret

# Supabase Configuration (if using Supabase directly)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ .env.local file created successfully!" -ForegroundColor Green
Write-Host "⚠️  Please update the environment variables with your actual values" -ForegroundColor Yellow
Write-Host "📝 For OAuth setup, see the documentation" -ForegroundColor Cyan
