import { useState } from 'react';
import { SignIn } from './auth/SignIn';
import { SignUp } from './auth/SignUp';

type AuthMode = 'signin' | 'signup';

export function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('signin');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8">
        {mode === 'signin' ? (
          <SignIn onSwitchToSignUp={() => setMode('signup')} />
        ) : (
          <SignUp onSwitchToSignIn={() => setMode('signin')} />
        )}
      </div>
    </div>
  );
}
