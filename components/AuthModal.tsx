"use client";

import React, { useState, useEffect } from 'react';
import Icon from './Icon';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password:string) => Promise<void>;
  onSignup: (name: string, email: string, password: string) => Promise<void>;
  onGoogleLogin: () => Promise<void>;
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onLogin, onSignup, onGoogleLogin }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
        const timer = setTimeout(() => {
            setMode('login');
            setEmail('');
            setPassword('');
            setName('');
            setError(null);
            setIsLoading(false);
        }, 300);
        return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await onLogin(email, password);
      } else {
        if (!name.trim()) throw new Error("Name is required.");
        await onSignup(name, email, password);
      }
    } catch (err: any) {
        const message = err.code?.startsWith('auth/') 
            ? err.code.replace('auth/', '').replace(/-/g, ' ') 
            : err.message || "An unknown error occurred.";
        setError(message.charAt(0).toUpperCase() + message.slice(1) + '.');
    } finally {
        setIsLoading(false);
    }
  };
  
  const handleGoogleSubmit = async () => {
    setError(null);
    setIsLoading(true);
    try {
        await onGoogleLogin();
    } catch (err: any) {
        if (err.code?.startsWith('auth/')) {
            const message = err.code.replace('auth/', '').replace(/-/g, ' ');
            setError(message.charAt(0).toUpperCase() + message.slice(1) + '.');
        } else {
            setError(err.message || "An unknown error occurred.");
        }
    } finally {
        setIsLoading(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-glass-bg backdrop-blur-xl border border-glass-border text-text-primary rounded-2xl shadow-2xl w-full max-w-md flex flex-col transform transition-transform duration-300 scale-95 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center border-b border-glass-border">
          <h2 className="text-2xl font-serif font-bold">{mode === 'login' ? 'Welcome Back' : 'Create Your Account'}</h2>
          <p className="text-sm text-text-secondary mt-1">
            {mode === 'login' ? "Sign in to continue your journey with Aura." : "Join us to save your favorites and track orders."}
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {mode === 'signup' && (
                <input
                    type="text" value={name} onChange={(e) => setName(e.target.value)}
                    placeholder="Full Name" required disabled={isLoading}
                    className="w-full p-3 rounded-lg bg-primary/60 border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
                />
            )}
            <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address" required disabled={isLoading} autoComplete="email"
                className="w-full p-3 rounded-lg bg-primary/60 border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            />
            <input
                type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="Password" required disabled={isLoading}
                autoComplete={mode === 'login' ? "current-password" : "new-password"}
                className="w-full p-3 rounded-lg bg-primary/60 border border-glass-border focus:outline-none focus:ring-2 focus:ring-accent disabled:opacity-50"
            />

            {error && <p className="text-red-500 text-sm text-center capitalize">{error}</p>}

             <button type="submit" disabled={isLoading} className="w-full bg-accent text-white font-bold py-3 px-4 rounded-lg hover:opacity-85 transition-all duration-300 disabled:bg-gray-400 disabled:cursor-wait">
              {isLoading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Create Account')}
            </button>
        </form>

        <div className="px-6 pb-2 flex items-center gap-2">
            <div className="h-px bg-glass-border flex-grow"></div>
            <span className="text-xs text-text-secondary uppercase">Or</span>
            <div className="h-px bg-glass-border flex-grow"></div>
        </div>
        
        <div className="p-6 pt-2">
            <button
                onClick={handleGoogleSubmit} disabled={isLoading}
                className="w-full flex items-center justify-center gap-3 bg-primary/60 text-text-primary font-bold py-3 px-4 rounded-lg border border-glass-border hover:bg-black/5 dark:hover:bg-white/5 transition-colors duration-300 disabled:bg-gray-400 disabled:cursor-wait"
            >
                <Icon name="google" className="w-5 h-5" />
                Continue with Google
            </button>
        </div>

        <div className="p-4 pt-0 text-center border-t bg-primary/50 border-glass-border rounded-b-2xl">
            <button onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')} className="text-sm text-accent hover:underline disabled:no-underline" disabled={isLoading}>
                {mode === 'login' ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
