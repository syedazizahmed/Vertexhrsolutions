import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageCircle, X, Send, Bot } from 'lucide-react';
import api from '@/api/api';

type ChatMessage = { role: 'user' | 'assistant'; content: string };

const WELCOME: ChatMessage = {
  role: 'assistant',
  content: "Hi! I'm the Vertex HR assistant. Ask me anything about finding jobs or applying here.",
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, open]);

  const sendMessage = async () => {
    const text = input.trim();
    if (!text || loading) return;

    const next = [...messages, { role: 'user', content: text } as ChatMessage];
    setMessages(next);
    setInput('');
    setLoading(true);

    try {
      const { data } = await api.post('/chat', { messages: next });
      setMessages([...next, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages([...next, { role: 'assistant', content: "Sorry, I couldn't respond just now. Please try again." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '1.5rem', right: '1.5rem', zIndex: 200 }}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.96 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              bottom: '4rem',
              right: 0,
              width: 340,
              height: 460,
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--surface)',
              border: '1px solid var(--border-2)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: 'var(--shadow-lg)',
              overflow: 'hidden',
            }}
          >
            {/* Header */}
            <div
              style={{
                display: 'flex', alignItems: 'center', gap: '0.6rem',
                padding: '0.9rem 1rem',
                borderBottom: '1px solid var(--border)',
                background: 'var(--accent)',
                color: '#fff',
              }}
            >
              <Bot size={18} />
              <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Vertex HR Assistant</span>
            </div>

            {/* Messages */}
            <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {messages.map((m, i) => (
                <div
                  key={i}
                  style={{
                    alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '85%',
                    background: m.role === 'user' ? 'var(--accent)' : 'var(--surface-2)',
                    color: m.role === 'user' ? '#fff' : 'var(--text)',
                    padding: '0.55rem 0.8rem',
                    borderRadius: 12,
                    fontSize: '0.85rem',
                    lineHeight: 1.5,
                    whiteSpace: 'pre-wrap',
                  }}
                >
                  {m.content}
                </div>
              ))}
              {loading && (
                <div style={{ alignSelf: 'flex-start', color: 'var(--text-3)', fontSize: '0.8rem', padding: '0.3rem 0.2rem' }}>
                  Typing...
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem', borderTop: '1px solid var(--border)' }}>
              <input
                className="input"
                placeholder="Type a message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                disabled={loading}
                style={{ fontSize: '0.85rem', padding: '0.55rem 0.8rem' }}
              />
              <button className="btn btn-primary btn-icon" onClick={sendMessage} disabled={loading || !input.trim()}>
                <Send size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle button */}
      <motion.button
        whileTap={{ scale: 0.92 }}
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close chat' : 'Open chat'}
        style={{
          width: 52, height: 52, borderRadius: '50%',
          background: 'var(--accent)', color: '#fff',
          border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: 'var(--shadow-lg)',
        }}
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </motion.button>
    </div>
  );
}
