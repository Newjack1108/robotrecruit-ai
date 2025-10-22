# PowerShell script to run migration on Railway production database

Write-Host "🚀 Running migration on Railway production database..." -ForegroundColor Cyan

# Run the migration using Railway's environment
railway run npx prisma migrate deploy

Write-Host ""
Write-Host "✅ Migration command executed!" -ForegroundColor Green
Write-Host "📋 Check the output above for success/failure" -ForegroundColor Yellow
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. If migration succeeded, restart Railway service" -ForegroundColor White
Write-Host "  2. Visit https://www.robotrecruit.ai" -ForegroundColor White
Write-Host "  3. Sign in and check for trial banner" -ForegroundColor White

