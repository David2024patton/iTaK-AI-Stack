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
