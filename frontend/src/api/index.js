import axios from 'axios'
import client from './client'

const AGENT_QUEUE_BASE_URL = (import.meta.env.VITE_AGENT_QUEUE_BASE_URL || '/agent-queue-proxy').replace(/\/+$/, '')
const AGENT_QUEUE_PATH = '/api/agent-queue'
const buildAgentQueueUrl = (queueId) => queueId
  ? `${AGENT_QUEUE_BASE_URL}${AGENT_QUEUE_PATH}/${encodeURIComponent(queueId)}`
  : `${AGENT_QUEUE_BASE_URL}${AGENT_QUEUE_PATH}/`
const agentQueueClient = axios.create({
  timeout: 15000,
})

// --- Alerts ---
export const alertsApi = {
  list:  (params) => client.get('/api/alerts', { params }),
  stats: ()       => client.get('/api/alerts/stats'),
  get:   (id)     => client.get(`/api/alerts/${id}`),
  triage:(id, body) => client.post(`/api/alerts/${id}/triage`, body),
}

// --- Agents ---
export const agentsApi = {
  catalog:   ()       => client.get('/api/agents/catalog'),
  listJobs:  ()       => client.get('/api/agents/jobs'),
  run:       (body)   => client.post('/api/agents/run', body),
  getJob:    (jobId)  => client.get(`/api/agents/jobs/${jobId}`),
}

// --- Agent Queue ---
export const agentQueueApi = {
  list:   (params)         => agentQueueClient.get(buildAgentQueueUrl(), { params }),
  search: (params)         => agentQueueClient.get(buildAgentQueueUrl(), { params }),
  create: (body)           => agentQueueClient.post(buildAgentQueueUrl(), body),
  get:    (queueId)        => agentQueueClient.get(buildAgentQueueUrl(queueId)),
  update: (queueId, body)  => agentQueueClient.put(buildAgentQueueUrl(queueId), body),
  remove: (queueId)        => agentQueueClient.delete(buildAgentQueueUrl(queueId)),
}

// --- Incidents ---
export const incidentsApi = {
  list:    ()       => client.get('/api/incidents'),
  create:  (body)   => client.post('/api/incidents', body),
  get:     (id)     => client.get(`/api/incidents/${id}`),
  updateStatus: (id, status) => client.patch(`/api/incidents/${id}/status`, null, { params: { status } }),
}

// --- Intelligence ---
export const intelApi = {
  enrich: (body)  => client.post('/api/intelligence/enrich', body),
  feeds:  ()      => client.get('/api/intelligence/feeds'),
}

// --- Reports ---
export const reportsApi = {
  list:     ()     => client.get('/api/reports'),
  generate: (body) => client.post('/api/reports/generate', body),
}

// --- Auth ---
export const authApi = {
  login: (body) => client.post('/api/auth/login', body),
  me:    ()     => client.get('/api/auth/me'),
}
