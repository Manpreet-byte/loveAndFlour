import { useEffect, useMemo, useState } from 'react';
import SectionHeading from '../components/SectionHeading';
import { useAuthStore } from '../store/authStore';
import { api } from '../api/client';

const tabs = [
  { id: 'overview', label: 'Overview' },
  { id: 'courses', label: 'Courses' },
  { id: 'categories', label: 'Categories' },
  { id: 'recipes', label: 'Recipes' },
  { id: 'sessions', label: 'Live Sessions' },
  { id: 'recordings', label: 'Recordings' },
  { id: 'users', label: 'Users' },
  { id: 'enrollments', label: 'Enrollments' },
  { id: 'admins', label: 'Admins' },
];

export default function AdminDashboardPage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const refreshProfile = useAuthStore((s) => s.refreshProfile);
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [tab, setTab] = useState('overview');

  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [recordings, setRecordings] = useState([]);
  const [users, setUsers] = useState([]);
  const [enrollments, setEnrollments] = useState([]);

  const [courseForm, setCourseForm] = useState({
    title: '',
    summary: '',
    featured_image_url: '',
    price_inr: '',
    category_ids: '',
    scheduled_at: '',
    zoom_meeting_id: '',
    zoom_join_url: '',
  });

  const [categoryForm, setCategoryForm] = useState({ type: 'course', name: '', slug: '', description: '' });
  const [recipeForm, setRecipeForm] = useState({ title: '', summary: '', featured_image_url: '', content: '', category_ids: '' });
  const [sessionForm, setSessionForm] = useState({
    course_id: '',
    title: '',
    scheduled_at: '',
    status: 'upcoming',
    zoom_meeting_id: '',
    zoom_join_url: '',
  });
  const [recordingForm, setRecordingForm] = useState({
    live_session_id: '',
    course_id: '',
    recording_url: '',
    provider: '',
    recorded_at: '',
    duration_seconds: '',
  });
  const [enrollForm, setEnrollForm] = useState({ user_id: '', course_id: '', expiry_date: '' });
  const [adminForm, setAdminForm] = useState({ name: '', email: '', password: '' });

  const disabled = useMemo(() => status === 'loading', [status]);

  useEffect(() => {
    refreshProfile();
  }, [refreshProfile]);

  const isAdmin = user?.role === 'admin';

  const checkDashboard = async () => {
    setStatus('loading');
    setMessage('');
    try {
      const data = await api.admin.dashboard(token);
      setMessage(`Admin access OK: ${data.scope}`);
    } catch (err) {
      setMessage(err?.message ?? 'Failed');
    } finally {
      setStatus('idle');
    }
  };

  const loadTabData = async (nextTab) => {
    if (!token || !isAdmin) return;
    setStatus('loading');
    setMessage('');
    try {
      if (nextTab === 'courses') {
        const data = await api.admin.courses.list(token);
        setCourses(data.courses ?? []);
      } else if (nextTab === 'categories') {
        const data = await api.admin.categories.list(token);
        setCategories(data.categories ?? []);
      } else if (nextTab === 'recipes') {
        const data = await api.admin.recipes.list(token);
        setRecipes(data.recipes ?? []);
      } else if (nextTab === 'sessions') {
        const data = await api.admin.liveSessions.list(token);
        setSessions(data.live_sessions ?? []);
      } else if (nextTab === 'recordings') {
        const data = await api.admin.recordings.list(token);
        setRecordings(data.recordings ?? []);
      } else if (nextTab === 'users') {
        const data = await api.admin.users.list(token);
        setUsers(data.users ?? []);
      } else if (nextTab === 'enrollments') {
        const data = await api.admin.enrollments.list(token);
        setEnrollments(data.enrollments ?? []);
      }
    } catch (err) {
      setMessage(err?.message ?? 'Failed');
    } finally {
      setStatus('idle');
    }
  };

  const onTab = async (next) => {
    setTab(next);
    await loadTabData(next);
  };

  const submitCourse = async (e) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      const categoryIds = courseForm.category_ids
        ? courseForm.category_ids
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
            .map((v) => Number(v))
            .filter((n) => Number.isFinite(n) && n > 0)
        : [];
      const payload = {
        title: courseForm.title,
        summary: courseForm.summary || null,
        featured_image_url: courseForm.featured_image_url || null,
        category_ids: categoryIds,
        price: courseForm.price_inr ? { currency: 'INR', amount_cents: Number(courseForm.price_inr) * 100 } : null,
        scheduled_at: courseForm.scheduled_at || null,
        zoom_meeting_id: courseForm.zoom_meeting_id || null,
        zoom_join_url: courseForm.zoom_join_url || null,
      };
      await api.admin.courses.create(token, payload);
      setMessage('Course created.');
      setCourseForm({
        title: '',
        summary: '',
        featured_image_url: '',
        price_inr: '',
        category_ids: '',
        scheduled_at: '',
        zoom_meeting_id: '',
        zoom_join_url: '',
      });
      await loadTabData('courses');
    } catch (err) {
      setMessage(err?.message ?? 'Failed to create course');
    } finally {
      setStatus('idle');
    }
  };

  const removeCourse = async (id) => {
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      await api.admin.courses.remove(token, id);
      setMessage('Course deleted.');
      await loadTabData('courses');
    } catch (err) {
      setMessage(err?.message ?? 'Failed to delete course');
    } finally {
      setStatus('idle');
    }
  };

  const submitCategory = async (e) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      await api.admin.categories.create(token, {
        type: categoryForm.type,
        name: categoryForm.name,
        slug: categoryForm.slug || null,
        description: categoryForm.description || null,
      });
      setMessage('Category created.');
      setCategoryForm({ type: categoryForm.type, name: '', slug: '', description: '' });
      await loadTabData('categories');
    } catch (err) {
      setMessage(err?.message ?? 'Failed to create category');
    } finally {
      setStatus('idle');
    }
  };

  const removeCategory = async (id) => {
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      await api.admin.categories.remove(token, id);
      setMessage('Category deleted.');
      await loadTabData('categories');
    } catch (err) {
      setMessage(err?.message ?? 'Failed to delete category');
    } finally {
      setStatus('idle');
    }
  };

  const submitRecipe = async (e) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      const categoryIds = recipeForm.category_ids
        ? recipeForm.category_ids
            .split(',')
            .map((v) => v.trim())
            .filter(Boolean)
            .map((v) => Number(v))
            .filter((n) => Number.isFinite(n) && n > 0)
        : [];
      await api.admin.recipes.create(token, {
        title: recipeForm.title,
        summary: recipeForm.summary || null,
        featured_image_url: recipeForm.featured_image_url || null,
        content: recipeForm.content || null,
        category_ids: categoryIds,
        is_published: true,
      });
      setMessage('Recipe created.');
      setRecipeForm({ title: '', summary: '', featured_image_url: '', content: '', category_ids: '' });
      await loadTabData('recipes');
    } catch (err) {
      setMessage(err?.message ?? 'Failed to create recipe');
    } finally {
      setStatus('idle');
    }
  };

  const submitSession = async (e) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      await api.admin.liveSessions.create(token, {
        course_id: Number(sessionForm.course_id),
        title: sessionForm.title || null,
        scheduled_at: sessionForm.scheduled_at,
        status: sessionForm.status,
        zoom_meeting_id: sessionForm.zoom_meeting_id || null,
        zoom_join_url: sessionForm.zoom_join_url || null,
      });
      setMessage('Live session created.');
      setSessionForm({ course_id: '', title: '', scheduled_at: '', status: 'upcoming', zoom_meeting_id: '', zoom_join_url: '' });
      await loadTabData('sessions');
    } catch (err) {
      setMessage(err?.message ?? 'Failed to create live session');
    } finally {
      setStatus('idle');
    }
  };

  const submitRecording = async (e) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      await api.admin.recordings.create(token, {
        live_session_id: Number(recordingForm.live_session_id),
        course_id: Number(recordingForm.course_id),
        recording_url: recordingForm.recording_url,
        provider: recordingForm.provider || null,
        recorded_at: recordingForm.recorded_at || null,
        duration_seconds: recordingForm.duration_seconds ? Number(recordingForm.duration_seconds) : null,
      });
      setMessage('Recording added.');
      setRecordingForm({ live_session_id: '', course_id: '', recording_url: '', provider: '', recorded_at: '', duration_seconds: '' });
      await loadTabData('recordings');
    } catch (err) {
      setMessage(err?.message ?? 'Failed to add recording');
    } finally {
      setStatus('idle');
    }
  };

  const submitEnrollment = async (e) => {
    e.preventDefault();
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      await api.admin.enrollments.create(token, {
        user_id: Number(enrollForm.user_id),
        course_id: Number(enrollForm.course_id),
        expiry_date: enrollForm.expiry_date || null,
      });
      setMessage('Enrollment created.');
      setEnrollForm({ user_id: '', course_id: '', expiry_date: '' });
      await loadTabData('enrollments');
    } catch (err) {
      setMessage(err?.message ?? 'Failed to enroll user');
    } finally {
      setStatus('idle');
    }
  };

  const removeEnrollment = async (id) => {
    if (!token) return;
    setStatus('loading');
    setMessage('');
    try {
      await api.admin.enrollments.remove(token, id);
      setMessage('Enrollment removed.');
      await loadTabData('enrollments');
    } catch (err) {
      setMessage(err?.message ?? 'Failed to remove enrollment');
    } finally {
      setStatus('idle');
    }
  };

  const createAdmin = async (e) => {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    try {
      const data = await api.admin.createAdmin(token, adminForm);
      setMessage(`Created admin: ${data.user.email}`);
      setAdminForm({ name: '', email: '', password: '' });
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

        <div className="panel admin-shell">
          {!token ? <p className="form-error">Login as an admin to access this page.</p> : null}
          {user ? <p className="muted">Signed in as {user.email} ({user.role})</p> : null}
          {!isAdmin && token ? <p className="form-error">Your account is not an admin.</p> : null}

          <div className="admin-tabs" role="tablist" aria-label="Admin sections">
            {tabs.map((t) => (
              <button
                key={t.id}
                type="button"
                className={`admin-tab${tab === t.id ? ' is-active' : ''}`}
                onClick={() => onTab(t.id)}
                disabled={!token || !isAdmin}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'overview' ? (
            <div className="admin-panel">
              <button className="button button-solid" type="button" onClick={checkDashboard} disabled={disabled || !token || !isAdmin}>
                {disabled ? 'Checking…' : 'Check admin access'}
              </button>
            </div>
          ) : null}

          {tab === 'courses' ? (
            <div className="admin-panel">
              <h3 className="h3">Add course</h3>
              <form className="contact-form" onSubmit={submitCourse}>
                <label className="field">
                  <span className="field-label">Title</span>
                  <input className="input" value={courseForm.title} onChange={(e) => setCourseForm((s) => ({ ...s, title: e.target.value }))} required />
                </label>
                <label className="field">
                  <span className="field-label">Description</span>
                  <textarea className="input textarea" rows={4} value={courseForm.summary} onChange={(e) => setCourseForm((s) => ({ ...s, summary: e.target.value }))} />
                </label>
                <label className="field">
                  <span className="field-label">Category IDs (comma separated)</span>
                  <input className="input" value={courseForm.category_ids} onChange={(e) => setCourseForm((s) => ({ ...s, category_ids: e.target.value }))} placeholder="1,2" />
                </label>
                <label className="field">
                  <span className="field-label">Price (INR)</span>
                  <input className="input" value={courseForm.price_inr} onChange={(e) => setCourseForm((s) => ({ ...s, price_inr: e.target.value }))} placeholder="999" />
                </label>
                <label className="field">
                  <span className="field-label">Image URL</span>
                  <input className="input" value={courseForm.featured_image_url} onChange={(e) => setCourseForm((s) => ({ ...s, featured_image_url: e.target.value }))} placeholder="https://..." />
                </label>
                <div className="admin-split">
                  <label className="field">
                    <span className="field-label">Schedule live session (ISO datetime)</span>
                    <input className="input" value={courseForm.scheduled_at} onChange={(e) => setCourseForm((s) => ({ ...s, scheduled_at: e.target.value }))} placeholder="2026-05-11T18:30:00.000Z" />
                  </label>
                  <label className="field">
                    <span className="field-label">Zoom meeting id</span>
                    <input className="input" value={courseForm.zoom_meeting_id} onChange={(e) => setCourseForm((s) => ({ ...s, zoom_meeting_id: e.target.value }))} />
                  </label>
                </div>
                <label className="field">
                  <span className="field-label">Zoom join URL</span>
                  <input className="input" value={courseForm.zoom_join_url} onChange={(e) => setCourseForm((s) => ({ ...s, zoom_join_url: e.target.value }))} placeholder="https://zoom.us/j/..." />
                </label>
                <button className="button button-solid" type="submit" disabled={disabled}>{disabled ? 'Saving…' : 'Create course'}</button>
              </form>

              <h3 className="h3">Courses</h3>
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <div>ID</div>
                  <div>Title</div>
                  <div>Price</div>
                  <div />
                </div>
                {courses.map((c) => (
                  <div key={c.id} className="admin-row">
                    <div>{c.id}</div>
                    <div>{c.title}</div>
                    <div>{c.amount_cents ? `${c.currency} ${(c.amount_cents / 100).toFixed(0)}` : '—'}</div>
                    <div>
                      <button className="button button-solid admin-danger" type="button" onClick={() => removeCourse(c.id)} disabled={disabled}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'categories' ? (
            <div className="admin-panel">
              <h3 className="h3">Add category</h3>
              <form className="contact-form" onSubmit={submitCategory}>
                <label className="field">
                  <span className="field-label">Type</span>
                  <select className="input" value={categoryForm.type} onChange={(e) => setCategoryForm((s) => ({ ...s, type: e.target.value }))}>
                    <option value="course">course</option>
                    <option value="recipe">recipe</option>
                  </select>
                </label>
                <label className="field">
                  <span className="field-label">Name</span>
                  <input className="input" value={categoryForm.name} onChange={(e) => setCategoryForm((s) => ({ ...s, name: e.target.value }))} required />
                </label>
                <label className="field">
                  <span className="field-label">Slug (optional)</span>
                  <input className="input" value={categoryForm.slug} onChange={(e) => setCategoryForm((s) => ({ ...s, slug: e.target.value }))} />
                </label>
                <button className="button button-solid" type="submit" disabled={disabled}>{disabled ? 'Saving…' : 'Create category'}</button>
              </form>

              <h3 className="h3">Categories</h3>
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <div>ID</div>
                  <div>Type</div>
                  <div>Name</div>
                  <div>Slug</div>
                  <div />
                </div>
                {categories.map((c) => (
                  <div key={c.id} className="admin-row">
                    <div>{c.id}</div>
                    <div>{c.type}</div>
                    <div>{c.name}</div>
                    <div>{c.slug}</div>
                    <div>
                      <button className="button button-solid admin-danger" type="button" onClick={() => removeCategory(c.id)} disabled={disabled}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'recipes' ? (
            <div className="admin-panel">
              <h3 className="h3">Add recipe</h3>
              <form className="contact-form" onSubmit={submitRecipe}>
                <label className="field">
                  <span className="field-label">Title</span>
                  <input className="input" value={recipeForm.title} onChange={(e) => setRecipeForm((s) => ({ ...s, title: e.target.value }))} required />
                </label>
                <label className="field">
                  <span className="field-label">Summary</span>
                  <textarea className="input textarea" rows={3} value={recipeForm.summary} onChange={(e) => setRecipeForm((s) => ({ ...s, summary: e.target.value }))} />
                </label>
                <label className="field">
                  <span className="field-label">Category IDs (comma separated)</span>
                  <input className="input" value={recipeForm.category_ids} onChange={(e) => setRecipeForm((s) => ({ ...s, category_ids: e.target.value }))} placeholder="3,4" />
                </label>
                <label className="field">
                  <span className="field-label">Image URL</span>
                  <input className="input" value={recipeForm.featured_image_url} onChange={(e) => setRecipeForm((s) => ({ ...s, featured_image_url: e.target.value }))} placeholder="https://..." />
                </label>
                <label className="field">
                  <span className="field-label">Content (optional)</span>
                  <textarea className="input textarea" rows={5} value={recipeForm.content} onChange={(e) => setRecipeForm((s) => ({ ...s, content: e.target.value }))} />
                </label>
                <button className="button button-solid" type="submit" disabled={disabled}>{disabled ? 'Saving…' : 'Create recipe'}</button>
              </form>

              <h3 className="h3">Recipes</h3>
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <div>ID</div>
                  <div>Title</div>
                  <div>Slug</div>
                  <div>Published</div>
                </div>
                {recipes.map((r) => (
                  <div key={r.id} className="admin-row">
                    <div>{r.id}</div>
                    <div>{r.title}</div>
                    <div>{r.slug}</div>
                    <div>{r.is_published ? 'Yes' : 'No'}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'sessions' ? (
            <div className="admin-panel">
              <h3 className="h3">Schedule live session</h3>
              <form className="contact-form" onSubmit={submitSession}>
                <label className="field">
                  <span className="field-label">Course ID</span>
                  <input className="input" value={sessionForm.course_id} onChange={(e) => setSessionForm((s) => ({ ...s, course_id: e.target.value }))} required />
                </label>
                <label className="field">
                  <span className="field-label">Scheduled at (ISO datetime)</span>
                  <input className="input" value={sessionForm.scheduled_at} onChange={(e) => setSessionForm((s) => ({ ...s, scheduled_at: e.target.value }))} placeholder="2026-05-11T18:30:00.000Z" required />
                </label>
                <label className="field">
                  <span className="field-label">Zoom meeting id</span>
                  <input className="input" value={sessionForm.zoom_meeting_id} onChange={(e) => setSessionForm((s) => ({ ...s, zoom_meeting_id: e.target.value }))} />
                </label>
                <label className="field">
                  <span className="field-label">Zoom join URL</span>
                  <input className="input" value={sessionForm.zoom_join_url} onChange={(e) => setSessionForm((s) => ({ ...s, zoom_join_url: e.target.value }))} placeholder="https://zoom.us/j/..." />
                </label>
                <button className="button button-solid" type="submit" disabled={disabled}>{disabled ? 'Saving…' : 'Create session'}</button>
              </form>

              <h3 className="h3">Sessions</h3>
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <div>ID</div>
                  <div>Course</div>
                  <div>Scheduled</div>
                  <div>Status</div>
                </div>
                {sessions.map((s) => (
                  <div key={s.id} className="admin-row">
                    <div>{s.id}</div>
                    <div>{s.course_id}</div>
                    <div>{String(s.scheduled_at)}</div>
                    <div>{s.status}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'recordings' ? (
            <div className="admin-panel">
              <h3 className="h3">Upload recording</h3>
              <form className="contact-form" onSubmit={submitRecording}>
                <div className="admin-split">
                  <label className="field">
                    <span className="field-label">Live session ID</span>
                    <input className="input" value={recordingForm.live_session_id} onChange={(e) => setRecordingForm((s) => ({ ...s, live_session_id: e.target.value }))} required />
                  </label>
                  <label className="field">
                    <span className="field-label">Course ID</span>
                    <input className="input" value={recordingForm.course_id} onChange={(e) => setRecordingForm((s) => ({ ...s, course_id: e.target.value }))} required />
                  </label>
                </div>
                <label className="field">
                  <span className="field-label">Recording URL</span>
                  <input className="input" value={recordingForm.recording_url} onChange={(e) => setRecordingForm((s) => ({ ...s, recording_url: e.target.value }))} placeholder="https://..." required />
                </label>
                <button className="button button-solid" type="submit" disabled={disabled}>{disabled ? 'Saving…' : 'Add recording'}</button>
              </form>

              <h3 className="h3">Recordings</h3>
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <div>ID</div>
                  <div>Course</div>
                  <div>Session</div>
                  <div>URL</div>
                </div>
                {recordings.map((r) => (
                  <div key={r.id} className="admin-row">
                    <div>{r.id}</div>
                    <div>{r.course_id}</div>
                    <div>{r.live_session_id}</div>
                    <div className="admin-cell-wrap">{r.recording_url}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'users' ? (
            <div className="admin-panel">
              <h3 className="h3">Users</h3>
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <div>ID</div>
                  <div>Email</div>
                  <div>Role</div>
                  <div>Created</div>
                </div>
                {users.map((u) => (
                  <div key={u.id} className="admin-row">
                    <div>{u.id}</div>
                    <div>{u.email}</div>
                    <div>{u.role}</div>
                    <div>{String(u.created_at)}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'enrollments' ? (
            <div className="admin-panel">
              <h3 className="h3">Enroll user</h3>
              <form className="contact-form" onSubmit={submitEnrollment}>
                <div className="admin-split">
                  <label className="field">
                    <span className="field-label">User ID</span>
                    <input className="input" value={enrollForm.user_id} onChange={(e) => setEnrollForm((s) => ({ ...s, user_id: e.target.value }))} required />
                  </label>
                  <label className="field">
                    <span className="field-label">Course ID</span>
                    <input className="input" value={enrollForm.course_id} onChange={(e) => setEnrollForm((s) => ({ ...s, course_id: e.target.value }))} required />
                  </label>
                </div>
                <label className="field">
                  <span className="field-label">Expiry date (YYYY-MM-DD, optional)</span>
                  <input className="input" value={enrollForm.expiry_date} onChange={(e) => setEnrollForm((s) => ({ ...s, expiry_date: e.target.value }))} placeholder="2027-05-11" />
                </label>
                <button className="button button-solid" type="submit" disabled={disabled}>{disabled ? 'Saving…' : 'Enroll'}</button>
              </form>

              <h3 className="h3">Enrollments</h3>
              <div className="admin-table">
                <div className="admin-row admin-head">
                  <div>ID</div>
                  <div>User</div>
                  <div>Course</div>
                  <div>Expiry</div>
                  <div />
                </div>
                {enrollments.map((e) => (
                  <div key={e.id} className="admin-row">
                    <div>{e.id}</div>
                    <div>{e.user_email}</div>
                    <div>{e.course_title}</div>
                    <div>{String(e.expiry_date)}</div>
                    <div>
                      <button className="button button-solid admin-danger" type="button" onClick={() => removeEnrollment(e.id)} disabled={disabled}>
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          {tab === 'admins' ? (
            <div className="admin-panel">
              <h3 className="h3">Create another admin</h3>
              <form className="contact-form" onSubmit={createAdmin}>
                <label className="field">
                  <span className="field-label">Name</span>
                  <input className="input" value={adminForm.name} onChange={(e) => setAdminForm((s) => ({ ...s, name: e.target.value }))} required />
                </label>
                <label className="field">
                  <span className="field-label">Email</span>
                  <input className="input" value={adminForm.email} onChange={(e) => setAdminForm((s) => ({ ...s, email: e.target.value }))} type="email" required />
                </label>
                <label className="field">
                  <span className="field-label">Password</span>
                  <input className="input" value={adminForm.password} onChange={(e) => setAdminForm((s) => ({ ...s, password: e.target.value }))} type="password" minLength={8} required />
                </label>
                <button className="button button-solid" type="submit" disabled={disabled}>{disabled ? 'Creating…' : 'Create admin'}</button>
              </form>
            </div>
          ) : null}

          {message ? <p className="muted">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}
