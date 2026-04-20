const AUTH_COOKIE_NAME = 'pearl_auth'
const AUTH_USER_COOKIE_NAME = 'pearl_user'
const AUTH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 8 // 8 hours

export const users = [{ username: 'PearlAdmin', password: 'Axc123' }]

export function authenticate(username, password) {
  return users.find((user) => user.username === username && user.password === password) || null
}

function setCookie(name, value, maxAgeSeconds) {
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Lax`
}

function getCookie(name) {
  const encodedName = `${name}=`
  const cookie = document.cookie
    .split(';')
    .map((part) => part.trim())
    .find((part) => part.startsWith(encodedName))

  if (!cookie) return null
  return decodeURIComponent(cookie.slice(encodedName.length))
}

export function loginSession(username) {
  setCookie(AUTH_COOKIE_NAME, '1', AUTH_COOKIE_MAX_AGE_SECONDS)
  setCookie(AUTH_USER_COOKIE_NAME, username, AUTH_COOKIE_MAX_AGE_SECONDS)
}

export function clearSession() {
  document.cookie = `${AUTH_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
  document.cookie = `${AUTH_USER_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`
}

export function isAuthenticated() {
  return getCookie(AUTH_COOKIE_NAME) === '1'
}

export function getAuthenticatedUser() {
  return getCookie(AUTH_USER_COOKIE_NAME)
}
