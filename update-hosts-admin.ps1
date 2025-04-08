# Run update-hosts.ps1 with admin privileges
Start-Process powershell.exe -ArgumentList "-File .\update-hosts.ps1" -Verb RunAs -Wait
