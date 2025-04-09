# iTaK AI Stack

A comprehensive AI development environment with Caddy, n8n, Ollama, and more!

Created by [David Patton](https://YouTube.com/@David-Patton)

## Overview

iTaK AI Stack is an all-in-one solution for AI development, automation, and data management. It includes a collection of powerful tools that work together seamlessly, all running in Docker containers with HTTPS support via Caddy.

## Included Services

| Service | Description | Local URL | HTTPS URL |
|---------|-------------|-----------|-----------|
| Dashboard | Main control panel | http://localhost | https://localhost |
| n8n | Workflow automation platform | http://localhost:5678 | https://n8n.localhost |
| OpenWebUI | Web interface for Ollama | http://localhost:3000 | https://openwebui.localhost |
| Ollama | Run LLMs locally | http://localhost:11434 | https://ollama.localhost |
| SearXNG | Privacy-respecting metasearch engine | http://localhost:8080 | https://searxng.localhost |
| YouTube Downloader | Tool for downloading videos | http://localhost:8081 | https://ytdlp.localhost |
| Web Scraper | Advanced web scraping API with Playwright | http://localhost:5000 | https://webscrapyd.localhost |
| Flowise | Build LLM apps with a visual interface | http://localhost:3001 | https://flowise.localhost |
| Portainer | Container management UI | http://localhost:9000 | https://portainer.localhost |
| Adminer | Database management tool | http://localhost:8082 | https://adminer.localhost |
| Supabase (PostgreSQL) | PostgreSQL database | - | Access via Adminer |

## Requirements

- Windows, macOS, or Linux
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- 8GB RAM minimum (16GB recommended)
- 20GB free disk space

## Installation

1. Clone this repository or download and extract the ZIP file
2. Open a terminal/PowerShell window in the extracted directory
3. Run the installation script:

```powershell
# On Windows
.\install.ps1

# On macOS/Linux
chmod +x install.sh
./install.sh
```

4. Follow the on-screen instructions

## Using HTTPS

To use the HTTPS URLs with .localhost domains:

1. Run the hosts file update script as Administrator:

```powershell
# On Windows
.\update-hosts.ps1

# On macOS/Linux
sudo ./update-hosts.sh
```

2. Access any of the HTTPS URLs in your browser
3. Accept the self-signed certificate warning

## Integration Examples

### n8n + Web Scraper + Supabase

1. In n8n, create a new workflow
2. Add an HTTP Request node to call the Web Scraper:
   - Method: POST
   - URL: http://webscrapyd:5000/scrape
   - Body: JSON
   ```json
   {
     "url": "https://example.com",
     "selector": "h1, p",
     "mode": "advanced"
   }
   ```
3. Add a PostgreSQL node to store the results in Supabase:
   - Host: supabase
   - Database: postgres
   - User: postgres
   - Password: postgres

### Ollama + OpenWebUI + SearXNG

1. Access OpenWebUI at https://openwebui.localhost
2. Create a new chat
3. Use SearXNG to search for information
4. Ask Ollama to analyze the search results

## Troubleshooting

If you encounter issues:

1. Check if all containers are running:
```
docker ps
```

2. View logs for a specific service:
```
docker logs ai_stack_test-[service_name]
```

3. Restart a specific service:
```
docker-compose -f docker-compose-caddy.yml restart [service_name]
```

4. Verify the installation:
```
.\verify-caddy.ps1
```

## Security Considerations

- The dashboard is only fully accessible from localhost
- Remote connections see a limited welcome page
- Default credentials are provided for testing only
- Change default passwords for production use

## Support and Contributions

If you find this project helpful, please consider:

- Subscribing to [my YouTube channel](https://YouTube.com/@David-Patton)
- Joining the channel membership for exclusive content
- Contributing to the project on GitHub

## License

This project is licensed under the MIT License - see the LICENSE file for details.

![image](https://github.com/user-attachments/assets/d701fe02-cca9-4abf-80f3-505b47ce57c4)

