import { useState } from 'react';
import { Lock } from 'lucide-react';

interface LoginPageProps {
  onLogin: () => void;
}

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'demo2025') {
      onLogin();
      setError('');
    } else {
      setError('Incorrect password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-[#0F0F0F]">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <img
            src="/image copy copy copy.png"
            alt="Prime Cutz Logo"
            className="w-32 mx-auto mb-6"
          />
          <h1 className="text-3xl font-bold text-[#D4AF37] mb-2">Welcome to Prime Cutz</h1>
          <p className="text-gray-400">Enter password to access demo</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-[#1A1A1A] border border-[#D4AF37]/30 rounded-lg p-8">
          <div className="mb-6">
            <label htmlFor="password" className="block text-gray-300 mb-2 font-medium">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#0F0F0F] border border-[#D4AF37]/20 rounded-lg pl-10 pr-4 py-3 text-gray-100 focus:outline-none focus:border-[#D4AF37]"
                placeholder="Enter password"
              />
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>

          <button
            type="submit"
            className="w-full bg-[#D4AF37] text-black py-3 rounded-lg font-semibold"
          >
            Access Demo
          </button>
        </form>

        <p className="text-center text-gray-500 text-sm mt-6">
          Demo password: demo2025
        </p>
      </div>
    </div>
  );
}
