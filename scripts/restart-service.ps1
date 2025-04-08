# Restart a Docker service with admin privileges
param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName
)

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires administrator privileges. Please run as administrator."
    exit 1
}

Write-Host "Restarting service: $ServiceName"

try {
    # Restart the Docker container
    docker restart $ServiceName
    Write-Host "Service $ServiceName restarted successfully."
    exit 0
} catch {
    Write-Host "Error restarting service $ServiceName: $_"
    exit 1
}
