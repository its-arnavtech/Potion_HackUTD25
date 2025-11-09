import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles, Loader2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { chatWithAssistant } from '@/services/aiService';
import { saveChatHistory, loadChatHistory, clearChatHistory } from '@/utils/chatStorage';
import { toast } from 'sonner';

export default function ChatBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Load chat history on mount
  useEffect(() => {
    const history = loadChatHistory();
    setMessages(history);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);
    saveChatHistory(newMessages); // Save to localStorage
    setIsLoading(true);

    try {
      // Get AI response
      const response = await chatWithAssistant(
        newMessages.map(m => ({ role: m.role, content: m.content }))
      );

      if (response.success) {
        const updatedMessages = [...newMessages, { role: 'assistant', content: response.message }];
        setMessages(updatedMessages);
        saveChatHistory(updatedMessages); // Save to localStorage
      } else {
        toast.error('Failed to get AI response. Please try again.');
        const errorMessages = [...newMessages, { 
          role: 'assistant', 
          content: "I apologize, but I'm having trouble connecting right now. Please try again in a moment." 
        }];
        setMessages(errorMessages);
        saveChatHistory(errorMessages); // Save to localStorage
      }
    } catch (error) {
      console.error('Chat error:', error);
      toast.error('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    clearChatHistory();
    const defaultMessage = [
      {
        role: 'assistant',
        content: "Hello! I'm your Cauldron Network AI Assistant. I can help you understand your potion data, troubleshoot issues, and optimize your operations. What would you like to know?"
      }
    ];
    setMessages(defaultMessage);
    toast.success('Chat history cleared');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const quickQuestions = [
    "What does network efficiency mean?",
    "How do I prevent overflow?",
    "Explain discrepancy severity levels",
    "What's the optimal fill rate?"
  ];

  const handleQuickQuestion = (question) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-primary/90 text-primary-foreground z-50 glow-primary group"
        >
          <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full animate-pulse" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col glass-card border-primary/30">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/20 to-accent/20">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Sparkles className="w-5 h-5 text-primary" />
                <div className="absolute inset-0 blur-md bg-primary/50 -z-10" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Cauldron AI Assistant</h3>
                <p className="text-xs text-muted-foreground">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClearHistory}
                className="hover:bg-warning/20 hover:text-warning"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="hover:bg-destructive/20 hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground ml-auto'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted text-foreground rounded-lg p-3 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <p className="text-sm">Thinking...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Questions (show only when no conversation yet) */}
          {messages.length <= 1 && !isLoading && (
            <div className="px-4 pb-2 space-y-2">
              <p className="text-xs text-muted-foreground">Quick questions:</p>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((question, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleQuickQuestion(question)}
                    className="text-xs p-2 rounded-md bg-muted hover:bg-muted/80 text-foreground text-left transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input */}
          <div className="p-4 border-t border-border bg-background/50">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1 glass-card"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
}
