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
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4 font-['Poppins']">
      <Toaster position="top-center" reverseOrder={false} />
      <div className="bg-white shadow-lg rounded-xl w-full max-w-md p-8 md:p-10 transition-all duration-300">
        <div className="flex flex-col items-center mb-8">
          <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mb-4">
            <img src="/login-icon.png" alt="login icon" className="object-cover w-12 h-12" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Login to your account</h2>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition">
              <FaEnvelope className="text-gray-400 mr-2" />
              <input
                ref={usernameRef}
                type="email"
                placeholder="you@example.com"
                className="w-full outline-none bg-transparent text-sm text-gray-800"
              />
            </div>
          </div>

          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="flex items-center border border-gray-300 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-blue-500 transition">
              <FaLock className="text-gray-400 mr-2" />
              <input
                ref={passwordRef}
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="w-full outline-none bg-transparent text-sm text-gray-800 pr-8"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? <HiEyeOff size={18} /> : <HiEye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-2.5 text-sm rounded-md font-medium text-white cursor-pointer transition ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            {loading ? 'Logging in...' : 'LOGIN'}
          </button>
        </form>
      </div>
    </div>
  );
}
