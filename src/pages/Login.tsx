import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';
import '../styles/auth.css';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        const role = res.data.role;
        if (role === 'Administrator') {
          navigate('/admin');
        } else if (role === 'GovernmentOfficer') {
          navigate('/officer');
        } else if (role === 'FieldWorker') {
          navigate('/worker');
        } else {
          navigate('/citizen');
        }
      } else {
        setError(res.errors?.[0] || 'Invalid login credentials.');
      }
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* ---- Brand panel (shared with Register) ---- */}
      <div className="register-brand">
        <div className="register-brand-logo">
          <Leaf size={22} color="#7fd8a0" strokeWidth={2.2} />
          Greenix
        </div>
        <div className="register-brand-tagline">Together for a cleaner, greener city</div>
        <p className="register-brand-sub">
          Report civic issues, track resolutions, and help your city's departments
          respond faster.
        </p>

        <svg
          className="register-illustration"
          viewBox="0 0 380 260"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <ellipse cx="190" cy="235" rx="150" ry="10" fill="#0e2119" opacity="0.6" />
          <rect x="40" y="120" width="34" height="105" rx="3" fill="#22503d" />
          <rect x="80" y="90" width="30" height="135" rx="3" fill="#1b3f30" />
          <rect x="116" y="140" width="26" height="85" rx="3" fill="#22503d" />
          <rect x="230" y="105" width="32" height="120" rx="3" fill="#1b3f30" />
          <rect x="268" y="150" width="26" height="75" rx="3" fill="#22503d" />
          <rect x="300" y="125" width="30" height="100" rx="3" fill="#1b3f30" />
          <g fill="#7fd8a0" opacity="0.55">
            <rect x="47" y="132" width="6" height="6" rx="1" />
            <rect x="60" y="132" width="6" height="6" rx="1" />
            <rect x="47" y="150" width="6" height="6" rx="1" />
            <rect x="60" y="150" width="6" height="6" rx="1" />
            <rect x="88" y="104" width="6" height="6" rx="1" />
            <rect x="100" y="104" width="6" height="6" rx="1" />
            <rect x="88" y="122" width="6" height="6" rx="1" />
            <rect x="100" y="122" width="6" height="6" rx="1" />
            <rect x="238" y="120" width="6" height="6" rx="1" />
            <rect x="250" y="120" width="6" height="6" rx="1" />
            <rect x="308" y="140" width="6" height="6" rx="1" />
            <rect x="318" y="140" width="6" height="6" rx="1" />
          </g>
          <path d="M0 225 C 60 195, 130 210, 190 200 C 250 190, 320 205, 380 190 L380 240 L0 240 Z" fill="#2c5c44" />
          <path
            d="M190 225 C 188 190, 170 165, 145 150"
            stroke="#7fd8a0"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
          />
          <path d="M145 150 C 155 148, 168 152, 172 165 C 158 168, 147 162, 145 150 Z" fill="#7fd8a0" />
          <path d="M162 178 C 172 174, 184 178, 188 190 C 175 194, 164 188, 162 178 Z" fill="#4fb373" />
          <path d="M176 202 C 187 199, 199 204, 202 216 C 189 219, 178 213, 176 202 Z" fill="#7fd8a0" />
        </svg>

        <div className="register-brand-footer">© {new Date().getFullYear()} Greenix Civic Platform</div>
      </div>

      {/* ---- Form panel ---- */}
      <div className="login-form-panel">
        <div className="login-form-card">
          <h1 className="login-heading">Welcome back <span aria-hidden="true">👋</span></h1>
          <p className="login-subheading">Sign in to continue to Greenix</p>

          {error && <div className="login-alert-danger">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="login-field">
              <label className="login-label" htmlFor="email">Email address</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Mail size={17} /></span>
                <input
                  id="email"
                  type="email"
                  className="login-input"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="login-field">
              <label className="login-label" htmlFor="password">Password</label>
              <div className="login-input-wrap">
                <span className="login-input-icon"><Lock size={17} /></span>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input has-toggle"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="login-toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-options-row">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <Link to="/forgot-password" className="login-forgot">Forgot password?</Link>
            </div>

            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? 'Signing in...' : (
                <>
                  Sign in
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="login-footer">
            Don't have an account? <Link to="/register">Register here</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;