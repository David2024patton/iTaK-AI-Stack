# Start a Docker service with admin privileges
param(
    [Parameter(Mandatory=$true)]
    [string]$ServiceName
)

# Check if running as administrator
if (-NOT ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")) {
    Write-Host "This script requires administrator privileges. Please run as administrator."
    exit 1
}

Write-Host "Starting service: $ServiceName"

try {
    # Start the Docker container
    docker start $ServiceName
    Write-Host "Service $ServiceName started successfully."
    exit 0
} catch {
    Write-Host "Error starting service $ServiceName: $_"
    exit 1
}
