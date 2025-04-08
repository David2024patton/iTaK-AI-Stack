# Security Policy

## Supported Versions

The following versions of iTaK-AI-Stack are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of iTaK-AI-Stack seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly** until it has been addressed by our team.
2. **Submit your report privately** by creating a new issue with the title "SECURITY: [Brief description]" and mark it as private.
3. Alternatively, you can email security concerns directly to [david@itak.live].

### What to include in your report:
- A clear description of the vulnerability
- Steps to reproduce the issue
- Potential impact of the vulnerability
- Suggestions for addressing the issue (if any)

### What to expect:
- We will acknowledge receipt of your vulnerability report within 48 hours.
- We will provide a more detailed response within 7 days, indicating the next steps in handling your submission.
- We will keep you informed about our progress in addressing the vulnerability.
- After the vulnerability is fixed, we will publicly acknowledge your responsible disclosure (unless you prefer to remain anonymous).

## Security Best Practices for Deployment

When deploying iTaK-AI-Stack, we recommend the following security practices:

1. **Keep Docker and dependencies updated** to their latest stable versions.
2. **Use strong passwords** for all services, especially database connections.
3. **Restrict network access** to only necessary ports and services.
4. **Enable HTTPS** for all web-facing services using the provided Caddy configuration.
5. **Regularly backup** your data and configurations.
6. **Monitor logs** for suspicious activities.

## Security Features

iTaK-AI-Stack includes several security features:

- HTTPS support via Caddy with automatic certificate management
- Container isolation for each service
- Configurable access controls for each component

## Third-Party Dependencies

This project relies on various third-party services and libraries. While we strive to use secure dependencies, security issues may arise from these components. We monitor our dependencies using Dependabot and update them regularly.
