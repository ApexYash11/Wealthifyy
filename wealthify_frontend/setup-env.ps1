# PowerShell script to create .env.local file
# Run this script in the wealthify_frontend directory

$envContent = @"
# Backend API URL (required)
NEXT_PUBLIC_API_URL=http://localhost:8000

# Supabase Configuration (required for Google OAuth)
NEXT_PUBLIC_SUPABASE_URL=https://hfiwgtdfquqxwpkogojm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key_here

# NextAuth Configuration (optional - if using NextAuth)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
"@

$envContent | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host "✅ .env.local file created successfully!" -ForegroundColor Green
Write-Host "⚠️  Please update NEXT_PUBLIC_SUPABASE_ANON_KEY with your actual Supabase anon key" -ForegroundColor Yellow
Write-Host "📝 You can find this in your Supabase dashboard under Settings > API" -ForegroundColor Cyan 