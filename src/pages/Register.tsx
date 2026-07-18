import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, Leaf, ArrowRight } from 'lucide-react';
import "../styles/auth.css";
const ROLES = [
  { value: 'Citizen', title: 'Citizen', sub: 'Report complaints' },
  { value: 'GovernmentOfficer', title: 'Government Officer', sub: 'Assign & manage' },
  { value: 'FieldWorker', title: 'Field Worker', sub: 'Resolve & verify' },
  { value: 'Administrator', title: 'Administrator', sub: 'Audit & system logs' },
];

const DEPARTMENTS = [
  { value: '1', label: 'Roads & Highways' },
  { value: '2', label: 'Sanitation & Waste' },
  { value: '3', label: 'Water & Sewage' },
  { value: '4', label: 'Electrical & Lighting' },
];

const Register: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [role, setRole] = useState('Citizen');
  const [departmentId, setDepartmentId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const needsDepartment = role === 'GovernmentOfficer' || role === 'FieldWorker';
  const passwordsMismatch = confirmPassword.length > 0 && password !== confirmPassword;

  const handleRoleChange = (value: string) => {
    setRole(value);
    if (value === 'Citizen' || value === 'Administrator') {
      setDepartmentId('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const parsedDept = departmentId ? parseInt(departmentId) : undefined;
      const res = await register(fullName, email, role, password, parsedDept);

      if (res.success) {
        setSuccess('Registration completed successfully! Redirecting to login...');
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else {
        setError(res.errors?.[0] || 'Registration failed.');
      }
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0] || 'An error occurred during registration.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      {/* ---- Brand panel ---- */}
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
      <div className="register-form-panel">
        <div className="register-form-card">
          <h1 className="register-heading">Create your account</h1>
          <p className="register-subheading">Welcome! Please fill in your details to get started.</p>

          {error && <div className="register-alert register-alert-danger">{error}</div>}
          {success && <div className="register-alert register-alert-success">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="register-field">
              <label className="register-label" htmlFor="fullName">Full name</label>
              <input
                id="fullName"
                type="text"
                className="register-input"
                placeholder="e.g. Tamil Vanan"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="email">Email address</label>
              <input
                id="email"
                type="email"
                className="register-input"
                placeholder="e.g. tamilvanan@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="password">Password</label>
              <div className="register-input-wrap">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="register-input has-toggle"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                />
                <button
                  type="button"
                  className="register-toggle-visibility"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="register-field">
              <label className="register-label" htmlFor="confirmPassword">Confirm password</label>
              <div className="register-input-wrap">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  className="register-input has-toggle"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="register-toggle-visibility"
                  onClick={() => setShowConfirmPassword((v) => !v)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {passwordsMismatch && (
                <div className="register-password-hint">Passwords do not match.</div>
              )}
            </div>

            <div className="register-field">
              <label className="register-label">Account role</label>
              <div className="register-role-grid" role="radiogroup" aria-label="Account role">
                {ROLES.map((r) => (
                  <label
                    key={r.value}
                    className={`register-role-option${role === r.value ? ' is-active' : ''}`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={r.value}
                      checked={role === r.value}
                      onChange={() => handleRoleChange(r.value)}
                    />
                    <span className="register-role-option-title">{r.title}</span>
                    <span className="register-role-option-sub">{r.sub}</span>
                  </label>
                ))}
              </div>
            </div>

            {needsDepartment && (
              <div className="register-field">
                <label className="register-label" htmlFor="departmentId">Assigned department</label>
                <select
                  id="departmentId"
                  className="register-select"
                  value={departmentId}
                  onChange={(e) => setDepartmentId(e.target.value)}
                  required
                >
                  <option value="">-- Select department --</option>
                  {DEPARTMENTS.map((d) => (
                    <option key={d.value} value={d.value}>{d.label}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              className="register-submit"
              disabled={loading || passwordsMismatch}
            >
              {loading ? 'Creating account...' : (
                <>
                  Create account
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          <div className="register-footer">
            Already have an account? <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;