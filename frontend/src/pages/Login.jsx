'use client';

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL;

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Form states
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');

  const features = [
    { icon: '📝', title: 'Smart Notes', desc: 'Generate well-structured notes instantly on any topic.' },
    { icon: '❓', title: 'Practice Questions', desc: 'Create MCQs, short & long questions for better practice.' },
    { icon: '🖼️', title: 'AI Image Learning', desc: 'Generate relevant images to visualize and learn better.' },
    { icon: '💬', title: 'Doubt Solving', desc: 'Get instant answers to your doubts in real-time.' },
    { icon: '💾', title: 'Save & Export', desc: 'Save your work and export it whenever you need.' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        // Login
        const res = await fetch(`${API_URL}/api/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: username, password }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || 'Login failed');
        }
        
        // Store user in localStorage
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        // Register
        const res = await fetch(`${API_URL}/api/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: username, email, password }),
        });
        
        const data = await res.json();
        
        if (!res.ok) {
          throw new Error(data.detail || 'Registration failed');
        }
        
        // Switch to login after successful registration
        setIsLogin(true);
        setError('');
        alert('Registration successful! Please login.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-12">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
              🎓
            </div>
            <h1 className="text-3xl font-bold">
              <span className="text-gray-800">Study</span>
              <span className="text-blue-600">Fusion</span>
            </h1>
          </div>

          {/* Main heading */}
          <div className="mb-12">
            <p className="text-gray-600 text-lg mb-2">Your AI-powered learning assistant</p>
            <h2 className="text-5xl font-bold mb-4">
              <span className="block text-gray-800">Learn Smarter,</span>
              <span className="block bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">Achieve More</span>
            </h2>
            <p className="text-gray-600 text-lg mt-6">
              StudyFusion helps you study, practice, and understand better with the power of AI.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            {features.map((feature, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-blue-100">
                    <span className="text-xl">{feature.icon}</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{feature.title}</h3>
                  <p className="text-gray-600 text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

 
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Login to continue your learning journey</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Error message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {/* Username */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Username</label>
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                    👤
                  </span>
                </div>
              </div>

              {/* Email (only for registration) */}
              {!isLogin && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                      required={!isLogin}
                    />
                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                      📧
                    </span>
                  </div>
                </div>
              )}

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

   

              {/* Login/Register Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 rounded-lg transition transform hover:scale-105 flex items-center justify-center gap-2 mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  <span>→ {isLogin ? 'Login' : 'Register'}</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">or</span>
              </div>
            </div>

            {/* Sign Up / Login Toggle */}
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(''); }}
              className="w-full border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
            >
              <span>👤</span> {isLogin ? 'Create new account' : 'Back to Login'}
            </button>


          </div>
        </div>
      </div>
    </div>
  );
}
