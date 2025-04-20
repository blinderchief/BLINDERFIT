
import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi there! I\'m your BlinderFit assistant. How can I help you today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [minimized, setMinimized] = useState(false);

  useEffect(() => {
    if (messagesEndRef.current && isOpen) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const toggleChatbot = () => {
    setIsOpen(!isOpen);
    if (minimized) setMinimized(false);
  };

  const toggleMinimize = (e) => {
    e.stopPropagation();
    setMinimized(!minimized);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Sure, I can help with that! What specific information are you looking for about BlinderFit?",
        "Great question! The workout plans in BlinderFit are customized based on your vision assessment.",
        "The BlinderFit approach focuses on mental clarity through physical training.",
        "You can update your profile information in the MyZone section.",
        "Need more help? Try visiting our FitLearn section for tutorials and guides!"
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      setMessages(prev => [...prev, { role: 'assistant', content: randomResponse }]);
      setIsTyping(false);
    }, 1500);
  };

  const closeChatbot = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  return (
    <>
      {/* Chatbot toggle button */}
      <button
        onClick={toggleChatbot}
        className="fixed bottom-6 right-6 bg-gold text-black p-3 rounded-full shadow-lg hover:bg-gold/90 transition-colors z-50"
        aria-label="Toggle chat assistant"
      >
        <MessageSquare className="h-6 w-6" />
      </button>

      {/* Chatbot window */}
      {isOpen && (
        <div className={`fixed bottom-20 right-6 w-80 sm:w-96 bg-black border border-gold/30 rounded-md shadow-xl z-50 flex flex-col transition-all duration-300 ${minimized ? 'h-14' : 'h-[500px]'}`}>
          {/* Header */}
          <div className="p-3 border-b border-gold/20 bg-gold/10 flex justify-between items-center cursor-pointer" onClick={minimized ? toggleChatbot : toggleMinimize}>
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 text-gold mr-2" />
              <h3 className="text-lg font-light text-white">BlinderFit Assistant</h3>
            </div>
            <div className="flex items-center">
              <button onClick={toggleMinimize} className="text-gray-400 hover:text-white mr-2">
                {minimized ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
              <button onClick={closeChatbot} className="text-gray-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages area */}
              <div className="flex-1 p-4 overflow-y-auto bg-gradient-to-b from-black to-black/80">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-4 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] p-3 rounded-lg ${
                        message.role === 'user'
                          ? 'bg-gold/20 text-white'
                          : 'bg-white/5 text-white'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start mb-4">
                    <div className="bg-white/5 text-white p-3 rounded-lg flex items-center">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Typing...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input area */}
              <div className="p-3 border-t border-gold/20">
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask me anything..."
                    className="flex-1 bg-white/5 border border-gold/20 text-white p-2 rounded-sm focus:ring-1 focus:ring-gold focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim() || isTyping}
                    className={`p-2 rounded-sm ${
                      !input.trim() || isTyping
                        ? 'bg-gold/50 text-black/50 cursor-not-allowed'
                        : 'bg-gold text-black hover:bg-gold/90'
                    }`}
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
};

export default Chatbot;
