const BASE = '/api';

function getToken() {
  return localStorage.getItem('toc_admin_token');
}

function headers(withAuth = true) {
  const h = { 'Content-Type': 'application/json' };
  if (withAuth) h['Authorization'] = `Bearer ${getToken()}`;
  return h;
}

async function request(method, path, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: headers(),
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Auth
  login:      (email, password)   => request('POST', '/auth/login', { email, password }),
  me:         ()                  => request('GET',  '/auth/me'),
  needsSetup: ()                  => fetch(BASE + '/auth/needs-setup').then(r => r.json()),
  setup:      (email, password, name) => request('POST', '/auth/setup', { email, password, name }),

  // Products
  getProducts: (params = {})  => request('GET', '/products?' + new URLSearchParams(params)),
  getProduct:  (id)           => request('GET', `/products/${id}`),
  createProduct: (data)       => request('POST', '/products', data),
  updateProduct: (id, data)   => request('PUT', `/products/${id}`, data),
  deleteProduct: (id)         => request('DELETE', `/products/${id}`),
  getStats:    ()             => request('GET', '/products/meta/stats'),
  getCategories: ()           => request('GET', '/products/meta/categories'),

  // Image upload
  uploadImage: async (file) => {
    const form = new FormData();
    form.append('image', file);
    const res = await fetch(BASE + '/products/upload/image', {
      method: 'POST',
      headers: { Authorization: `Bearer ${getToken()}` },
      body: form,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');
    return data;
  },
};
