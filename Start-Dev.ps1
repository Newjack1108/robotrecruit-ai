param(
  [int]$Port = 3000,
  [string]$WebhookPath = "/webhook",
  [string]$AppCmd = "npm run dev -- -p {PORT}"
)

$WebhookUrl = "http://localhost:$Port$WebhookPath"
$ResolvedAppCmd = $AppCmd.Replace("{PORT}", $Port.ToString())

# Start Stripe listener in background
$listener = Start-Process -FilePath "stripe" -ArgumentList @("listen","--forward-to",$WebhookUrl) -NoNewWindow -PassThru
Write-Host "Stripe listener started (PID $($listener.Id)) → $WebhookUrl"

# Start your app
$app = Start-Process -FilePath "powershell" -ArgumentList "-NoLogo","-NoProfile","-Command",$ResolvedAppCmd -NoNewWindow -PassThru
Write-Host "App started (PID $($app.Id)) with: $ResolvedAppCmd"

# Stop both on exit
Register-EngineEvent PowerShell.Exiting -Action {
  Get-Process -Id $listener.Id,$app.Id -ErrorAction SilentlyContinue | Stop-Process
} | Out-Null

Wait-Process -Id $app.Id
