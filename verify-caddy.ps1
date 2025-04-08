# Verify Caddy Installation
Write-Host "Verifying Caddy installation..."

# List of expected containers
$expectedContainers = @(
    "caddy",
    "dashboard",
    "n8n-import",
    "n8n",
    "supabase",
    "openwebui",
    "ollama",
    "searxng",
    "ytdlp",
    "webscrapyd",
    "flowise",
    "portainer",
    "adminer"
)

# Check if containers are running
$runningContainers = docker ps --format "{{.Names}}"
$missingContainers = @()

foreach ($container in $expectedContainers) {
    if ($runningContainers -notcontains $container) {
        $missingContainers += $container
    }
}

if ($missingContainers.Count -gt 0) {
    Write-Host "The following containers are not running:" -ForegroundColor Red
    foreach ($container in $missingContainers) {
        Write-Host "  - $container" -ForegroundColor Red
    }
    Write-Host "Please check the logs for errors:" -ForegroundColor Yellow
    Write-Host "  docker logs <container_name>" -ForegroundColor Yellow
} else {
    Write-Host "All containers are running!" -ForegroundColor Green
}

# Display URLs
Write-Host "`nAccess your services at:" -ForegroundColor Cyan
Write-Host "  Dashboard: http://localhost" -ForegroundColor Green
Write-Host "  n8n: https://n8n.localhost" -ForegroundColor Green
Write-Host "  OpenWebUI: https://openwebui.localhost" -ForegroundColor Green
Write-Host "  Ollama API: https://ollama.localhost" -ForegroundColor Green
Write-Host "  SearXNG: https://searxng.localhost" -ForegroundColor Green
Write-Host "  YouTube Downloader: https://ytdlp.localhost" -ForegroundColor Green
Write-Host "  Web Scraper: https://webscrapyd.localhost" -ForegroundColor Green
Write-Host "  Flowise: https://flowise.localhost" -ForegroundColor Green
Write-Host "  Portainer: https://portainer.localhost" -ForegroundColor Green
Write-Host "  Adminer: https://adminer.localhost" -ForegroundColor Green

Write-Host "`nNote: You may need to add these domains to your hosts file for HTTPS to work." -ForegroundColor Yellow
