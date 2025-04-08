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
