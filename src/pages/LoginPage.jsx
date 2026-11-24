import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, GraduationCap, Lock, Mail, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { isSafeInternalRedirect } from '../utils/erpLogic';

export default function LoginPage() {
  const { user, login } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const redirectTo = isSafeInternalRedirect(location.state?.from);

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate(redirectTo, { replace: true });
    }
  }, [user, navigate, redirectTo]);

  useEffect(() => {
    if (searchParams.get('autostart') === '1' && !user) {
      setUsername('principal');
      setEmail('principal@school.com');
      setPassword('demo1234');
      login({ username: 'principal', email: 'principal@school.com', password: 'demo1234' })
        .then(() => navigate(redirectTo, { replace: true }))
        .catch(() => {});
    }
  }, [searchParams, user, login, navigate, redirectTo]);

  const fillDemo = () => {
    setUsername('principal');
    setEmail('principal@school.com');
    setPassword('demo1234');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const logged = await login({ username, email, password });
      addToast(`Welcome, ${logged.name}!`);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err.message || 'Incorrect username, email, or password');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#091834] flex items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-2xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2 border border-slate-200">
        {/* Left Navy Welcome Panel */}
        <div className="bg-gradient-to-br from-[#08152e] via-[#0e2a5c] to-[#0058cc] text-white p-8 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="font-display font-bold text-xl tracking-tight">School ERP</h1>
                <p className="text-xs text-blue-100/80">School Management System</p>
              </div>
            </div>

            <h2 className="font-display font-bold text-2xl mt-10 leading-snug">
              Manage Your Whole School in One Place
            </h2>
            <p className="text-sm text-blue-100/85 mt-3 leading-relaxed">
              Student records, monthly fee vouchers, teacher salaries, expenses, stock, and
              WhatsApp fee reminders — everything on one simple dashboard.
            </p>
          </div>

          <div className="mt-8 p-4 rounded-xl bg-white/10 border border-white/15 text-xs leading-relaxed">
            <div className="font-semibold text-amber-300 mb-1">Demo Login Credentials</div>
            <div>Username: <strong className="font-mono-num">principal</strong></div>
            <div>Email: <strong className="font-mono-num">principal@school.com</strong></div>
            <div>Password: <strong className="font-mono-num">demo1234</strong></div>
            <button
              type="button"
              onClick={fillDemo}
              className="mt-2.5 px-3 py-1.5 rounded-lg bg-white text-blue-900 font-semibold text-xs hover:bg-blue-50 transition-colors cursor-pointer"
            >
              Fill Demo Details
            </button>
          </div>
        </div>

        {/* Right Login Form */}
        <div className="p-8 sm:p-10 flex flex-col justify-center">
          <div className="mb-6">
            <h2 className="font-display font-bold text-2xl text-slate-900">Principal Login</h2>
            <p className="text-sm text-slate-500 mt-1">
              Enter your details to sign in
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-sm font-medium text-red-700"
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label htmlFor="login-username" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-email" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@school.com"
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div>
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="Enter password (min 8 characters)"
                  className="w-full h-11 pl-10 pr-11 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  title={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="mt-2 h-11 rounded-xl bg-[#0066eb] hover:bg-[#0052bd] text-white font-display font-semibold text-sm transition-colors disabled:opacity-60 cursor-pointer"
            >
              {submitting ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
