import { useEffect, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { api } from '../api/client';
import { useAuthStore } from '../store/authStore';

export default function DashboardPage() {
  const token = useAuthStore((s) => s.token);
  const [recordings, setRecordings] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    setError('');
    Promise.all([api.feed.enrollments(token), api.feed.recordings(token)])
      .then(([e, r]) => {
        setEnrollments(e.enrollments ?? []);
        setRecordings(r.recordings ?? []);
      })
      .catch((err) => setError(err?.message ?? 'Failed to load dashboard'));
  }, [token]);

  return (
    <main className="section">
      <div className="container">
        <SectionHeading badge="Dashboard" title="Your classes" subtitle="Recordings and active enrollments." />

        {!token ? <p className="form-error">Please login to view your dashboard.</p> : null}
        {error ? <p className="form-error">{error}</p> : null}

        <div className="grid" style={{ gap: 16 }}>
          <div className="panel">
            <h3 className="h3">Active enrollments</h3>
            {enrollments.length ? (
              <ul className="list">
                {enrollments.map((e) => (
                  <li key={e.enrollment_id}>
                    <strong>{e.title}</strong> <span className="muted">(valid till {String(e.expiry_date)})</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No active enrollments yet.</p>
            )}
          </div>

          <div className="panel">
            <h3 className="h3">Recordings</h3>
            {recordings.length ? (
              <ul className="list">
                {recordings.map((r) => (
                  <li key={r.recording_id}>
                    <div>
                      <strong>{r.course_title}</strong>
                      <div className="muted">{r.session_title ? r.session_title : `Session ${r.live_session_id}`}</div>
                      {r.is_expired ? (
                        <div className="muted">Expired {r.expires_at ? `(expired on ${String(r.expires_at).slice(0, 10)})` : ''}</div>
                      ) : (
                        <>
                          <a className="link" href={r.recording_url} target="_blank" rel="noreferrer">
                            Open recording
                          </a>
                          {r.expires_at ? <div className="muted">Valid till {String(r.expires_at).slice(0, 10)}</div> : null}
                        </>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="muted">No recordings available yet.</p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
