const ChatMessage = ({ message, isUser }) => {
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`
        max-w-[80%] rounded-2xl px-4 py-3
        ${isUser 
          ? 'bg-primary text-background rounded-br-md' 
          : 'bg-white border border-gray-200 text-textPrimary rounded-bl-md border-l-4 border-l-primary'
        }
      `}>
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
    </div>
  );
};

export default ChatMessage;
