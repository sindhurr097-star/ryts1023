import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';
import { useMachineContext } from '../App';
import { chatMessage } from '../services/claudeService';
import ChatMessage from '../components/Chatbot/ChatMessage';
import TypingIndicator from '../components/Chatbot/TypingIndicator';
import VoiceButton from '../components/VoiceModule/VoiceButton';

const ChatbotPage = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);

  const { latestReadings, machines, machineIds } = useMachineContext();

  const suggestions = [
    "What machines are in warning state?",
    "Explain the latest alert",
    "What should I do about PUMP_01?",
    "Show energy saving tips",
    "Generate a maintenance report"
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

  const handleTranscript = (transcript) => {
    setInput(transcript);
    handleSend(transcript);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)]">
        {/* Header */}
        <div className="glass-card rounded-xl p-6 mb-4">
          <h1 className="font-display font-bold text-textPrimary text-2xl flex items-center gap-3">
            <Bot size={28} className="text-primary" />
            SenseBot
            <span className="text-sm font-normal text-textMuted">AI Assistant for Predictive Maintenance</span>
          </h1>
        </div>

        {/* Chat Container */}
        <div className="glass-card rounded-xl flex flex-col h-[calc(100%-100px)]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
            {messages.length === 0 && showSuggestions && (
              <div className="max-w-2xl mx-auto">
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center">
                      <Bot size={48} className="text-primary" />
                    </div>
                  </div>
                  <h2 className="font-display font-semibold text-textPrimary text-xl mb-2">
                    Welcome to SenseBot
                  </h2>
                  <p className="text-textMuted">
                    Your AI assistant for industrial predictive maintenance. Ask me anything about machine health, alerts, or maintenance recommendations.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestion(suggestion)}
                      className="text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm text-textPrimary transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
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
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <VoiceButton
                onTranscript={handleTranscript}
                isListening={isListening}
                setIsListening={setIsListening}
              />
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about machine health, alerts, or maintenance..."
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-textPrimary placeholder-gray-400 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || isTyping}
                className="px-6 py-3 bg-primary text-background rounded-lg hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center gap-2"
              >
                <Send size={18} />
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatbotPage;
