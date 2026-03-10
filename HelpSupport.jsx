import React, { useState, useRef, useEffect } from 'react';
import './helpsupport.css';

const BOT_AVATAR_URL = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiMyOGE3NDUiLz4KPHBhdGggZD0iTTI0IDI0SDRWMjBIMjRWMTZINDBWMjBINTZWMjRINDBWMjhIMjRWMjRaIiBmaWxsPSJ3aGl0ZSIvPgo8Y2lyY2xlIGN4PSIzMiIgY3k9IjQ0IiByPSI0IiBmaWxsPSJ3aGl0ZSIvPgo8L3N2Zz4K';

// Configuration - Replace with your actual OpenAI API key
const OPENAI_CONFIG = {
  apiKey: process.env.REACT_APP_OPENAI_API_KEY || 'your-openai-api-key-here',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  maxTokens: 500
};

const CONTACT_INFO = {
  support: {
    email: 'support@farmermarket.com',
    whatsapp: '+91-8277712263',
    phone: '+91-8277712263',
    hours: '9:00 AM - 6:00 PM (Mon-Sat)'
  },
  admin: {
    email: 'admin@farmermarket.com',
    whatsapp: '+91-9876543210',
    phone: '+91-9876543210',
    hours: '10:00 AM - 5:00 PM (Mon-Fri)'
  },
  technical: {
    email: 'tech@farmermarket.com',
    whatsapp: '+91-9123456789',
    phone: '+91-9123456789',
    hours: '24/7 for critical issues'
  },
  sales: {
    email: 'sales@farmermarket.com',
    whatsapp: '+91-8765432109',
    phone: '+91-8765432109',
    hours: '8:00 AM - 8:00 PM (Daily)'
  }
};

export default function HelpSupport() {
  const [chatOpen, setChatOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [showContactCard, setShowContactCard] = useState(false);
  const [contactType, setContactType] = useState('support');
  const [aiEnabled, setAiEnabled] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState('connected');
  const chatEndRef = useRef(null);

  // System prompt for OpenAI
  const systemPrompt = `You are AgriAI, an AI assistant for FarmerMarket - an agricultural marketplace platform. Your role is to help users with:

  Platform Features:
  - Farmer registration and verification
  - Product listing and pricing
  - Order management and tracking
  - Payment and delivery queries
  - Account settings and profile management
  
  Agricultural Support:
  - Current market prices for vegetables, fruits, grains
  - Agricultural best practices
  - Seasonal crop recommendations
  - Farming techniques and tips
  
  Customer Support:
  - Troubleshooting platform issues
  - Connecting users with appropriate support channels
  - Providing contact information when needed
  - Escalating urgent matters
  
  Guidelines:
  1. Be friendly, helpful, and professional
  2. Provide accurate contact information from the platform
  3. If unsure, offer to connect with human support
  4. Keep responses concise but informative
  5. Use markdown formatting for readability
  
  Contact Information:
  - General Support: ${CONTACT_INFO.support.phone}
  - Technical Issues: ${CONTACT_INFO.technical.email}
  - Admin Support: ${CONTACT_INFO.admin.whatsapp}
  - Sales: ${CONTACT_INFO.sales.phone}
  
  Always end with a helpful suggestion or question to continue the conversation.`;

  // Initialize with welcome message
  useEffect(() => {
    const saved = localStorage.getItem('agriai_messages');
    if (saved) {
      try { 
        setChatMessages(JSON.parse(saved)); 
      } catch (e) { 
        setChatMessages([]); 
      }
    } else {
      setChatMessages([{
        id: Date.now(),
        type: 'bot',
        text: "Hello! I'm AgriAI 🤖\n\nI can help you with:\n• Market prices & trends\n• Farmer registration\n• Order tracking\n• Delivery queries\n• Agricultural advice\n• Platform support\n\nWhat would you like to know today?",
        timestamp: new Date()
      }]);
    }

    setSuggestedQuestions([
      "What are today's vegetable prices?",
      "How to register as a farmer?",
      "How do I track my order?",
      "Contact customer support"
    ]);
  }, []);

  // Save messages to localStorage
  useEffect(() => {
    localStorage.setItem('agriai_messages', JSON.stringify(chatMessages));
  }, [chatMessages]);

  // Auto-scroll to bottom
  useEffect(() => { 
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [chatMessages, isTyping]);

  // OpenAI API integration
  const getAIResponse = async (userText) => {
    if (!aiEnabled) {
      return generateFallbackResponse(userText);
    }

    setIsTyping(true);
    setConnectionStatus('connecting');

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_CONFIG.apiKey}`
        },
        body: JSON.stringify({
          model: OPENAI_CONFIG.model,
          messages: [
            { role: 'system', content: systemPrompt },
            ...chatMessages.slice(-10).map(msg => ({
              role: msg.type === 'user' ? 'user' : 'assistant',
              content: msg.text
            })),
            { role: 'user', content: userText }
          ],
          temperature: OPENAI_CONFIG.temperature,
          max_tokens: OPENAI_CONFIG.maxTokens
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`);
      }

      const data = await response.json();
      setConnectionStatus('connected');
      return data.choices[0].message.content.trim();

    } catch (error) {
      console.error('OpenAI Error:', error);
      setConnectionStatus('disconnected');
      return generateFallbackResponse(userText);
    } finally {
      setIsTyping(false);
    }
  };

  // Fallback response generator
  const generateFallbackResponse = (userText) => {
    const text = userText.toLowerCase().trim();
    
    // Contact queries
    if (text.includes('contact') || text.includes('support') || text.includes('help')) {
      if (text.includes('admin')) {
        return `👨‍💼 **Admin Support**\n\nFor administrative issues, account verification, or escalation:\n\n📧 Email: ${CONTACT_INFO.admin.email}\n📱 WhatsApp: ${CONTACT_INFO.admin.whatsapp}\n📞 Phone: ${CONTACT_INFO.admin.phone}\n⏰ Hours: ${CONTACT_INFO.admin.hours}\n\n*I can connect you directly or would you like me to explain the issue to the admin team?*`;
      }
      
      if (text.includes('technical') || text.includes('bug')) {
        return `🔧 **Technical Support**\n\nFor website issues, app problems, or technical bugs:\n\n📧 Email: ${CONTACT_INFO.technical.email}\n📱 WhatsApp: ${CONTACT_INFO.technical.whatsapp}\n📞 Phone: ${CONTACT_INFO.technical.phone}\n⏰ Hours: ${CONTACT_INFO.technical.hours}\n\n*Our tech team can help resolve technical issues quickly!*`;
      }
      
      return `📞 **Customer Support**\n\nWe're here to help you!\n\n**General Support:**\n• 📧 Email: ${CONTACT_INFO.support.email}\n• 📱 WhatsApp: ${CONTACT_INFO.support.whatsapp}\n• 📞 Phone: ${CONTACT_INFO.support.phone}\n• ⏰ Hours: ${CONTACT_INFO.support.hours}\n\n*What specific issue can I help you with today?*`;
    }

    // Market prices
    if (text.includes('price') || text.includes('cost')) {
      return "📊 **Current Market Overview:**\n\n• Tomatoes: ₹45-60/kg\n• Onions: ₹30-45/kg\n• Potatoes: ₹25-40/kg\n• Carrots: ₹40-55/kg\n• Cabbage: ₹20-30/kg\n\n*Prices updated today. Need specific market data?*";
    }

    // Registration
    if (text.includes('register') || text.includes('sign up')) {
      return `👨‍🌾 **Farmer Registration:**\n\n1. Visit FarmerMarket.com/register\n2. Choose 'Farmer' account type\n3. Complete verification\n4. Upload required documents\n\n*Need help? Contact ${CONTACT_INFO.support.whatsapp} on WhatsApp for quick assistance!*`;
    }

    // Default response
    return `🤔 I understand you're asking about: "${userText}"\n\nI can help with:\n• Market prices & agricultural advice\n• Account registration & verification\n• Order tracking & delivery\n• Technical support & bug reports\n\n*Would you like more details or to contact our support team?*`;
  };

  // Contact card component
  const ContactCard = ({ type }) => {
    const contact = CONTACT_INFO[type];
    const title = type.charAt(0).toUpperCase() + type.slice(1) + ' Support';
    
    const handleWhatsApp = (number) => {
      const message = `Hello! I need assistance with FarmerMarket. My query is: ${message || 'General inquiry'}`;
      const url = `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
      window.open(url, '_blank');
    };

    const handleCall = (number) => {
      window.open(`tel:${number}`, '_self');
    };

    const handleEmail = (email, subject = 'Support Request') => {
      const body = `Hello FarmerMarket Team,\n\nI need assistance with:\n\n[Please describe your issue here]\n\nThank you.`;
      window.open(`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`, '_blank');
    };

    return (
      <div className="contact-card">
        <div className="contact-header">
          <h4>📞 {title}</h4>
          <button 
            className="close-contact" 
            onClick={() => setShowContactCard(false)}
          >
            ×
          </button>
        </div>
        
        <div className="contact-details">
          <div className="contact-item">
            <span className="contact-label">📧 Email:</span>
            <a 
              href={`mailto:${contact.email}`}
              onClick={(e) => {
                e.preventDefault();
                handleEmail(contact.email, `${title} - FarmerMarket`);
              }}
              className="contact-link"
            >
              {contact.email}
            </a>
          </div>
          
          <div className="contact-item">
            <span className="contact-label">📱 WhatsApp:</span>
            <button 
              onClick={() => handleWhatsApp(contact.whatsapp)}
              className="contact-button whatsapp"
            >
              {contact.whatsapp} 💬
            </button>
          </div>
          
          <div className="contact-item">
            <span className="contact-label">📞 Phone:</span>
            <button 
              onClick={() => handleCall(contact.phone)}
              className="contact-button phone"
            >
              {contact.phone} 📞
            </button>
          </div>
          
          <div className="contact-item">
            <span className="contact-label">⏰ Hours:</span>
            <span className="contact-hours">{contact.hours}</span>
          </div>
        </div>

        <div className="contact-actions">
          <button 
            onClick={() => handleWhatsApp(contact.whatsapp)}
            className="action-button whatsapp-action"
          >
            💬 WhatsApp Now
          </button>
          <button 
            onClick={() => handleCall(contact.phone)}
            className="action-button call-action"
          >
            📞 Call Now
          </button>
        </div>
      </div>
    );
  };

  const pushBotMessage = (text) => {
    setChatMessages(prev => [...prev, { 
      id: Date.now(), 
      type: 'bot', 
      text, 
      timestamp: new Date()
    }]);
  };

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;
    
    const userMsg = { 
      id: Date.now(), 
      type: 'user', 
      text: trimmedMessage, 
      timestamp: new Date() 
    };
    
    setChatMessages(prev => [...prev, userMsg]);
    setMessage('');

    try {
      const reply = await getAIResponse(trimmedMessage);
      pushBotMessage(reply);
      updateSuggestedQuestions(trimmedMessage);
    } catch (error) {
      pushBotMessage("I apologize, but I'm having trouble responding. Please contact our support team directly for immediate assistance.");
    }
  };

  const updateSuggestedQuestions = (userMessage) => {
    const text = userMessage.toLowerCase();
    
    if (text.includes('contact') || text.includes('support')) {
      setSuggestedQuestions([
        'Contact admin support',
        'Technical support',
        'WhatsApp quick help',
        'Urgent assistance'
      ]);
    } else if (text.includes('price') || text.includes('market')) {
      setSuggestedQuestions([
        'Compare prices across markets',
        'Best selling crops',
        'Market trends',
        'Contact market support'
      ]);
    } else {
      setSuggestedQuestions([
        "Contact customer support",
        "WhatsApp quick help",
        "Email support team",
        "Clear chat history"
      ]);
    }
  };

  const handleSuggested = (question) => {
    if (question === 'Clear chat history') {
      clearChat();
      return;
    }
    
    if (question.includes('Contact') || question.includes('support') || question.includes('WhatsApp') || question.includes('Email')) {
      setMessage(question);
      setTimeout(() => {
        handleSendMessage({ preventDefault: () => {} });
      }, 100);
    } else {
      setMessage(question);
      setTimeout(() => {
        handleSendMessage({ preventDefault: () => {} });
      }, 100);
    }
  };

  const showContactSupport = (type = 'support') => {
    setContactType(type);
    setShowContactCard(true);
  };

  const clearChat = () => {
    setChatMessages([{
      id: Date.now(),
      type: 'bot',
      text: "Hello! I'm AgriAI 🤖\n\nI can help you with:\n• Market prices & trends\n• Farmer registration\n• Order tracking\n• Delivery queries\n• Agricultural advice\n• Platform support\n\nWhat would you like to know today?",
      timestamp: new Date()
    }]);
    localStorage.removeItem('agriai_messages');
    setSuggestedQuestions([
      "What are today's vegetable prices?",
      "How to register as a farmer?",
      "Contact customer support",
      "WhatsApp quick help"
    ]);
  };

  const toggleAI = () => {
    setAiEnabled(!aiEnabled);
  };

  const renderMessage = (text) => {
    return text.split('\n').map((line, index) => (
      <div key={index}>
        {line}
        {index < text.split('\n').length - 1 && <br />}
      </div>
    ));
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="help-support-page">
      <div className="help-header">
        <h1>🤖 AgriAI Assistant</h1>
        <p>Ask anything about markets, orders, registration and more.</p>
        <div className="ai-status">
          <span className={`status-dot ${connectionStatus}`}></span>
          <span>AI: {aiEnabled ? 'Enabled' : 'Disabled'} • Status: {connectionStatus}</span>
          <button onClick={toggleAI} className="toggle-ai">
            {aiEnabled ? 'Disable AI' : 'Enable AI'}
          </button>
        </div>
      </div>

      <div className="quick-help-section">
        <div className="quick-actions">
          <button 
            className="help-option" 
            onClick={() => handleSuggested("What are today's vegetable prices?")}
          >
            💰 Prices
          </button>
          <button 
            className="help-option" 
            onClick={() => handleSuggested('How to register as a farmer?')}
          >
            👨‍🌾 Register
          </button>
          <button 
            className="help-option" 
            onClick={() => showContactSupport('support')}
          >
            📞 Contact Support
          </button>
          <button 
            className="help-option" 
            onClick={() => showContactSupport('technical')}
          >
            🔧 Technical Support
          </button>
        </div>

        <div className="emergency-contact">
          <div className="emergency-card">
            <span className="emergency-icon">🚨</span>
            <div className="emergency-info">
              <strong>24/7 Urgent Support</strong>
              <span>Call: +91-7892399975</span>
            </div>
            <button 
              className="emergency-button"
              onClick={() => window.open('tel:+917892399975', '_self')}
            >
              Call Now
            </button>
          </div>
        </div>
      </div>

      <div className={`ai-bot-container ${chatOpen ? 'chat-open' : ''}`}>
        {!chatOpen && (
          <div className="floating-bot" onClick={() => setChatOpen(true)}>
            <img src={BOT_AVATAR_URL} alt="AgriAI Assistant" className="bot-avatar" />
            <div className="bot-tooltip">Ask AgriAI</div>
            {connectionStatus === 'disconnected' && (
              <div className="connection-badge">⚠️</div>
            )}
          </div>
        )}

        {chatOpen && (
          <div className="chat-interface">
            <div className="chat-header">
              <div className="header-left">
                <img src={BOT_AVATAR_URL} alt="AgriAI Assistant" className="header-avatar" />
                <div className="header-info">
                  <h3>AgriAI Assistant</h3>
                  <small>
                    {aiEnabled ? '🤖 AI Powered' : '💬 Basic Mode'} • 
                    <span className={`status-text ${connectionStatus}`}> {connectionStatus}</span>
                  </small>
                </div>
              </div>
              <div className="header-actions">
                <button 
                  className="ai-toggle-button" 
                  onClick={toggleAI}
                  title={aiEnabled ? 'Switch to basic mode' : 'Enable AI mode'}
                >
                  {aiEnabled ? '🤖' : '💬'}
                </button>
                <button 
                  className="support-button" 
                  onClick={() => showContactSupport('support')}
                  title="Quick Support"
                >
                  📞
                </button>
                <button 
                  className="clear-chat" 
                  onClick={clearChat} 
                  title="Clear conversation"
                >
                  🗑️
                </button>
                <button 
                  className="close-chat" 
                  onClick={() => setChatOpen(false)}
                >
                  ×
                </button>
              </div>
            </div>

            <div className="chat-messages">
              {chatMessages.map(msg => (
                <div key={msg.id} className={`message-bubble ${msg.type}`}>
                  {msg.type === 'bot' && (
                    <div className="bot-avatar-small">
                      <img src={BOT_AVATAR_URL} alt="AgriAI" />
                    </div>
                  )}
                  <div className={`message-content ${msg.type}`}>
                    {renderMessage(msg.text)}
                    <div className="message-time">
                      {new Date(msg.timestamp).toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </div>
                  </div>
                  {msg.type === 'user' && <div className="user-avatar">👤</div>}
                </div>
              ))}

              {isTyping && (
                <div className="typing-indicator">
                  <div className="typing-bot-avatar">
                    <img src={BOT_AVATAR_URL} alt="AgriAI" />
                  </div>
                  <div className="typing-content">
                    <div className="typing-dots">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                    {aiEnabled ? 'AgriAI is thinking...' : 'Processing...'}
                  </div>
                </div>
              )}

              {showContactCard && (
                <div className="contact-message">
                  <ContactCard type={contactType} />
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {suggestedQuestions.length > 0 && (
              <div className="suggested-questions">
                {suggestedQuestions.map((question, index) => (
                  <button
                    key={index}
                    className="suggestion-chip"
                    onClick={() => handleSuggested(question)}
                  >
                    {question}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={handleSendMessage} className="chat-input">
              <textarea 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder={aiEnabled ? 
                  "Ask me anything about FarmerMarket... (Enter to send)" : 
                  "Type your question... (Basic mode enabled)"}
                aria-label="Chat input"
                rows="1"
              />
              <button 
                type="submit" 
                disabled={!message.trim() || isTyping}
                className="send-button"
              >
                {isTyping ? '⏳' : '📤'}
              </button>
            </form>
          </div>
        )}
      </div>

      <div className="help-footer">
        <p>© 2025 FarmerMarket • Powered by Polygon Blockchain • AI Powered by OpenAI</p>
        <div className="footer-contacts">
          <span>📞 Support: {CONTACT_INFO.support.phone}</span>
          <span>📧 Email: {CONTACT_INFO.support.email}</span>
          <span>💬 WhatsApp: {CONTACT_INFO.support.whatsapp}</span>
        </div>
      </div>
    </div>
  );
}