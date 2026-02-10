// errorHandler.js
// Global error handling system

class ErrorHandler {
  constructor() {
    this.init();
  }

  init() {
    // Only handle critical errors, not all iframe errors
    window.addEventListener('error', (e) => {
      // Only handle actual JavaScript errors, not resource loading
      if (e.message && !e.target.tagName) {
        console.error('JavaScript Error:', e.message);
      }
    });

    // Handle fetch errors without blocking
    window.addEventListener('unhandledrejection', (e) => {
      console.error('Unhandled promise rejection:', e.reason);
      e.preventDefault(); // Prevent default error handling
    });
  }

  handleStreamError() {
    this.showError(
      'Stream Loading Error',
      'Failed to load the stream. The link might be broken or unavailable.',
      [
        { text: 'Try Another Stream', action: () => this.suggestAlternativeStreams() },
        { text: 'Report Issue', action: () => this.reportIssue() }
      ]
    );
  }

  suggestAlternativeStreams() {
    // Navigate to channels page
    const channelsTab = document.getElementById('nav-channels');
    if (channelsTab) {
      channelsTab.click();
      this.showToast('Browse alternative channels', 'info');
    }
  }

  reportIssue() {
    this.showToast('Thank you! Issue reported.', 'success');
    // In production, this would send to a backend
  }

  showError(title, message, actions = []) {
    const errorModal = document.createElement('div');
    errorModal.className = 'error-modal';
    errorModal.innerHTML = `
      <div class="error-modal-content">
        <div class="error-modal-header">
          <i class="fas fa-exclamation-triangle"></i>
          <h3>${title}</h3>
        </div>
        <div class="error-modal-body">
          <p>${message}</p>
        </div>
        <div class="error-modal-actions">
          ${actions.map((action, i) => `
            <button class="error-action-btn" data-action="${i}">
              ${action.text}
            </button>
          `).join('')}
          <button class="error-action-btn secondary" data-action="close">
            Close
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(errorModal);
    setTimeout(() => errorModal.classList.add('show'), 100);

    // Add event listeners
    errorModal.querySelectorAll('.error-action-btn').forEach((btn, i) => {
      btn.addEventListener('click', () => {
        const actionIndex = btn.getAttribute('data-action');
        if (actionIndex === 'close') {
          this.closeError(errorModal);
        } else {
          actions[actionIndex].action();
          this.closeError(errorModal);
        }
      });
    });

    // Close on overlay click
    errorModal.addEventListener('click', (e) => {
      if (e.target === errorModal) {
        this.closeError(errorModal);
      }
    });
  }

  closeError(modal) {
    modal.classList.remove('show');
    setTimeout(() => modal.remove(), 300);
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check' : 'info'}-circle"></i> ${message}`;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  // Network error handling
  handleNetworkError() {
    this.showError(
      'Network Error',
      'Unable to connect to the server. Please check your internet connection.',
      [
        { text: 'Retry', action: () => window.location.reload() }
      ]
    );
  }

  // Data loading error
  handleDataLoadError(type) {
    this.showError(
      'Loading Error',
      `Failed to load ${type}. The service might be temporarily unavailable.`,
      [
        { text: 'Retry', action: () => window.location.reload() }
      ]
    );
  }
}

// Initialize error handler
const errorHandler = new ErrorHandler();
window.errorHandler = errorHandler;

// Retry mechanism for failed fetches
window.fetchWithRetry = async function(url, options = {}, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return response;
    } catch (error) {
      if (i === retries - 1) {
        errorHandler.handleNetworkError();
        throw error;
      }
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, i) * 1000));
    }
  }
};
