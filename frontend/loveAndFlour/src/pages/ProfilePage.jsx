import { useEffect, useMemo, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const logout = useAuthStore((s) => s.logout);
  const error = useAuthStore((s) => s.error);
  const [status, setStatus] = useState('idle'); // idle | saving
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  useEffect(() => {
    useAuthStore.getState().refreshProfile();
  }, []);

  useEffect(() => {
    if (!user) return;
    setName(user?.name ?? '');
    setPhone(user?.phone ?? '');
  }, [user?.id]);

  const canSave = useMemo(() => Boolean(token && status === 'idle'), [token, status]);

  const onSave = async () => {
    if (!token || status !== 'idle') return;
    setStatus('saving');
    setMessage('');
    try {
      await api.profile.update(token, { name, phone });
      await useAuthStore.getState().refreshProfile();
      setMessage('Profile updated.');
    } catch (err) {
      setMessage(err?.message ?? 'Unable to save profile.');
    } finally {
      setStatus('idle');
    }
  };

  return (
    <main className="section">
      <div className="container">
        <SectionHeading badge="Account" title="Profile" subtitle="Your account details from the backend." />

        <div className="panel auth-card">
          {token ? null : <p className="form-error">You are not logged in.</p>}
          {error ? <p className="form-error">{error}</p> : null}
          {message ? <p className={message.includes('updated') ? 'muted' : 'form-error'}>{message}</p> : null}
          {user ? (
            <div className="profile-grid">
              <div>
                <p className="section-kicker">Name</p>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} disabled={!canSave} />
              </div>
              <div>
                <p className="section-kicker">Email</p>
                <p className="muted">{user.email}</p>
              </div>
              <div>
                <p className="section-kicker">Role</p>
                <p className="muted">{user.role}</p>
              </div>
              <div>
                <p className="section-kicker">Phone</p>
                <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!canSave} placeholder="Optional" />
              </div>
            </div>
          ) : null}

          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            <button className="button button-solid" type="button" onClick={onSave} disabled={!canSave}>
              {status === 'saving' ? 'Saving…' : 'Save changes'}
            </button>
            <button className="button button-ghost" type="button" onClick={logout} disabled={status === 'saving'}>
            Logout
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
