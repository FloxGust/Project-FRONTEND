export const USER_ALLOWED_SOURCE = 'autolog'

export const normalizeSource = (value) => String(value || '').trim().toLowerCase()

export const isAllowedUserSource = (value) => normalizeSource(value) === USER_ALLOWED_SOURCE
