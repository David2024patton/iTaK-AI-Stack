# Stop a Docker service with admin privileges
param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName
)

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires administrator privileges. Please run as administrator."
    exit 1
}

Write-Host "Stopping service: $ServiceName"

try {
    # Stop the Docker container
    docker stop $ServiceName
    Write-Host "Service $ServiceName stopped successfully."
    exit 0
} catch {
    Write-Host "Error stopping service $ServiceName: $_"
    exit 1
}
