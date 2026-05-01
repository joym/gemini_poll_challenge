import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUser } from '../context/UserContext';
import { sendChatMessage, getChatHistory } from '../services/api';
import {
  FiSend,
  FiVolume2,
  FiVolumeX,
  FiMessageCircle,
  FiBookOpen,
  FiHelpCircle,
  FiZap,
  FiExternalLink
} from 'react-icons/fi';
import { trackChatMessage } from '../utils/analytics';

const QUICK_QUESTIONS = [
  { label: 'How to register?', q: 'How do I register as a voter in India?' },
  { label: 'What is EVM?', q: 'What is an Electronic Voting Machine (EVM) and how does it work?' },
  { label: 'What is NOTA?', q: 'What is NOTA and how does it work in Indian elections?' },
  { label: 'Lok Sabha seats?', q: 'How many Lok Sabha seats are there in India?' },
  { label: 'Documents needed?', q: 'What documents do I need to carry on voting day?' },
  { label: 'वोटर ID कैसे बनाएँ?', q: 'वोटर ID कैसे बनाएँ? मुझे पूरी प्रक्रिया बताइए।' },
  { label: 'VVPAT क्या है?', q: 'VVPAT क्या है और ये कैसे काम करता है?' },
  { label: 'Election phases?', q: 'Why are Indian elections held in multiple phases?' }
];

const QUICK_FACTS = [
  { label: 'Voting Age', value: '18 years', icon: '🎂' },
  { label: 'Lok Sabha', value: '543 seats', icon: '🏛️' },
  { label: 'Voters', value: '96.8 Crore', icon: '🗳️' },
  { label: 'Helpline', value: '1950', icon: '📞' }
];

export default function ChatPage() {
  const { user } = useUser();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [voiceOn, setVoiceOn] = useState(false);

  const chatEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await getChatHistory(user._id);
        if (data.success && data.data.length > 0) {
          setMessages(data.data);
        } else {
          setMessages([{
            role: 'assistant',
            content: `🙏 **Namaste ${user?.name}!** Welcome to **VotePath AI** — your personal Indian election assistant.`
          }]);
        }
      } catch {
        setMessages([{
          role: 'assistant',
          content: `Welcome to VotePath AI. Ask me anything about voting.`
        }]);
      }
    };
    if (user) load();
  }, [user]);

  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) container.scrollTop = container.scrollHeight;
  }, [messages, sending]);

  const speak = text => {
    if (!voiceOn || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\n+/g, '. '));
    utterance.lang = 'en-IN';
    window.speechSynthesis.speak(utterance);
  };

  const handleSend = async overrideMsg => {
    const msgText = overrideMsg || input.trim();
    if (!msgText || sending) return;

    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: msgText }]);
    setSending(true);

    try {
      const { data } = await sendChatMessage(user._id, msgText);
      if (data.success) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.data.reply }]);
        speak(data.data.reply);
        trackChatMessage(data.data.provider || 'unknown');
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I had trouble processing that. Please try again.'
      }]);
    }

    setSending(false);
    inputRef.current?.focus();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="h-full overflow-hidden"
      role="main"
      aria-label="AI Chat Assistant"
    >

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-text-primary">AI Assistant</h1>
          <p className="text-xs text-text-muted">Ask about elections in English or Hindi</p>
        </div>

        <button
          onClick={() => {
            setVoiceOn(!voiceOn);
            if (voiceOn) window.speechSynthesis?.cancel();
          }}
          aria-label={voiceOn ? 'Disable voice reading' : 'Enable voice reading'}
          aria-pressed={voiceOn}
          className="p-2.5 rounded-xl"
        >
          {voiceOn ? <FiVolume2 size={16} /> : <FiVolumeX size={16} />}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 h-[calc(100%-60px)]">

        {/* CHAT AREA */}
        <div className="flex flex-col glass-card overflow-hidden">
          <div
            ref={messagesContainerRef}
            className="flex-1 overflow-y-auto p-5 space-y-4"
            role="log"
            aria-live="polite"
            aria-relevant="additions text"
            aria-label="Chat conversation"
          >
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-assistant'}>
                    {msg.content}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {sending && (
              <div role="status" aria-label="AI is generating a response">
                <span className="sr-only">AI is thinking, please wait</span>
              </div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* INPUT */}
          <div className="p-4 border-t border-border">
            <label htmlFor="chat-input" className="sr-only">
              Type your election question
            </label>

            <div className="flex gap-2">
              <input
                ref={inputRef}
                id="chat-input"
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask about elections / चुनाव के बारे में पूछें"
                aria-label="Type your election question"
                className="input-field flex-1"
              />

              <button
                onClick={() => handleSend()}
                disabled={sending || !input.trim()}
                aria-label="Send message"
                className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white"
              >
                <FiSend size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* SIDEBAR */}
        <aside className="hidden lg:flex flex-col gap-4" aria-label="Chat sidebar">

          <div className="glass-card-static p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FiZap size={14} /> Quick Questions
            </h3>
            {QUICK_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleSend(q.q)}
                className="w-full text-left px-3 py-2"
              >
                {q.label}
              </button>
            ))}
          </div>

          <div className="glass-card-static p-4">
            <h3 className="text-sm font-semibold flex items-center gap-2">
              <FiBookOpen size={14} /> Quick Facts
            </h3>
            {QUICK_FACTS.map((f, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span>{f.icon} {f.label}</span>
                <span className="font-bold">{f.value}</span>
              </div>
            ))}
          </div>

          <a
            href="https://eci.gov.in"
            target="_blank"
            rel="noreferrer"
            className="glass-card-static p-3 flex items-center gap-3"
          >
            🇮🇳
            <span className="flex-1">
              <p className="text-xs font-medium">Election Commission of India</p>
              <p className="text-[10px] text-text-muted">Official ECI Portal</p>
            </span>
            <FiExternalLink size={12} />
          </a>
        </aside>
      </div>
    </motion.div>
  );
}