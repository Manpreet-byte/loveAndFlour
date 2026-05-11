import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import { useAuthStore } from '../store/authStore';

export default function SignupPage() {
  const navigate = useNavigate();
  const signup = useAuthStore((s) => s.signup);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const disabled = useMemo(() => status === 'loading', [status]);

  const onSubmit = async (e) => {
    e.preventDefault();
    await signup({ name, email, password });
    navigate('/', { replace: true });
  };

  return (
    <main className="section">
      <div className="container auth-shell">
        <SectionHeading badge="Account" title="Sign up" subtitle="Create your account to enroll and save workshops." />

        <form className="panel auth-card" onSubmit={onSubmit}>
          <label className="field">
            <span className="field-label">Name</span>
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
          </label>

          <label className="field">
            <span className="field-label">Email</span>
            <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>

          <label className="field">
            <span className="field-label">Password</span>
            <input
              className="input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              type="password"
              minLength={8}
              required
            />
          </label>

          {error ? <p className="form-error">{error}</p> : null}

          <button className="button button-solid" type="submit" disabled={disabled}>
            {disabled ? 'Creating…' : 'Create account'}
          </button>

          <p className="muted auth-alt">
            Already have an account? <Link className="link" to="/login">Login</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

