# Simple AI Stack Installer

# Configuration
$ErrorActionPreference = "Stop"

# Check if Docker is installed and running
Write-Host "Checking Docker installation..." -ForegroundColor Cyan
try {
    $dockerVersion = docker --version
    Write-Host "Docker is installed: $dockerVersion" -ForegroundColor Green
    
    $dockerInfo = docker info
    Write-Host "Docker is running" -ForegroundColor Green
}
catch {
    Write-Host "Docker is not installed or not running" -ForegroundColor Red
    Write-Host "Please install Docker Desktop from https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
    exit 1
}

# Update hosts file with admin privileges
Write-Host "Updating hosts file..." -ForegroundColor Cyan
Start-Process powershell.exe -ArgumentList "-File .\update-hosts.ps1" -Verb RunAs -Wait

# Start the services
Write-Host "Starting services with Caddy..." -ForegroundColor Cyan
docker-compose -f docker-compose-caddy.yml up -d

# Check if services started successfully
$status = $LASTEXITCODE
if ($status -eq 0) {
    Write-Host "Services started successfully!" -ForegroundColor Green
}
else {
    Write-Host "Failed to start services. Please check the logs." -ForegroundColor Red
    exit 1
}

# Create scripts directory if it doesn't exist
if (-not (Test-Path "scripts")) {
    New-Item -ItemType Directory -Path "scripts" | Out-Null
    Write-Host "Created scripts directory" -ForegroundColor Green
}

# Create service control scripts
$startServiceContent = @'
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
'@
Set-Content -Path "scripts\start-service.ps1" -Value $startServiceContent
Write-Host "Created scripts\start-service.ps1" -ForegroundColor Green

$stopServiceContent = @'
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
'@
Set-Content -Path "scripts\stop-service.ps1" -Value $stopServiceContent
Write-Host "Created scripts\stop-service.ps1" -ForegroundColor Green

$restartServiceContent = @'
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
'@
Set-Content -Path "scripts\restart-service.ps1" -Value $restartServiceContent
Write-Host "Created scripts\restart-service.ps1" -ForegroundColor Green

$runAdminContent = @'
# Run a PowerShell script with admin privileges
param(
    [Parameter(Mandatory=$true)]
    [string]$ScriptPath,
    
    [Parameter(Mandatory=$false)]
    [string]$ServiceName
)

# Build the arguments
$arguments = "-File `"$ScriptPath`""
if ($ServiceName) {
    $arguments += " -ServiceName `"$ServiceName`""
}

# Run the script with admin privileges
Start-Process powershell.exe -ArgumentList $arguments -Verb RunAs -Wait
'@
Set-Content -Path "scripts\run-admin.ps1" -Value $runAdminContent
Write-Host "Created scripts\run-admin.ps1" -ForegroundColor Green

# Create the server.js file
$serverJsContent = @'
const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const port = 3030;

// Serve static files from the www directory
app.use(express.static('www'));
app.use(express.json());

// API endpoint to execute PowerShell commands
app.post('/api/service/:action', (req, res) => {
    const { action } = req.params;
    const { serviceName } = req.body;
    
    if (!serviceName) {
        return res.status(400).json({ error: 'Service name is required' });
    }
    
    // Map service names to container names
    const containerMap = {
        'n8n': 'n8n',
        'OpenWebUI': 'openwebui',
        'Ollama': 'ollama',
        'SearXNG': 'searxng',
        'YouTube Downloader': 'ytdlp',
        'Web Scraper (Playwright + Crawlee)': 'webscrapyd',
        'Flowise': 'flowise',
        'Portainer': 'portainer',
        'Adminer': 'adminer',
        'Supabase (PostgreSQL)': 'supabase'
    };
    
    const containerName = containerMap[serviceName] || serviceName.toLowerCase();
    
    // Validate action
    if (!['start', 'stop', 'restart'].includes(action)) {
        return res.status(400).json({ error: 'Invalid action' });
    }
    
    // Build the PowerShell command
    const scriptPath = path.resolve(`scripts\\${action}-service.ps1`);
    const runAdminPath = path.resolve('scripts\\run-admin.ps1');
    const command = `powershell.exe -File "${runAdminPath}" -ScriptPath "${scriptPath}" -ServiceName "${containerName}"`;
    
    console.log(`Executing command: ${command}`);
    
    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }
        console.log(`Stdout: ${stdout}`);
        res.json({ success: true, message: `Service ${serviceName} ${action}ed successfully` });
    });
});

// API endpoint to get service status
app.get('/api/services/status', (req, res) => {
    exec('docker ps --format "{{.Names}}"', (error, stdout, stderr) => {
        if (error) {
            console.error(`Error: ${error.message}`);
            return res.status(500).json({ error: error.message });
        }
        if (stderr) {
            console.error(`Stderr: ${stderr}`);
            return res.status(500).json({ error: stderr });
        }
        
        const runningContainers = stdout.split('\n').filter(Boolean);
        const services = {};
        
        // Map container names to service names
        const containerMap = {
            'n8n': 'n8n',
            'openwebui': 'OpenWebUI',
            'ollama': 'Ollama',
            'searxng': 'SearXNG',
            'ytdlp': 'YouTube Downloader',
            'webscrapyd': 'Web Scraper (Playwright + Crawlee)',
            'flowise': 'Flowise',
            'portainer': 'Portainer',
            'adminer': 'Adminer',
            'supabase': 'Supabase (PostgreSQL)'
        };
        
        // Set status for each service
        Object.entries(containerMap).forEach(([containerName, serviceName]) => {
            services[serviceName] = runningContainers.includes(containerName) ? 'running' : 'stopped';
        });
        
        res.json(services);
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
'@
Set-Content -Path "server.js" -Value $serverJsContent
Write-Host "Created server.js" -ForegroundColor Green

# Create the package.json file
$packageJsonContent = @'
{
  "name": "ai-stack-dashboard",
  "version": "1.0.0",
  "description": "Dashboard for AI Stack services",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
'@
Set-Content -Path "package.json" -Value $packageJsonContent
Write-Host "Created package.json" -ForegroundColor Green

# Create the start-dashboard.ps1 script
$startDashboardContent = @'
# Start the dashboard server with admin privileges
Write-Host "Starting AI Stack Dashboard..." -ForegroundColor Cyan

# Check if Node.js is installed
try {
    $nodeVersion = node -v
    Write-Host "Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "Node.js is not installed. Please install Node.js from https://nodejs.org/" -ForegroundColor Red
    exit 1
}

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
}

# Start the server with admin privileges
Start-Process powershell.exe -ArgumentList "-Command `"node server.js`"" -Verb RunAs
'@
Set-Content -Path "start-dashboard.ps1" -Value $startDashboardContent
Write-Host "Created start-dashboard.ps1" -ForegroundColor Green

# Create the start-dashboard.bat file
$startDashboardBatContent = @'
@echo off
echo Starting AI Stack Dashboard...
powershell -Command "Start-Process cmd -ArgumentList '/c npm install && node server.js' -Verb RunAs"
'@
Set-Content -Path "start-dashboard.bat" -Value $startDashboardBatContent
Write-Host "Created start-dashboard.bat" -ForegroundColor Green

# Start the dashboard server
Write-Host "Starting the dashboard server with admin privileges..." -ForegroundColor Cyan
Start-Process powershell.exe -ArgumentList "-File .\start-dashboard.ps1" -Verb RunAs
Write-Host "Dashboard server started. Open http://localhost:3030 in your browser." -ForegroundColor Green

# Display instructions
Write-Host "`nInstallation Complete!" -ForegroundColor Green
Write-Host "`nAccess your services at:" -ForegroundColor Cyan
Write-Host "  Dashboard: http://localhost" -ForegroundColor Green
Write-Host "  Dashboard with Admin Controls: http://localhost:3030" -ForegroundColor Green
Write-Host "  n8n: https://n8n.localhost" -ForegroundColor Green
Write-Host "  OpenWebUI: https://openwebui.localhost" -ForegroundColor Green
Write-Host "  Ollama API: https://ollama.localhost" -ForegroundColor Green
Write-Host "  SearXNG: https://searxng.localhost" -ForegroundColor Green
Write-Host "  YouTube Downloader: https://ytdlp.localhost" -ForegroundColor Green
Write-Host "  Web Scraper: https://webscrapyd.localhost" -ForegroundColor Green
Write-Host "  Flowise: https://flowise.localhost" -ForegroundColor Green
Write-Host "  Portainer: https://portainer.localhost" -ForegroundColor Green
Write-Host "  Adminer: https://adminer.localhost" -ForegroundColor Green
