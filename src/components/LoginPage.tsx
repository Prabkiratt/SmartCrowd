import React, { useState } from 'react';
import { Lock, Mail, ArrowLeft, PlayCircle, ShieldCheck, LogIn } from 'lucide-react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleAuthProvider } from '../lib/firebase';

interface LoginPageProps {
  onLoginSuccess: (email: string, roleLabel: string, idToken?: string) => void;
  onBackToLanding: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, onBackToLanding }) => {
  const [email, setEmail] = useState('admin@smartcrowd.edu');
  const [password, setPassword] = useState('••••••••••••');
  const [selectedRole, setSelectedRole] = useState<'Admin / Manager' | 'Staff' | 'Visitor View'>(
    'Admin / Manager'
  );
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  const handleGoogleSignIn = async () => {
    setError('');
    setIsSigningIn(true);
    try {
      const result = await signInWithPopup(auth, googleAuthProvider);
      const token = await result.user.getIdToken();
      const userEmail = result.user.email || 'admin@smartcrowd.edu';
      onLoginSuccess(userEmail, selectedRole, token);
    } catch (err: any) {
      console.error('Google Sign-In error:', err);
      setError('Google Sign-In could not be completed. You can also use Demo Login.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError('Please enter both email and password, or click Demo Login.');
      return;
    }
    setError('');
    onLoginSuccess(email, selectedRole);
  };

  const handleDemoLogin = () => {
    setError('');
    onLoginSuccess('admin@smartcrowd.edu', 'System Administrator');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between p-6">
      <div>
        <button
          onClick={onBackToLanding}
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Landing Page</span>
        </button>
      </div>

      <div className="w-full max-w-md mx-auto bg-white border border-slate-200 rounded-xl shadow-sm p-8 space-y-6">
        <div className="space-y-1.5 text-center">
          <div className="w-10 h-10 rounded-lg bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mx-auto mb-3">
            SC
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">SmartCrowd</h1>
          <p className="text-xs text-slate-500">
            Real-Time Crowd Queue &amp; Management System
          </p>
        </div>

        {/* User Role Selector */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-slate-700">Select Access Portal</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-lg">
            {(['Admin / Manager', 'Staff', 'Visitor View'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => setSelectedRole(role)}
                className={`py-1.5 px-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap truncate cursor-pointer ${
                  selectedRole === role
                    ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700">
            {error}
          </div>
        )}

        {/* Primary Google Sign-In for Cloud SQL Persistence */}
        <div>
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isSigningIn}
            className="w-full py-2.5 px-4 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <LogIn className="w-4 h-4 text-indigo-600" />
            <span>{isSigningIn ? 'Signing in...' : 'Continue with Google'}</span>
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-slate-200" />
          <span className="shrink-0 mx-3 text-[11px] text-slate-400">or use project credentials</span>
          <div className="grow border-t border-slate-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label htmlFor="email" className="block text-xs font-medium text-slate-700">
              Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@smartcrowd.edu"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-900"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="block text-xs font-medium text-slate-700">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:border-indigo-600 text-slate-900"
              />
            </div>
          </div>

          <div className="pt-2 space-y-2.5">
            <button
              type="submit"
              className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
            >
              Login
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              className="w-full py-2.5 px-4 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Demo Login (Instant Viva Demonstration)</span>
            </button>
          </div>
        </form>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Authenticated sessions sync automatically</span>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        SmartCrowd · Real-Time Crowd Queue &amp; Crowd Management System
      </div>
    </div>
  );
};
