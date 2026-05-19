import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';

interface Message {
  from: string;
  msg: string;
  timestamp: number;
}

export function ChatPage() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const focusInput = () => {
    const inputEl = document.getElementById('chat-input') as HTMLInputElement;
    if (inputEl) {
      inputEl.focus();
    }
  };

  useEffect(() => {
    if (!token) {
      console.log('No token, cannot connect');
      return;
    }

    // יצירת חיבור Socket.IO
    const socket = (window as any).io('http://localhost:3000/chat', {
      auth: { token }
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected!');
      setIsConnected(true);
      focusInput();
    });

    socket.on('chat message', (data: Message) => {
      console.log('chat message:', data);
      setMessages(prev => [...prev, { ...data, timestamp: Date.now() }]);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, [token]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus on input when entering chat
  useEffect(() => {
    focusInput();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      socketRef.current.emit('chat message', input);
      setInput('');
      focusInput();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 flex flex-col border-b-2 border-gray-200 bg-white">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800">💬 General Chat</h2>
          <p className={`text-sm mt-1 ${isConnected ? 'text-green-600' : 'text-red-600'}`}>
            {isConnected ? '✓ Connected' : '✗ Disconnected'}
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              <p>No messages yet. Start chatting!</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={idx} className="flex justify-start">
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    msg.from === user?.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm font-semibold opacity-75">{msg.from}</p>
                  <p className="break-words">{msg.msg}</p>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 bg-white p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
            >
              Send
            </button>
          </form>
        </div>
      </div>

      <div className="flex-1 flex flex-col bg-gray-100 border-t border-gray-200 p-6">
        <div className="text-center text-gray-500">
          <h3 className="text-lg font-semibold mb-2">🔒 Private Chat</h3>
          <p className="text-sm">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
