# Update hosts file
# Must be run as administrator

if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Warning "You need to run this script as an Administrator."
    exit
}

$hostsFile = "$env:windir\System32\drivers\etc\hosts"
$domains = @(
    "n8n.localhost",
    "openwebui.localhost",
    "ollama.localhost",
    "searxng.localhost",
    "ytdlp.localhost",
    "webscrapyd.localhost",
    "flowise.localhost",
    "portainer.localhost",
    "adminer.localhost"
)

# Read the current hosts file content
try {
    $hostsContent = Get-Content $hostsFile -ErrorAction Stop
} catch {
    Write-Error "Failed to read hosts file: $_"
    Write-Host "Try closing any applications that might be using the hosts file." -ForegroundColor Yellow
    Write-Host "You may also try running the script again after a few moments." -ForegroundColor Yellow
    exit 1
}

$modified = $false
$newEntries = @()

# Check which domains need to be added
foreach ($domain in $domains) {
    if (-not ($hostsContent -match "127\.0\.0\.1\s+$domain")) {
        $newEntries += "127.0.0.1 $domain"
        Write-Host "Will add $domain to hosts file" -ForegroundColor Green
        $modified = $true
    } else {
        Write-Host "$domain already in hosts file" -ForegroundColor Yellow
    }
}

# If we have new entries, write them all at once
if ($modified) {
    try {
        # Add a blank line if the file doesn't end with one
        if ($hostsContent -and $hostsContent[-1] -ne "") {
            $newEntries = @("") + $newEntries
        }

        # Write all new entries at once
        Add-Content -Path $hostsFile -Value $newEntries -ErrorAction Stop
        Write-Host "Hosts file updated successfully!" -ForegroundColor Green
    } catch {
        Write-Error "Failed to update hosts file: $_"
        Write-Host "Try closing any applications that might be using the hosts file." -ForegroundColor Yellow
        Write-Host "You may also try running the script again after a few moments." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "No changes needed to hosts file." -ForegroundColor Cyan
}
