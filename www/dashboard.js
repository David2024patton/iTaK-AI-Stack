document.addEventListener('DOMContentLoaded', function() {
    // Function to update service status indicators
    function updateServiceStatus() {
        fetch('/api/services/status')
            .then(response => response.json())
            .then(services => {
                // Update status for each service
                const serviceCards = document.querySelectorAll('.service-card');
                serviceCards.forEach(card => {
                    const serviceName = card.querySelector('h3').textContent.trim();
                    const statusIndicator = card.querySelector('.status-indicator');
                    const statusContainer = statusIndicator.parentElement;

                    if (services[serviceName]) {
                        const status = services[serviceName];
                        statusIndicator.classList.remove('running', 'stopped');
                        statusIndicator.classList.add(status);
                        statusContainer.innerHTML = `<span class="status-indicator ${status}"></span> ${status.charAt(0).toUpperCase() + status.slice(1)}`;
                    }
                });
            })
            .catch(error => {
                console.error('Error fetching service status:', error);
                // If API fails, set default status
                const services = document.querySelectorAll('.service-card');
                services.forEach(service => {
                    const statusIndicator = service.querySelector('.status-indicator');
                    statusIndicator.classList.remove('stopped');
                    statusIndicator.classList.add('running');
                    statusIndicator.parentElement.innerHTML = '<span class="status-indicator running"></span> Running';
                });
            });
    }

    // Function to handle service control buttons
    function setupServiceControls() {
        const startButtons = document.querySelectorAll('.start-btn');
        const stopButtons = document.querySelectorAll('.stop-btn');
        const restartButtons = document.querySelectorAll('.restart-btn');

        startButtons.forEach(button => {
            if (button.disabled) return;

            button.addEventListener('click', function() {
                const serviceCard = this.closest('.service-card');
                const serviceName = serviceCard.querySelector('h3').textContent.trim();

                // Show loading state
                this.textContent = 'Starting...';
                this.disabled = true;

                // Call the API to start the service
                fetch('/api/service/start', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ serviceName })
                })
                .then(response => response.json())
                .then(data => {
                    // Update service status
                    updateServiceStatus();

                    // Reset button
                    this.textContent = 'Start';
                    this.disabled = false;

                    // Show notification
                    showNotification(`${serviceName} started successfully`);
                })
                .catch(error => {
                    console.error('Error starting service:', error);

                    // Reset button
                    this.textContent = 'Start';
                    this.disabled = false;

                    // Show error notification
                    showNotification(`Error starting ${serviceName}`, 'error');
                });
            });
        });

        stopButtons.forEach(button => {
            if (button.disabled) return;

            button.addEventListener('click', function() {
                const serviceCard = this.closest('.service-card');
                const serviceName = serviceCard.querySelector('h3').textContent.trim();

                // Show loading state
                this.textContent = 'Stopping...';
                this.disabled = true;

                // Call the API to stop the service
                fetch('/api/service/stop', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ serviceName })
                })
                .then(response => response.json())
                .then(data => {
                    // Update service status
                    updateServiceStatus();

                    // Reset button
                    this.textContent = 'Stop';
                    this.disabled = false;

                    // Show notification
                    showNotification(`${serviceName} stopped successfully`);
                })
                .catch(error => {
                    console.error('Error stopping service:', error);

                    // Reset button
                    this.textContent = 'Stop';
                    this.disabled = false;

                    // Show error notification
                    showNotification(`Error stopping ${serviceName}`, 'error');
                });
            });
        });

        restartButtons.forEach(button => {
            if (button.disabled) return;

            button.addEventListener('click', function() {
                const serviceCard = this.closest('.service-card');
                const serviceName = serviceCard.querySelector('h3').textContent.trim();

                // Show loading state
                this.textContent = 'Restarting...';
                this.disabled = true;

                // Call the API to restart the service
                fetch('/api/service/restart', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ serviceName })
                })
                .then(response => response.json())
                .then(data => {
                    // Update service status
                    updateServiceStatus();

                    // Reset button
                    this.textContent = 'Restart';
                    this.disabled = false;

                    // Show notification
                    showNotification(`${serviceName} restarted successfully`);
                })
                .catch(error => {
                    console.error('Error restarting service:', error);

                    // Reset button
                    this.textContent = 'Restart';
                    this.disabled = false;

                    // Show error notification
                    showNotification(`Error restarting ${serviceName}`, 'error');
                });
            });
        });
    }

    // Function to show notifications
    function showNotification(message, type = 'success') {
        // Check if notification container exists, if not create it
        let notificationContainer = document.getElementById('notification-container');
        if (!notificationContainer) {
            notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.bottom = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '1000';
            document.body.appendChild(notificationContainer);
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';

        // Set color based on notification type
        if (type === 'error') {
            notification.style.backgroundColor = '#dc3545'; // Red for errors
        } else if (type === 'warning') {
            notification.style.backgroundColor = '#ffc107'; // Yellow for warnings
            notification.style.color = '#212529'; // Dark text for yellow background
        } else {
            notification.style.backgroundColor = '#4a6cf7'; // Blue for success
        }

        notification.style.color = type === 'warning' ? '#212529' : 'white';
        notification.style.padding = '12px 20px';
        notification.style.borderRadius = '5px';
        notification.style.marginTop = '10px';
        notification.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
        notification.style.transition = 'all 0.3s ease';
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(20px)';
        notification.textContent = message;

        // Add notification to container
        notificationContainer.appendChild(notification);

        // Trigger animation
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 10);

        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(20px)';

            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    // Initialize
    updateServiceStatus();
    setupServiceControls();
});
