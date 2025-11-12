import { Alert as RNAlert, Platform } from 'react-native';

// Web-compatible Alert implementation
class WebAlert {
  static alert(title, message, buttons = [{ text: 'OK' }], options = {}) {
    if (Platform.OS !== 'web') {
      return RNAlert.alert(title, message, buttons, options);
    }

    // Web implementation using modern browser APIs
    if ('confirm' in window && buttons.length <= 2) {
      const fullMessage = message ? `${title}\n\n${message}` : title;
      
      if (buttons.length === 1) {
        window.alert(fullMessage);
        const callback = buttons[0].onPress;
        if (callback) callback();
        return;
      }
      
      // Two buttons - use confirm dialog
      const result = window.confirm(fullMessage);
      const callback = result ? buttons[1]?.onPress : buttons[0]?.onPress;
      if (callback) callback();
      return;
    }

    // Fallback to custom modal for complex alerts
    this.showCustomAlert(title, message, buttons);
  }

  static showCustomAlert(title, message, buttons = [{ text: 'OK' }]) {
    // Create modal overlay
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 10000;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    // Create modal content
    const modal = document.createElement('div');
    modal.className = 'modal-content';
    modal.style.cssText = `
      background: white;
      border-radius: 8px;
      padding: 24px;
      min-width: 300px;
      max-width: 400px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      animation: modalSlideIn 0.2s ease;
    `;

    // Add animation styles
    if (!document.querySelector('#alert-animations')) {
      const styles = document.createElement('style');
      styles.id = 'alert-animations';
      styles.textContent = `
        @keyframes modalSlideIn {
          from { opacity: 0; transform: scale(0.9) translateY(-20px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `;
      document.head.appendChild(styles);
    }

    // Create title
    const titleEl = document.createElement('h3');
    titleEl.textContent = title;
    titleEl.style.cssText = `
      margin: 0 0 12px 0;
      font-size: 18px;
      font-weight: 600;
      color: #333;
    `;
    modal.appendChild(titleEl);

    // Create message
    if (message) {
      const messageEl = document.createElement('p');
      messageEl.textContent = message;
      messageEl.style.cssText = `
        margin: 0 0 20px 0;
        font-size: 14px;
        line-height: 1.4;
        color: #666;
      `;
      modal.appendChild(messageEl);
    }

    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = `
      display: flex;
      justify-content: flex-end;
      gap: 8px;
      margin-top: 20px;
    `;

    // Create buttons
    buttons.forEach((button, index) => {
      const btn = document.createElement('button');
      btn.textContent = button.text;
      btn.style.cssText = `
        padding: 8px 16px;
        border: 1px solid #ddd;
        border-radius: 4px;
        background: ${button.style === 'default' || index === buttons.length - 1 ? '#2196F3' : 'white'};
        color: ${button.style === 'default' || index === buttons.length - 1 ? 'white' : '#333'};
        cursor: pointer;
        font-size: 14px;
        font-weight: 500;
        transition: all 0.2s ease;
      `;

      // Add hover effect
      btn.addEventListener('mouseenter', () => {
        btn.style.opacity = '0.8';
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.opacity = '1';
      });

      btn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        if (button.onPress) button.onPress();
      });

      buttonContainer.appendChild(btn);
    });

    modal.appendChild(buttonContainer);
    overlay.appendChild(modal);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        document.body.removeChild(overlay);
      }
    });

    // Close on escape key
    const escapeHandler = (e) => {
      if (e.key === 'Escape') {
        document.body.removeChild(overlay);
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);

    // Add to DOM
    document.body.appendChild(overlay);

    // Focus first button
    setTimeout(() => {
      const firstButton = buttonContainer.querySelector('button');
      if (firstButton) firstButton.focus();
    }, 100);
  }
}

export default WebAlert;