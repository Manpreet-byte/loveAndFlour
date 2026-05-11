import { useMemo, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { useAuthStore } from '../store/authStore';

async function apiRequest(path, { token, method = 'GET', body } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  const res = await fetch(path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message = data?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data;
}

export default function AdminDashboardPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const disabled = useMemo(() => status === 'loading', [status]);

  const checkDashboard = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const data = await apiRequest('/api/admin/dashboard', { token });
      setMessage(`Admin access OK: ${data.scope}`);
    } catch (err) {
      setMessage(err?.message ?? 'Failed');
    } finally {
      setStatus('idle');
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const data = await apiRequest('/api/admin/admins', { token, method: 'POST', body: { name, email, password } });
      setMessage(`Created admin: ${data.user.email}`);
      setName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage(err?.message ?? 'Failed to create admin');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <main className="section">
      <div className="container">
        <SectionHeading badge="Admin" title="Dashboard" subtitle="Admin-only area (RBAC protected)." />

        <div className="panel auth-card">
          {!token ? <p className="form-error">Login as an admin to access this page.</p> : null}
          {user ? <p className="muted">Signed in as {user.email} ({user.role})</p> : null}

          <button className="button button-solid" type="button" onClick={checkDashboard} disabled={disabled || !token}>
            {disabled ? 'Checking…' : 'Check admin access'}
          </button>

          <div className="divider" />

          <h3 className="h3">Create another admin</h3>
          <form className="contact-form" onSubmit={createAdmin}>
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
            <button className="button button-solid" type="submit" disabled={disabled || !token}>
              {disabled ? 'Creating…' : 'Create admin'}
            </button>
          </form>

          {message ? <p className="muted">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}

