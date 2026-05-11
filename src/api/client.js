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
  },
  profile: {
    me: (token) => request('/api/profile', { token }),
  },
};
