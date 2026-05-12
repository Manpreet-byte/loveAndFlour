function getBaseUrl() {
  return '';
}

async function request(path, { method = 'GET', body, token } = {}) {
  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${getBaseUrl()}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  const contentType = res.headers.get('content-type') ?? '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

  if (!res.ok) {
    const message = data?.error?.message ?? `Request failed (${res.status})`;
    const err = new Error(message);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

export const api = {
  auth: {
    signup: (payload) => request('/api/auth/signup', { method: 'POST', body: payload }),
    login: (payload) => request('/api/auth/login', { method: 'POST', body: payload }),
  },
  admin: {
    bootstrap: (payload) => request('/api/admin/bootstrap', { method: 'POST', body: payload }),
    dashboard: (token) => request('/api/admin/dashboard', { token }),
    createAdmin: (token, payload) => request('/api/admin/admins', { method: 'POST', token, body: payload }),

    courses: {
      list: (token) => request('/api/admin/courses', { token }),
      create: (token, payload) => request('/api/admin/courses', { method: 'POST', token, body: payload }),
      update: (token, id, payload) => request(`/api/admin/courses/${id}`, { method: 'PATCH', token, body: payload }),
      remove: (token, id) => request(`/api/admin/courses/${id}`, { method: 'DELETE', token }),
    },

    categories: {
      list: (token, type) => request(type ? `/api/admin/categories?type=${encodeURIComponent(type)}` : '/api/admin/categories', { token }),
      create: (token, payload) => request('/api/admin/categories', { method: 'POST', token, body: payload }),
      remove: (token, id) => request(`/api/admin/categories/${id}`, { method: 'DELETE', token }),
    },

    recipes: {
      list: (token, categoryId) =>
        request(categoryId ? `/api/admin/recipes?category_id=${encodeURIComponent(categoryId)}` : '/api/admin/recipes', { token }),
      create: (token, payload) => request('/api/admin/recipes', { method: 'POST', token, body: payload }),
    },

    liveSessions: {
      list: (token, courseId) =>
        request(courseId ? `/api/admin/live-sessions?course_id=${encodeURIComponent(courseId)}` : '/api/admin/live-sessions', { token }),
      create: (token, payload) => request('/api/admin/live-sessions', { method: 'POST', token, body: payload }),
      update: (token, id, payload) => request(`/api/admin/live-sessions/${id}`, { method: 'PATCH', token, body: payload }),
    },

    recordings: {
      list: (token, courseId) =>
        request(courseId ? `/api/admin/recordings?course_id=${encodeURIComponent(courseId)}` : '/api/admin/recordings', { token }),
      create: (token, payload) => request('/api/admin/recordings', { method: 'POST', token, body: payload }),
    },

    users: {
      list: (token) => request('/api/admin/users', { token }),
    },

    enrollments: {
      list: (token) => request('/api/admin/enrollments', { token }),
      create: (token, payload) => request('/api/admin/enrollments', { method: 'POST', token, body: payload }),
      remove: (token, id) => request(`/api/admin/enrollments/${id}`, { method: 'DELETE', token }),
    },
  },
  profile: {
    me: (token) => request('/api/profile', { token }),
  },
  feed: {
    enrollments: (token) => request('/api/feed/enrollments', { token }),
    recordings: (token) => request('/api/feed/recordings', { token }),
  },
};
