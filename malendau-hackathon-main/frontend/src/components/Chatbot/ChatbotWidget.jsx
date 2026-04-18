import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Mic } from 'lucide-react';
import { useMachineContext } from '../../App';
import { chatMessage } from '../../services/claudeService';
import ChatMessage from './ChatMessage';
import TypingIndicator from './TypingIndicator';

const ChatbotWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const messagesEndRef = useRef(null);

  const { latestReadings, machines, machineIds } = useMachineContext();

  const suggestions = [
    "What machines are in warning state?",
    "Explain the latest alert",
    "What should I do about PUMP_01?",
    "Show energy saving tips"
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const getMachineSummaries = () => {
    return machineIds.map(id => ({
      id,
      label: machines[id]?.label,
      status: latestReadings[id]?.status,
      riskScore: latestReadings[id]?.riskScore
    }));
  };

  const handleSend = async (messageText = input) => {
    if (!messageText.trim()) return;

    const userMessage = messageText.trim();
    setInput('');
    setShowSuggestions(false);

    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages);

    setIsTyping(true);

    const machineSummaries = getMachineSummaries();
    const response = await chatMessage(newMessages, userMessage, machineSummaries);

    setIsTyping(false);

    if (response.error) {
      setMessages([...newMessages, { role: 'assistant', content: response.error }]);
    } else {
      setMessages([...newMessages, { role: 'assistant', content: response.reply }]);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestion = (suggestion) => {
    handleSend(suggestion);
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform glow-cyan"
        >
          <MessageSquare size={24} className="text-background" />
          <div className="absolute inset-0 rounded-full border-2 border-primary animate-ping opacity-50" />
        </button>
      )}

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[500px] bg-surface border border-surfaceBorder rounded-xl shadow-2xl flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-surfaceBorder bg-[#0D0D14]">
            <div className="flex items-center gap-3">
              <div className="relative">
                <MessageSquare size={20} className="text-primary" />
                <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0D0D14]" />
              </div>
              <div>
                <h3 className="font-semibold text-textPrimary">🤖 JnanikBot</h3>
                <p className="text-xs text-textMuted">Online</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-surfaceBorder rounded-lg transition-colors"
            >
              <X size={20} className="text-textMuted" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-thin">
            {messages.length === 0 && showSuggestions && (
              <div className="space-y-2">
                <p className="text-sm text-textMuted mb-3">Suggested questions:</p>
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestion(suggestion)}
                    className="w-full text-left px-3 py-2 bg-surfaceBorder hover:bg-surfaceBorder/80 rounded-lg text-sm text-textPrimary transition-colors"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            )}

            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                message={message.content}
                isUser={message.role === 'user'}
              />
            ))}

            {isTyping && <TypingIndicator />}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-surfaceBorder bg-[#0D0D14]">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about machine health, alerts, or maintenance..."
                className="flex-1 bg-surface border border-surfaceBorder rounded-lg px-4 py-2 text-sm text-textPrimary placeholder-textMuted focus:outline-none focus:border-primary"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="p-2 bg-primary text-background rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send size={18} />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatbotWidget;
