import { useState, useRef, useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';

const VoiceButton = ({ onTranscript, isListening = false, setIsListening }) => {
  const recognitionRef = useRef(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        onTranscript(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [onTranscript, setIsListening]);

  const handleClick = () => {
    if (!recognitionRef.current) {
      alert('Speech recognition is not supported in your browser');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`
        p-2 rounded-lg transition-all duration-200
        ${isListening 
          ? 'bg-danger text-white animate-pulse' 
          : 'bg-surfaceBorder text-textPrimary hover:bg-surfaceBorder/80'
        }
      `}
      title={isListening ? 'Stop listening' : 'Start voice input'}
    >
      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
};

export default VoiceButton;
