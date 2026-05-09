/**
 * Main Entry Point - Light Mode
 * Initializes the DevLearn application with chat widget
 */

import { initHomeChatWidget } from './lib/chat-experience.js';

// Initialize the home chat widget when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initHomeChatWidget();
});
