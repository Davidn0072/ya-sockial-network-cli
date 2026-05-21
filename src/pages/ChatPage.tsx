import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  messageInput: string;
}

interface User {
  id: string;
  name: string;
  email?: string;
}

interface SearchUserModalProps {
  onUserSelect: (user: any) => void;
}

function SearchUserModal({ onUserSelect }: SearchUserModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="ml-2 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white hover:text-gray-100 rounded-lg shadow-lg transition border border-emerald-500 hover:shadow-xl flex items-center gap-2 whitespace-nowrap"
        title="Add new private chat"
      >
        <span className="text-lg">💬</span>
        <span className="text-sm font-semibold">New Chat</span>
      </button>
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 flex items-center justify-center">
          <div className="bg-white rounded-lg shadow-2xl p-6 w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Start New Chat</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ✕
              </button>
            </div>
            <UserSearchDropdown
              onUserSelect={(user) => {
                onUserSelect(user);
                setIsOpen(false);
              }}
              placeholder="👤 Search users..."
            />
          </div>
        </div>
      )}
    </>
  );
}

interface PrivateChatViewProps {
  chat: PrivateChat;
  user: User | null;
  onMessageChange: (userId: string, message: string) => void;
  onSubmit: (e: React.FormEvent, chat: PrivateChat) => void;
  inputRef: React.MutableRefObject<{ [userId: string]: HTMLInputElement | null }>;
}

function PrivateChatView({ chat, user, onMessageChange, onSubmit, inputRef }: PrivateChatViewProps) {
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
        <form onSubmit={(e) => onSubmit(e, chat)} className="flex gap-2">
          <input
            ref={(el) => {
              if (el) inputRef.current[chat.userId] = el;
            }}
            type="text"
            value={chat.messageInput}
            onChange={(e) => onMessageChange(chat.userId, e.target.value)}
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
  const navigate = useNavigate();
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
  const privateChatSocketsRef = useRef<{ [userId: string]: any }>({});

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
      isConnected: false,
      messageInput: ''
    };

    setPrivateChats([...privateChats, newChat]);
    setActivePrivateTab(selectedUser._id);
  };

  const handleClosePrivateChat = (userId: string) => {
    const socket = privateChatSocketsRef.current[userId];
    if (socket) {
      socket.disconnect();
      delete privateChatSocketsRef.current[userId];
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
      // Skip if already connected
      if (privateChatSocketsRef.current[chat.userId]) return;

      const socket = (window as any).io('http://localhost:3000/chat', {
        auth: { token }
      });

      const userId = chat.userId;
      const userName = chat.userName;

      console.log('Creating socket for private chat:', userId);

      socket.on('connect', () => {
        console.log(`Connected to private chat with ${userName}`);
        socket.emit('join private', {
          targetUserId: userId,
          targetUserName: userName
        });

        setPrivateChats(prev =>
          prev.map(c =>
            c.userId === userId ? { ...c, isConnected: true } : c
          )
        );
      });

      socket.on('private message', (data: Message) => {
        console.log('private message received:', data);
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

      socket.on('error', (error: any) => {
        console.error(`Socket error for ${userName}:`, error);
      });

      privateChatSocketsRef.current[userId] = socket;
    });
  }, [privateChats.map(c => c.userId).join(','), token]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && socketRef.current) {
      socketRef.current.emit('chat message', input);
      setInput('');
      focusInput();
    }
  };

  const handleMessageChange = (userId: string, message: string) => {
    setPrivateChats(prev =>
      prev.map(c =>
        c.userId === userId ? { ...c, messageInput: message } : c
      )
    );
  };

  const handlePrivateSubmit = (e: React.FormEvent, chat: PrivateChat) => {
    e.preventDefault();
    const socket = privateChatSocketsRef.current[chat.userId];
    console.log('handlePrivateSubmit:', { messageInput: chat.messageInput, hasSocket: !!socket, socketId: socket?.id });

    if (chat.messageInput.trim() && socket) {
      console.log('Sending private message:', { targetUserId: chat.userId, msg: chat.messageInput });
      socket.emit('private message', {
        targetUserId: chat.userId,
        targetUserName: chat.userName,
        msg: chat.messageInput
      });
      setPrivateChats(prev =>
        prev.map(c =>
          c.userId === chat.userId ? { ...c, messageInput: '' } : c
        )
      );
      requestAnimationFrame(() => {
        privateInputRefs.current[chat.userId]?.focus();
      });
    } else {
      console.warn('Cannot send:', { messageInput: chat.messageInput.trim(), hasSocket: !!socket });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <div className="px-6 py-3 border-b border-gray-200 bg-white flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition"
          title="Back to home"
        >
          ← Home
        </button>
        <p className="text-sm text-gray-600">👤 Logged in as: <span className="font-semibold text-gray-800">{user?.name}</span></p>
      </div>

      <div className="flex-1 flex flex-col bg-gray-100 border-b-2 border-gray-200">
        <div className="flex w-full items-center justify-center px-6 py-4 border-b border-violet-200 bg-violet-100 min-h-[3.5rem]">
          <span className="text-2xl font-bold text-violet-900 leading-none">🔒 Private Chat</span>
        </div>

        {privateChats.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Start a new conversation</h3>
            <div className="w-full max-w-xs">
              <UserSearchDropdown onUserSelect={handlePrivateUserSelect} placeholder="👤 Start private chat..." />
            </div>
          </div>
        ) : (
          <>
            <div className="flex gap-0 border-b border-gray-300 bg-white overflow-x-auto items-center relative">
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
              <div className="flex-1"></div>
              <SearchUserModal onUserSelect={handlePrivateUserSelect} />
            </div>

            {activePrivateTab && (
              <PrivateChatView
                chat={privateChats.find(c => c.userId === activePrivateTab)!}
                user={user}
                onMessageChange={handleMessageChange}
                onSubmit={handlePrivateSubmit}
                inputRef={privateInputRefs}
              />
            )}
          </>
        )}
      </div>

      <div className="flex-1 flex flex-col border-t border-gray-200 bg-white">
        <div className="px-6 py-3 border-b border-gray-100 bg-gray-50"></div>
        <div className="flex w-full flex-col items-center justify-center gap-1 px-6 py-4 border-b border-sky-200 bg-sky-100 min-h-[3.5rem]">
          <span className="text-2xl font-bold text-sky-900 leading-none">💬 General Chat</span>
          <p className={`m-0 text-sm leading-none ${isConnected ? 'text-green-700' : 'text-red-700'}`}>
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
    </div>
  );
}
