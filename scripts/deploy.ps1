$envFile = ".env"
if (-not (Test-Path $envFile)) {
    Write-Host "Error: .env file not found!" -ForegroundColor Red
    exit 1
}

Write-Host "Reading .env file..." -ForegroundColor Cyan
$lines = Get-Content $envFile
foreach ($line in $lines) {
    if ($line -match "^([a-zA-Z0-9_]+)=(.*)$") {
        $key = $matches[1]
        $value = $matches[2]
        
        # Skip comments or empty lines
        if ($line.StartsWith("#") -or [string]::IsNullOrWhiteSpace($line)) { continue }

        Write-Host "Configuring env var: $key" -ForegroundColor Yellow
        
        # Remove existing variable from production (ignoring errors if it doesn't exist)
        cmd /c "npx vercel env rm $key production -y 2>NUL"

        # Add new variable to production
        # echo $value | vercel env add $key production
        $value | npx vercel env add $key production
    }
}

Write-Host "Starting Vercel Production Deployment..." -ForegroundColor Green
npx vercel deploy --prod

Write-Host "Deployment command finished." -ForegroundColor Green
