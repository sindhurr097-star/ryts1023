const WaveformAnimation = () => {
  return (
    <div className="flex items-center justify-center gap-1 h-8">
      {[...Array(5)].map((_, i) => (
        <div
          key={i}
          className="w-1 bg-primary rounded-full animate-pulse"
          style={{
            height: `${20 + Math.random() * 20}px`,
            animationDelay: `${i * 100}ms`,
            animationDuration: '500ms'
          }}
        />
      ))}
    </div>
  );
};

export default WaveformAnimation;
