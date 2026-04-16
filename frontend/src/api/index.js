import client from './client'

// --- PAIAC Alerts ---
export const alertsApi = {
  list: (params) => client.get('/api/alerts/', { params }),
  stats: () => client.get('/api/alerts/stats'),
  get: (id) => client.get(`/api/alerts/${id}`),
  details: (id) => client.get(`/api/alerts/${id}/details`),
  triage: (id, body) => client.post(`/api/alerts/${id}/triage`, body),
}

export const predictionsApi = {
  list: (params) => client.get('/api/predictions/', { params }),
  get: (id) => client.get(`/api/predictions/${id}`),
}

export const contextsApi = {
  list: (params) => client.get('/api/contexts/', { params }),
  get: (id) => client.get(`/api/contexts/${id}`),
}

export const investigationsApi = {
  list: (params) => client.get('/api/investigations/', { params }),
  get: (id) => client.get(`/api/investigations/${id}`),
}

export const recommendationsApi = {
  list: (params) => client.get('/api/recommendations/', { params }),
  get: (id) => client.get(`/api/recommendations/${id}`),
}

// --- Agents ---
export const agentsApi = {
  catalog: () => client.get('/api/agents/catalog'),
  listJobs: () => client.get('/api/agents/jobs'),
  run: (body) => client.post('/api/agents/run', body),
  getJob: (jobId) => client.get(`/api/agents/jobs/${jobId}`),
}

// --- Incidents ---
export const incidentsApi = {
  list: () => client.get('/api/incidents'),
  create: (body) => client.post('/api/incidents', body),
  get: (id) => client.get(`/api/incidents/${id}`),
  updateStatus: (id, status) => client.patch(`/api/incidents/${id}/status`, null, { params: { status } }),
}

// --- Threat Intel ---
export const intelApi = {
  enrich: (body) => client.post('/api/intelligence/enrich', body),
  feeds: () => client.get('/api/intelligence/feeds'),
}

// --- Reports ---
export const reportsApi = {
  list: () => client.get('/api/reports'),
  generate: (body) => client.post('/api/reports/generate', body),
}

// --- Auth ---
export const authApi = {
  login: (body) => client.post('/api/auth/login', body),
  me: () => client.get('/api/auth/me'),
}
