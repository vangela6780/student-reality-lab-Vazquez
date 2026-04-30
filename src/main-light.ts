/**
 * Chat Widget Handler - Light Mode
 * Handles floating chat widget interactions
 */

const chatToggle = document.getElementById('chat-toggle') as HTMLButtonElement | null;
const chatPanel = document.getElementById('chat-panel') as HTMLDivElement | null;
const chatClose = document.getElementById('chat-close') as HTMLButtonElement | null;
const chatSend = document.getElementById('chat-send') as HTMLButtonElement | null;
const chatInput = document.getElementById('chat-input') as HTMLInputElement | null;
const chatMessages = document.getElementById('chat-messages') as HTMLDivElement | null;

// Toggle chat panel visibility
chatToggle?.addEventListener('click', () => {
  chatPanel?.classList.toggle('hidden');
});

// Close chat panel
chatClose?.addEventListener('click', () => {
  chatPanel?.classList.add('hidden');
});

// Send message
function sendMessage() {
  const message = chatInput?.value.trim();
  if (!message) return;

  // Add user message to chat
  addMessageToChat(message, 'user');
  if (chatInput) {
    chatInput.value = '';
  }

  // Simulate AI response
  setTimeout(() => {
    const response = generateResponse(message);
    addMessageToChat(response, 'assistant');
  }, 500);
}

// Add message to chat interface
function addMessageToChat(text: string, sender: 'user' | 'assistant') {
  const messageDiv = document.createElement('div');
  messageDiv.style.cssText = `
    padding: 0.75rem;
    border-radius: 8px;
    line-height: 1.4;
    font-size: 0.95rem;
    word-wrap: break-word;
    animation: fadeIn 0.3s ease;
  `;

  if (sender === 'user') {
    messageDiv.style.cssText += `
      background: var(--primary-color);
      color: white;
      align-self: flex-end;
      margin-left: 2rem;
    `;
  } else {
    messageDiv.style.cssText += `
      background: var(--bg-tertiary);
      color: var(--text-primary);
      align-self: flex-start;
      margin-right: 2rem;
    `;
  }

  messageDiv.textContent = text;
  if (!chatMessages) {
    return;
  }

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Generate simulated AI responses
function generateResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();

  const responses: { [key: string]: string } = {
    'spec': 'A specification is a detailed description of what you\'re building. It includes requirements, user stories, and acceptance criteria.',
    'how': 'To write an effective spec: 1) Define the problem, 2) List features, 3) Write user stories, 4) Get feedback from your team.',
    'benefits': 'Specs save time, prevent scope creep, improve team alignment, and make testing easier. You\'ll catch bugs earlier.',
    'example': 'Sure! A user story looks like: "As a student, I want to log in so I can access my courses." Include acceptance criteria too.',
    'ai': 'AI tools like Claude excel with clear specs. Instead of guessing, you can ask: "Review this spec for gaps" or "Generate test cases."',
    'hello': 'Hi! 👋 I\'m your DevLearn assistant. Ask me about specs, development best practices, or anything else!',
    'help': 'I can help with:\n• Understanding specs\n• Best practices\n• Example specs\n• Tips for clear writing\nWhat would you like to know?',
  };

  for (const [keyword, response] of Object.entries(responses)) {
    if (message.includes(keyword)) {
      return response;
    }
  }

  return '🤔 Great question! I\'m still learning. Try asking about "specs", "how to write specs", "benefits", or say "help" for options.';
}

// Event listeners
chatSend?.addEventListener('click', sendMessage);
chatInput?.addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    sendMessage();
  }
});

// Initial greeting
addMessageToChat('👋 Hi! I\'m your DevLearn assistant. Ask me about spec-driven development!', 'assistant');

// Animation keyframes
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);
