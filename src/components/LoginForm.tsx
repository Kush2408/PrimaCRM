import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEnvelope, FaLock } from 'react-icons/fa';
import { HiEye, HiEyeOff } from 'react-icons/hi';
import { toast, Toaster } from 'react-hot-toast';
import Cookies from 'js-cookie';
import { authService } from '../services/AuthService';

export default function LoginForm() {
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const validate = (username: string, password: string): string => {
    if (!username || !password) return 'Both fields are required.';
    if (!/\S+@\S+\.\S+/.test(username)) return 'Invalid email format.';
    if (password.length < 6) return 'Password must be at least 6 characters.';
    return '';
  };

  useEffect(() => {
    const accessToken = Cookies.get('access_token');
    if (accessToken) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const username = usernameRef.current?.value.trim() || '';
    const password = passwordRef.current?.value.trim() || '';
    const error = validate(username, password);

    if (error) {
      toast.error(error);
      return;
    }

    setLoading(true);

    try {
      const res = await toast.promise(
        authService.login({ username, password }),
        {
          loading: '🔐 Logging in...',
          success: 'Welcome!',
          error: 'Login failed. Please try again.',
        }
      );

      const { access_token, refresh_token, access_token_expiry, refresh_token_expiry } = res.data;

      Cookies.set('access_token', access_token, { secure: false, sameSite: 'Lax' });
      Cookies.set('refresh_token', refresh_token, { secure: false, sameSite: 'Lax' });
      Cookies.set('access_token_expiry', access_token_expiry, { secure: false, sameSite: 'Lax' });
      Cookies.set('refresh_token_expiry', refresh_token_expiry, { secure: false, sameSite: 'Lax' });

      setTimeout(() => navigate('/dashboard'), 1000);
    } catch (err) {
      // already handled by toast.promise
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-600 to-pink-500 px-4 font-['Poppins']">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white shadow-xl rounded-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row animate-fade-in">
        <div className="hidden md:flex justify-center items-center bg-white p-10 w-full md:w-1/2">
          <div className="w-48 h-48 bg-gray-100 rounded-full flex items-center justify-center shadow-inner">
            <img src="/login-icon.png" alt="login icon" className="object-cover w-32 h-32" />
          </div>
        </div>

        <form onSubmit={handleLogin} className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Prima CRM Login</h2>

          <div className="mb-5">
            <label className="flex items-center border border-gray-300 rounded-full px-4 py-3 focus-within:ring-2 focus-within:ring-purple-500 transition-all duration-300">
              <FaEnvelope className="text-gray-400 mr-3" />
              <input ref={usernameRef} type="email" placeholder="Email" className="w-full outline-none bg-transparent" />
            </label>
          </div>

          <div className="mb-5 relative">
            <label className="flex items-center border border-gray-300 rounded-full px-4 py-3 focus-within:ring-2 focus-within:ring-purple-500 transition-all duration-300">
              <FaLock className="text-gray-400 mr-3" />
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full outline-none bg-transparent pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <HiEyeOff size={20} /> : <HiEye size={20} />}
              </button>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-full text-white font-semibold transition-all duration-300 ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
              }`}
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
