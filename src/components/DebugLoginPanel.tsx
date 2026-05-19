interface DebugLoginPanelProps {
  onQuickLogin: (email: string, password: string) => void;
  isLoading: boolean;
}

const DEBUG_ACCOUNTS = [
  { email: 'dan@test.com', password: '12345671' },
  { email: 'noa@test.com', password: '12345672' },
  { email: 'john@test.com', password: '123456' },
  { email: 'jane@test.com', password: '123456' },
  { email: 'andrey@test.com', password: '123456' },
  { email: 'mariana@test.com', password: '123456' },
];

export function DebugLoginPanel({ onQuickLogin, isLoading }: DebugLoginPanelProps) {
  return (
    <div className="mt-6 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
      <p className="text-sm font-bold text-yellow-800 mb-3">🐛 DEBUG - Quick Login</p>
      <div className="grid grid-cols-2 gap-2">
        {DEBUG_ACCOUNTS.map((account) => (
          <button
            key={account.email}
            onClick={() => onQuickLogin(account.email, account.password)}
            disabled={isLoading}
            className="px-2 py-1 text-xs bg-yellow-200 hover:bg-yellow-300 disabled:opacity-50 rounded border border-yellow-400 font-medium"
          >
            {account.email.split('@')[0]}
          </button>
        ))}
      </div>
    </div>
  );
}
