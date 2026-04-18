const TypingIndicator = () => {
  return (
    <div className="flex items-center gap-1 px-4 py-3">
      <div className="flex gap-1">
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
      <span className="text-sm text-textMuted ml-2">JnanikBot is thinking...</span>
    </div>
  );
};

export default TypingIndicator;
