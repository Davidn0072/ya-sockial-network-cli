import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserSearchDropdown } from '../components/UserSearchDropdown';
import config from '../config';

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
  socketConnected: boolean;
  onMessageChange: (userId: string, message: string) => void;
  onSubmit: (e: React.FormEvent, chat: PrivateChat) => void;
  inputRef: React.MutableRefObject<{ [userId: string]: HTMLInputElement | null }>;
}

function PrivateChatView({ chat, user, socketConnected, onMessageChange, onSubmit, inputRef }: PrivateChatViewProps) {
  const canSend = socketConnected;
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
          chat.messages.map((msg, idx) => {
            const isOwn = msg.from === user?.name;
            return (
              <div key={idx} className="flex justify-start">
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg ${
                    isOwn ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-900'
                  }`}
                >
                  <p className="text-sm font-semibold opacity-75">{msg.from}</p>
                  <p className="break-words">{msg.msg}</p>
                </div>
              </div>
            );
          })
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
            disabled={!canSend}
          />
          <button
            type="submit"
            disabled={!canSend}
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
  const privateChatsRef = useRef<PrivateChat[]>([]);
  const currentUserNameRef = useRef<string | null>(null);

  const focusInput = () => {
    requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  };

  const joinPrivateRoom = (targetUserId: string, targetUserName: string) => {
    const socket = socketRef.current;
    if (!socket) return;
    socket.emit('join private', {
      targetUserId: String(targetUserId),
      targetUserName,
    });
  };

  const joinAllPrivateRooms = () => {
    privateChatsRef.current.forEach(chat => {
      joinPrivateRoom(chat.userId, chat.userName);
    });
  };

  const setAllPrivateChatsConnected = (connected: boolean) => {
    setPrivateChats(prev => prev.map(c => ({ ...c, isConnected: connected })));
  };

  const handlePrivateUserSelect = (selectedUser: any) => {
    const targetId = String(selectedUser._id ?? selectedUser.id ?? '');
    if (!targetId || targetId === 'undefined') return;
    const existingChat = privateChats.find(chat => chat.userId === targetId);
    if (existingChat) {
      setActivePrivateTab(targetId);
      joinPrivateRoom(targetId, existingChat.userName);
      return;
    }

    if (targetId === String(user?.id)) {
      alert('❌ You cannot chat with yourself!');
      return;
    }

    const newChat: PrivateChat = {
      userId: targetId,
      userName: selectedUser.name,
      messages: [],
      socket: null,
      isConnected: false,
      messageInput: ''
    };

    setPrivateChats(prev => [...prev, newChat]);
    setActivePrivateTab(targetId);
    joinPrivateRoom(targetId, selectedUser.name);
  };

  const handleClosePrivateChat = (userId: string) => {
    setPrivateChats(prev => {
      const remaining = prev.filter(c => c.userId !== userId);
      if (activePrivateTab === userId) {
        setActivePrivateTab(remaining.length > 0 ? remaining[0].userId : null);
      }
      return remaining;
    });
  };

  useEffect(() => {
    privateChatsRef.current = privateChats;
  }, [privateChats]);

  useEffect(() => {
    currentUserNameRef.current = user?.name ?? null;
  }, [user?.name]);

  useEffect(() => {
    if (!token) {
      console.log('No token, cannot connect');
      return;
    }

    const socket = (window as any).io(`${config.API_URL}/chat`, {
      auth: { token },
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('Socket connected!');
      setIsConnected(true);
      joinAllPrivateRooms();
      setAllPrivateChatsConnected(true);
      focusInput();
    });

    socket.on('chat message', (data: Message) => {
      setMessages(prev => [...prev, { ...data, timestamp: Date.now() }]);
    });

    socket.on('private message', (data: Message) => {
      const senderName = currentUserNameRef.current;
      if (data.from === senderName) return;

      const incoming: Message = { ...data, timestamp: Date.now() };
      setPrivateChats(prev => {
        const chat = prev.find(c => c.userName === data.from);
        if (!chat) return prev;
        return prev.map(c =>
          c.userId === chat.userId
            ? { ...c, messages: [...c.messages, incoming] }
            : c
        );
      });
    });

    socket.on('error', (error: { message?: string }) => {
      console.error('Socket error:', error);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
      setAllPrivateChatsConnected(false);
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [token]);

  useEffect(() => {
    if (!isConnected) return;
    privateChats.forEach(chat => joinPrivateRoom(chat.userId, chat.userName));
    setAllPrivateChatsConnected(true);
  }, [privateChats.map(c => c.userId).join(','), isConnected]);

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

  const handleMessageChange = (userId: string, message: string) => {
    setPrivateChats(prev =>
      prev.map(c =>
        c.userId === userId ? { ...c, messageInput: message } : c
      )
    );
  };

  const handlePrivateSubmit = (e: React.FormEvent, chat: PrivateChat) => {
    e.preventDefault();
    const socket = socketRef.current;

    const senderName = user?.name ?? currentUserNameRef.current;
    if (chat.messageInput.trim() && socket && senderName) {
      const msg = chat.messageInput.trim();
      joinPrivateRoom(chat.userId, chat.userName);
      const outgoing: Message = {
        from: senderName,
        msg,
        timestamp: Date.now(),
      };
      socket.emit('private message', {
        targetUserId: String(chat.userId),
        targetUserName: chat.userName,
        msg,
      });
      setPrivateChats(prev =>
        prev.map(c =>
          c.userId === chat.userId
            ? { ...c, messages: [...c.messages, outgoing], messageInput: '' }
            : c
        )
      );
      requestAnimationFrame(() => {
        privateInputRefs.current[chat.userId]?.focus();
      });
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

        {activePrivateTab && privateChats.some(c => c.userId === activePrivateTab) ? (
          <PrivateChatView
            chat={privateChats.find(c => c.userId === activePrivateTab)!}
            user={user}
            socketConnected={isConnected}
            onMessageChange={handleMessageChange}
            onSubmit={handlePrivateSubmit}
            inputRef={privateInputRefs}
          />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-gray-500">
            <p className="text-lg font-medium text-gray-700 mb-2">No private chats yet</p>
            <p className="text-sm">Click <span className="font-semibold text-emerald-700">New Chat</span> to start a conversation</p>
          </div>
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
