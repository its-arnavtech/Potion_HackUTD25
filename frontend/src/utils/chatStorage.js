// Chat history storage utility using localStorage

const STORAGE_KEY = 'cauldron_chat_history';

export const saveChatHistory = (messages) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  } catch (error) {
    console.error('Failed to save chat history:', error);
  }
};

export const loadChatHistory = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load chat history:', error);
  }
  
  // Return default welcome message if no history
  return [
    {
      role: 'assistant',
      content: "Hello! I'm your Cauldron Network AI Assistant. I can help you understand your potion data, troubleshoot issues, and optimize your operations. What would you like to know?"
    }
  ];
};

export const clearChatHistory = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear chat history:', error);
  }
};
