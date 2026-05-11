import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SectionHeading from '../components/SectionHeading';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);
  const status = useAuthStore((s) => s.status);
  const error = useAuthStore((s) => s.error);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const disabled = useMemo(() => status === 'loading', [status]);

  const onSubmit = async (e) => {
    e.preventDefault();
    await login({ email, password });
    navigate('/', { replace: true });
  };

  return (
    <main className="section">
      <div className="container auth-shell">
        <SectionHeading badge="Account" title="Login" subtitle="Welcome back. Continue your baking journey." />

        <form className="panel auth-card" onSubmit={onSubmit}>
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
            {disabled ? 'Logging in…' : 'Login'}
          </button>

          <p className="muted auth-alt">
            New here? <Link className="link" to="/signup">Create an account</Link>
          </p>
        </form>
      </div>
    </main>
  );
}

