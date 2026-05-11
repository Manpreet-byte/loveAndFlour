import { useEffect } from 'react';
import SectionHeading from '../components/SectionHeading';
import { useAuthStore } from '../store/authStore';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const logout = useAuthStore((s) => s.logout);
  const error = useAuthStore((s) => s.error);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  return (
    <main className="section">
      <div className="container">
        <SectionHeading badge="Account" title="Profile" subtitle="Your account details from the backend." />

        <div className="panel auth-card">
          {token ? null : <p className="form-error">You are not logged in.</p>}
          {error ? <p className="form-error">{error}</p> : null}
          {user ? (
            <div className="profile-grid">
              <div>
                <p className="section-kicker">Name</p>
                <p className="h4">{user.name}</p>
              </div>
              <div>
                <p className="section-kicker">Email</p>
                <p className="muted">{user.email}</p>
              </div>
              <div>
                <p className="section-kicker">Role</p>
                <p className="muted">{user.role}</p>
              </div>
            </div>
          ) : null}

          <button className="button button-solid" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    </main>
  );
}

