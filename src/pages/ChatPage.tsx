import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserSearchDropdown } from '../components/UserSearchDropdown';

interface Message {
  from: string;
  msg: string;
  timestamp: number;
}

interface PrivateChat {
  userId: string;
  userName: string;
  messages: Message[];
  socket: any;
  isConnected: boolean;
}

interface User {
  id: string;
  name: string;
  email?: string;
}

interface PrivateChatViewProps {
  chat: PrivateChat;
  user: User | null;
  onSubmit: (e: React.FormEvent, chat: PrivateChat, input: string, setInput: (val: string) => void) => void;
  inputRef: React.MutableRefObject<{ [userId: string]: HTMLInputElement | null }>;
}

function PrivateChatView({ chat, user, onSubmit, inputRef }: PrivateChatViewProps) {
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chat.messages]);

  useEffect(() => {
    inputRef.current[chat.userId]?.focus();
  }, [chat.userId, inputRef]);

  return (
    <div className="flex-1 flex flex-col bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {chat.messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>No messages yet. Start chatting!</p>
          </div>
        ) : (
          chat.messages.map((msg, idx) => (
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
        <form onSubmit={(e) => onSubmit(e, chat, messageInput, setMessageInput)} className="flex gap-2">
          <input
            ref={(el) => {
              if (el) inputRef.current[chat.userId] = el;
            }}
            type="text"
            value={messageInput}
            onChange={(e) => setMessageInput(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            disabled={!chat.isConnected}
          />
          <button
            type="submit"
            disabled={!chat.isConnected}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

export function ChatPage() {
  const { user, token } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [privateChats, setPrivateChats] = useState<PrivateChat[]>([]);
  const [activePrivateTab, setActivePrivateTab] = useState<string | null>(null);
  const privateInputRefs = useRef<{ [userId: string]: HTMLInputElement | null }>({});

  const focusInput = () => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const handlePrivateUserSelect = (selectedUser: any) => {
    const existingChat = privateChats.find(chat => chat.userId === selectedUser._id);
    if (existingChat) {
      setActivePrivateTab(selectedUser._id);
      return;
    }

    if (selectedUser._id === user?.id) {
      alert('❌ You cannot chat with yourself!');
      return;
    }

    const newChat: PrivateChat = {
      userId: selectedUser._id,
      userName: selectedUser.name,
      messages: [],
      socket: null,
      isConnected: false
    };

    setPrivateChats([...privateChats, newChat]);
    setActivePrivateTab(selectedUser._id);
  };

  const handleClosePrivateChat = (userId: string) => {
    const chat = privateChats.find(c => c.userId === userId);
    if (chat?.socket) {
      chat.socket.disconnect();
    }
    setPrivateChats(privateChats.filter(c => c.userId !== userId));
    if (activePrivateTab === userId) {
      setActivePrivateTab(privateChats.length > 1 ? privateChats[0].userId : null);
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

  // Setup socket connection for each private chat
  useEffect(() => {
    if (!token) return;

    privateChats.forEach((chat) => {
      if (chat.socket) return; // Already connected

      const socket = (window as any).io('http://localhost:3000/chat', {
        auth: { token }
      });

      const userId = chat.userId;
      const userName = chat.userName;

      socket.on('connect', () => {
        console.log(`Connected to private chat with ${userName}`);
        socket.emit('join private', {
          targetUserId: userId,
          targetUserName: userName
        });

        setPrivateChats(prev =>
          prev.map(c =>
            c.userId === userId ? { ...c, socket, isConnected: true } : c
          )
        );
      });

      socket.on('private message', (data: Message) => {
        console.log('private message:', data);
        setPrivateChats(prev =>
          prev.map(c =>
            c.userId === userId
              ? { ...c, messages: [...c.messages, { ...data, timestamp: Date.now() }] }
              : c
          )
        );
      });

      socket.on('disconnect', () => {
        console.log(`Disconnected from private chat with ${userName}`);
        setPrivateChats(prev =>
          prev.map(c =>
            c.userId === userId ? { ...c, isConnected: false } : c
          )
        );
      });

      setPrivateChats(prev =>
        prev.map(c =>
          c.userId === userId ? { ...c, socket } : c
        )
      );
    });

    return () => {
      privateChats.forEach(chat => {
        if (chat.socket) {
          chat.socket.disconnect();
        }
      });
    };
  }, [privateChats, token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      socketRef.current.emit('chat message', input);
      setInput('');
      focusInput();
    }
  };

  const handlePrivateSubmit = (e: React.FormEvent, chat: PrivateChat, messageInput: string, setMessageInput: (val: string) => void) => {
    e.preventDefault();
    if (messageInput.trim() && chat.socket) {
      chat.socket.emit('private message', {
        targetUserId: chat.userId,
        targetUserName: chat.userName,
        msg: messageInput
      });
      setMessageInput('');
      requestAnimationFrame(() => {
        privateInputRefs.current[chat.userId]?.focus();
      });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="flex-1 flex flex-col border-b-2 border-gray-200 bg-white">
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50">
          <p className="text-sm text-gray-600">👤 Logged in as: <span className="font-semibold text-gray-800">{user?.name}</span></p>
        </div>
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
              ref={inputRef}
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

      <div className="flex-1 flex flex-col bg-gray-100 border-t border-gray-200">
        {privateChats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">🔒 Private Chat</h3>
            <div className="w-full max-w-xs">
              <UserSearchDropdown onUserSelect={handlePrivateUserSelect} placeholder="👤 Start private chat..." />
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-0 border-b border-gray-300 bg-white overflow-x-auto">
              {privateChats.map((chat) => (
                <div
                  key={chat.userId}
                  onClick={() => setActivePrivateTab(chat.userId)}
                  className={`flex items-center gap-2 px-4 py-2 cursor-pointer border-b-2 transition whitespace-nowrap ${
                    activePrivateTab === chat.userId
                      ? 'border-b-blue-600 text-blue-600 bg-blue-50'
                      : 'border-b-transparent text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span>{chat.userName}</span>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      chat.isConnected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {chat.isConnected ? '●' : '○'}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClosePrivateChat(chat.userId);
                    }}
                    className="ml-1 text-gray-400 hover:text-red-600 transition"
                    title="Close chat"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {activePrivateTab && (
              <PrivateChatView
                chat={privateChats.find(c => c.userId === activePrivateTab)!}
                user={user}
                onSubmit={handlePrivateSubmit}
                inputRef={privateInputRefs}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
