import React, { useEffect, useRef } from 'react';

interface InitialChatbotMessageProps {
  onSendAdaMessage: (message: string) => Promise<void>; // Changed to onSendAdaMessage
  userInput: string; // Added userInput prop
}

const InitialChatbotMessage: React.FC<InitialChatbotMessageProps> = ({ onSendAdaMessage, userInput }) => { // Destructure onSendAdaMessage
  const hasSentMessage = useRef(false); // Use a ref to track if message has been sent

  useEffect(() => {
    if (!hasSentMessage.current) { // Only send if not already sent
      const message = `Hello! I'm Ada, your AI assistant. Based on your input for "${userInput}", this is your canvas where you can design and simulate system architectures. You can adjust controls to see their impact. I am here to help you!`;
      onSendAdaMessage(message); // Changed to onSendAdaMessage
      hasSentMessage.current = true; // Mark as sent
    }
  }, [onSendAdaMessage, userInput]); // Changed to onSendAdaMessage

  return null; // This component doesn't render anything
};

export default InitialChatbotMessage;
