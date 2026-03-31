import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_BASE = "http://localhost:8000";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, username: string, role: string) => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isLogin) {
        const res = await axios.post(`${API_BASE}/login`, { username, password });
        onSuccess(res.data.access_token, username, res.data.role);
        onClose();
      } else {
        await axios.post(`${API_BASE}/register`, { username, password, email, role });
        // After signup, automatically login
        const loginRes = await axios.post(`${API_BASE}/login`, { username, password });
        onSuccess(loginRes.data.access_token, username, loginRes.data.role);
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="glass w-full max-w-md rounded-[32px] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-300">
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-8 md:p-10">
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-black text-gray-900 mb-2">
              {isLogin ? "Welcome Back" : "Join SafeGuard"}
            </h2>
            <p className="text-gray-500 font-medium whitespace-nowrap">
              {isLogin ? "Log in to manage your community" : "Create an account to get started"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  required
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#f55064]/20 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                />
              </div>

              {!isLogin && (
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input 
                    type="email"
                    placeholder="Email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#f55064]/20 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                  />
                </div>
              )}

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input 
                  required
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-[#f55064]/20 outline-none transition-all placeholder:text-gray-400 text-gray-900"
                />
              </div>
            {!isLogin && (
              <div className="flex bg-gray-50 p-1.5 rounded-2xl border border-gray-100">
                <button
                  type="button"
                  onClick={() => setRole("user")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                    role === "user" 
                    ? "bg-white text-gray-900 shadow-sm border border-gray-100" 
                    : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  I'm a User
                </button>
                <button
                  type="button"
                  onClick={() => setRole("moderator")}
                  className={`flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all ${
                    role === "moderator" 
                    ? "bg-white text-gray-900 shadow-sm border border-gray-100" 
                    : "text-gray-400 hover:text-gray-600"
                  }`}
                >
                  Moderator
                </button>
              </div>
            )}
          </div>

            {error && (
              <p className="text-red-500 text-sm font-bold text-center bg-red-50 py-2 rounded-xl border border-red-100">
                {error}
              </p>
            )}

            <button 
              disabled={loading}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-2 mt-6"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? "Log In" : "Sign Up"}
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button 
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-bold text-[#f55064] hover:underline"
            >
              {isLogin ? "New here? Create an account" : "Already have an account? Log in"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
