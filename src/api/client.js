const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
const ENV_API_TOKEN = (import.meta.env.VITE_API_TOKEN ?? '').trim()
const AUTH_LOGIN_PATH = (import.meta.env.VITE_AUTH_LOGIN_PATH ?? '/auth/login').trim()
const USERS_CREATE_PATH = (import.meta.env.VITE_USERS_CREATE_PATH ?? '/users').trim()
const USERS_DELETE_PATH = (import.meta.env.VITE_USERS_DELETE_PATH ?? '/users').trim()
const USERS_UPDATE_PATH =
  (import.meta.env.VITE_USERS_UPDATE_PATH ?? import.meta.env.VITE_USERS_DELETE_PATH ?? '/users').trim()
const TOKEN_STORAGE_KEYS = ['token', 'jwt', 'access_token', 'authToken']

const ROLE_CODE_BY_NAME = {
  Root: 0,
  Admin: 1,
  User: 2,
  Invited: 3,
}

const LOGIN_PAYLOAD_BUILDERS = [
  ({ email, password }) => ({ email, password }),
  ({ email, password }) => ({ username: email, password }),
  ({ email, password }) => ({ userName: email, password }),
  ({ email, password }) => ({ correo: email, contrasena: password }),
]

const CREATE_USER_PAYLOAD_BUILDERS = [
  ({ nombres, apellidos, cedula, telefono, email, password, role }) => ({
    nombres,
    apellidos,
    cedula,
    telefono,
    email,
    password,
    role,
  }),
  ({ nombres, apellidos, cedula, telefono, email, password, role }) => ({
    nombres,
    apellidos,
    cedula,
    telefono,
    email,
    password,
    role: role?.toLowerCase?.() ?? role,
  }),
  ({ nombres, apellidos, cedula, telefono, email, password, role }) => ({
    name: `${nombres} ${apellidos}`.trim(),
    cedula,
    telefono,
    email,
    password,
    role,
  }),
  ({ nombres, apellidos, cedula, telefono, email, password, role }) => ({
    firstName: nombres,
    lastName: apellidos,
    document: cedula,
    phone: telefono,
    email,
    password,
    role,
  }),
]

const UPDATE_USER_PAYLOAD_BUILDERS = [
  ({ nombres, apellidos, cedula, telefono, email, role }) => ({
    nombres,
    apellidos,
    cedula,
    telefono,
    email,
    role,
  }),
]

const mapRoleToBackendCode = (role) => {
  if (typeof role === 'number' && Number.isFinite(role)) {
    return role
  }

  if (typeof role !== 'string') {
    return role
  }

  const normalizedRole = role.trim()
  return ROLE_CODE_BY_NAME[normalizedRole] ?? role
}

const asArray = (value) => (Array.isArray(value) ? value : [])

const firstNonEmptyString = (values) => {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }

  return ''
}

const extractTokenFromResponse = (responseData) => {
  if (!responseData || typeof responseData !== 'object') {
    return ''
  }

  const rootCandidates = [
    responseData.token,
    responseData.accessToken,
    responseData.jwt,
    responseData.access_token,
  ]

  const nestedCandidates = asArray(responseData.data).flatMap((item) => [
    item?.token,
    item?.accessToken,
    item?.jwt,
    item?.access_token,
  ])

  const objectCandidates = [responseData.data, responseData.result, responseData.user, responseData.payload]
    .filter((item) => item && typeof item === 'object')
    .flatMap((item) => [item.token, item.accessToken, item.jwt, item.access_token])

  return firstNonEmptyString([...rootCandidates, ...nestedCandidates, ...objectCandidates])
}

const getStoredToken = () => {
  for (const key of TOKEN_STORAGE_KEYS) {
    const value = localStorage.getItem(key)
    if (value?.trim()) {
      return value.trim()
    }
  }

  return ''
}

const parseResponseBody = async (response) => {
  const raw = await response.text()

  if (!raw.trim()) {
    return null
  }

  try {
    return JSON.parse(raw)
  } catch {
    return raw
  }
}

const request = async (path) => {
  if (!API_BASE_URL) {
    throw new Error('Falta configurar VITE_API_BASE_URL en el archivo .env')
  }

  const token = ENV_API_TOKEN || getStoredToken()

  const headers = {
    Accept: 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response

  try {
    response = await fetch(`${API_BASE_URL}${path}`, { headers })
  } catch {
    throw new Error(
      'No se pudo conectar con la API. Verifica que el backend este encendido y reinicia npm run dev.',
    )
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        'No autorizado (401). Configura VITE_API_TOKEN en .env o guarda el token en localStorage (token/jwt/access_token/authToken).',
      )
    }

    throw new Error(`Error ${response.status} al consultar ${path}`)
  }

  return response.json()
}

export const getUsers = async () => {
  return request('/users')
}

export const getTasks = async () => {
  return request('/tasks')
}

export const createUser = async ({ nombres, apellidos, cedula, telefono, email, password, role }) => {
  if (!API_BASE_URL) {
    throw new Error('Falta configurar VITE_API_BASE_URL en el archivo .env')
  }

  if (!USERS_CREATE_PATH.startsWith('/')) {
    throw new Error('VITE_USERS_CREATE_PATH debe iniciar con /, por ejemplo /users')
  }

  const token = ENV_API_TOKEN || getStoredToken()

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  let response = null
  const backendRole = mapRoleToBackendCode(role)

  for (const buildPayload of CREATE_USER_PAYLOAD_BUILDERS) {
    try {
      response = await fetch(`${API_BASE_URL}${USERS_CREATE_PATH}`, {
        method: 'POST',
        headers,
        body: JSON.stringify(
          buildPayload({
            nombres,
            apellidos,
            cedula,
            telefono,
            email,
            password,
            role: backendRole,
          }),
        ),
      })
    } catch {
      throw new Error(
        'No se pudo conectar con la API. Verifica que el backend este encendido y reinicia npm run dev.',
      )
    }

    if (!response || response.ok) {
      break
    }

    if ([400, 401, 403, 404, 409].includes(response.status)) {
      break
    }
  }

  if (!response) {
    throw new Error('No fue posible enviar la solicitud de creacion de usuario.')
  }

  const responseData = await parseResponseBody(response)

  if (!response.ok) {
    if (response.status === 400) {
      throw new Error('Datos invalidos. Verifica todos los campos requeridos del usuario.')
    }

    if (response.status === 401) {
      throw new Error(
        'No autorizado (401). Configura VITE_API_TOKEN en .env o inicia sesión nuevamente.',
      )
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para crear usuarios con este rol/token.')
    }

    if (response.status === 404) {
      throw new Error('No se encontro el endpoint para crear usuario. Revisa VITE_USERS_CREATE_PATH.')
    }

    if (response.status === 409) {
      throw new Error('Ya existe un usuario con ese correo.')
    }

    throw new Error(`Error ${response.status} al crear el usuario.`)
  }

  return responseData
}

export const updateUser = async ({ userId, nombres, apellidos, cedula, telefono, email, role }) => {
  if (!API_BASE_URL) {
    throw new Error('Falta configurar VITE_API_BASE_URL en el archivo .env')
  }

  if (!USERS_UPDATE_PATH.startsWith('/')) {
    throw new Error('VITE_USERS_UPDATE_PATH debe iniciar con /, por ejemplo /users')
  }

  if (!userId) {
    throw new Error('No se encontró un identificador de usuario válido para actualizar.')
  }

  const token = ENV_API_TOKEN || getStoredToken()

  const headers = {
    Accept: 'application/json',
    'Content-Type': 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const backendRole = mapRoleToBackendCode(role)
  const cedulaAsString = String(cedula ?? '').trim()
  const emailAsString = String(email ?? '').trim()
  const cedulaAsNumber = Number(cedula)
  const telefonoAsNumber = Number(telefono)

  if (!Number.isFinite(cedulaAsNumber)) {
    throw new Error('La cédula debe ser numérica para actualizar el usuario.')
  }

  if (!Number.isFinite(telefonoAsNumber)) {
    throw new Error('El teléfono debe ser numérico para actualizar el usuario.')
  }

  if (typeof backendRole !== 'number' || !Number.isFinite(backendRole)) {
    throw new Error('El rol debe ser numérico para actualizar el usuario.')
  }

  const updateQueryParams = new URLSearchParams()

  if (cedulaAsString) {
    updateQueryParams.set('cedula', cedulaAsString)
  }

  if (emailAsString) {
    updateQueryParams.set('email', emailAsString)
  }

  const endpointBase = `${API_BASE_URL}${USERS_UPDATE_PATH}`
  const endpoint = updateQueryParams.toString() ? `${endpointBase}?${updateQueryParams.toString()}` : endpointBase
  const method = 'PUT'
  let response = null
  let lastResponseBody = null

  for (const buildPayload of UPDATE_USER_PAYLOAD_BUILDERS) {
    try {
      response = await fetch(endpoint, {
        method,
        headers,
        body: JSON.stringify(
          buildPayload({
            nombres,
            apellidos,
            cedula: cedulaAsNumber,
            telefono: telefonoAsNumber,
            email: emailAsString,
            role: backendRole,
          }),
        ),
      })
    } catch {
      throw new Error(
        'No se pudo conectar con la API. Verifica que el backend este encendido y reinicia npm run dev.',
      )
    }

    if (response.ok) {
      break
    }

    // Errores de autenticación/autorización: no tiene sentido reintentar
    if (response.status === 401 || response.status === 403) {
      break
    }

    lastResponseBody = await parseResponseBody(response)
  }

  if (!response) {
    throw new Error('No fue posible enviar la solicitud de actualización de usuario.')
  }

  const responseData = response.ok ? await parseResponseBody(response) : lastResponseBody

  if (!response.ok) {
    const detail =
      typeof lastResponseBody === 'string'
        ? lastResponseBody
        : lastResponseBody
          ? JSON.stringify(lastResponseBody)
          : ''

    if (response.status === 400) {
      throw new Error(
        `El servidor rechazó la solicitud (400).${detail ? ` Detalle: ${detail}` : ' Verifica los campos del usuario.'}`,
      )
    }

    if (response.status === 401) {
      throw new Error(
        'No autorizado (401). Configura VITE_API_TOKEN en .env o inicia sesión nuevamente.',
      )
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para actualizar usuarios con este rol/token.')
    }

    if (response.status === 404) {
      throw new Error(
        `No se encontró el endpoint para actualizar usuario (404). URL intentada: ${endpoint}. Revisa VITE_USERS_UPDATE_PATH en .env.`,
      )
    }

    if (response.status === 405) {
      throw new Error(
        `El servidor rechazó PUT con 405 en ${endpoint}. Revisa cuál ruta espera tu backend para PUT.`,
      )
    }

    if (response.status === 409) {
      throw new Error('Ya existe un usuario con el correo o cédula proporcionados.')
    }

    throw new Error(`Error ${response.status} al actualizar el usuario.${detail ? ` Detalle: ${detail}` : ''}`)
  }

  return responseData
}

export const deleteUser = async ({ userId, cedula, email }) => {
  if (!API_BASE_URL) {
    throw new Error('Falta configurar VITE_API_BASE_URL en el archivo .env')
  }

  if (!USERS_DELETE_PATH.startsWith('/')) {
    throw new Error('VITE_USERS_DELETE_PATH debe iniciar con /, por ejemplo /users')
  }

  const hasUserId = Boolean(userId)
  const cedulaStr = String(cedula ?? '').trim()
  const emailStr = String(email ?? '').trim()

  if (!hasUserId && !cedulaStr && !emailStr) {
    throw new Error('No se encontró un identificador de usuario válido para eliminar.')
  }

  const token = ENV_API_TOKEN || getStoredToken()

  const headers = {
    Accept: 'application/json',
  }

  if (token) {
    headers.Authorization = `Bearer ${token}`
  }

  const base = `${API_BASE_URL}${USERS_DELETE_PATH}`

  const urlsToTry = []

  if (hasUserId) {
    urlsToTry.push(`${base}/${encodeURIComponent(String(userId))}`)
  }

  if (cedulaStr || emailStr) {
    const params = new URLSearchParams()
    if (cedulaStr) params.set('cedula', cedulaStr)
    if (emailStr) params.set('email', emailStr)
    urlsToTry.push(`${base}?${params.toString()}`)
  }

  if (cedulaStr) {
    urlsToTry.push(`${base}?cedula=${encodeURIComponent(cedulaStr)}`)
  }

  if (emailStr) {
    urlsToTry.push(`${base}?email=${encodeURIComponent(emailStr)}`)
  }

  if (hasUserId) {
    urlsToTry.push(`${base}?userId=${encodeURIComponent(String(userId))}`)
  }

  // Eliminar duplicados manteniendo el orden
  const uniqueUrls = [...new Set(urlsToTry)]

  let response = null
  let lastUrl = uniqueUrls[0]

  for (const url of uniqueUrls) {
    lastUrl = url
    try {
      response = await fetch(url, { method: 'DELETE', headers })
    } catch {
      throw new Error(
        'No se pudo conectar con la API. Verifica que el backend este encendido y reinicia npm run dev.',
      )
    }

    if (response.ok || (response.status !== 404 && response.status !== 405)) {
      break
    }
  }

  if (!response) {
    throw new Error('No fue posible enviar la solicitud de eliminación de usuario.')
  }

  const responseData = await parseResponseBody(response)

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error(
        'No autorizado (401). Configura VITE_API_TOKEN en .env o inicia sesión nuevamente.',
      )
    }

    if (response.status === 403) {
      throw new Error('No tienes permisos para eliminar usuarios con este rol/token.')
    }

    if (response.status === 404) {
      throw new Error(
        `No se encontró el endpoint para eliminar usuario (404). Última URL intentada: ${lastUrl}. Revisa VITE_USERS_DELETE_PATH en .env.`,
      )
    }

    throw new Error(`Error ${response.status} al eliminar el usuario.`)
  }

  return responseData
}

export const loginUser = async ({ email, password }) => {
  if (!API_BASE_URL) {
    throw new Error('Falta configurar VITE_API_BASE_URL en el archivo .env')
  }

  if (!AUTH_LOGIN_PATH.startsWith('/')) {
    throw new Error('VITE_AUTH_LOGIN_PATH debe iniciar con /, por ejemplo /auth/login')
  }

  let response = null

  for (const buildPayload of LOGIN_PAYLOAD_BUILDERS) {
    try {
      response = await fetch(`${API_BASE_URL}${AUTH_LOGIN_PATH}`, {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(buildPayload({ email, password })),
      })
    } catch {
      throw new Error(
        'No se pudo conectar con la API. Verifica que el backend este encendido y reinicia npm run dev.',
      )
    }

    if (response.ok || response.status === 401 || response.status === 404) {
      break
    }
  }

  if (!response) {
    throw new Error('No fue posible enviar la solicitud de inicio de sesión.')
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Credenciales invalidas. Verifica correo y contraseña.')
    }

    if (response.status === 404) {
      throw new Error('No se encontro el endpoint de login. Revisa VITE_AUTH_LOGIN_PATH en .env.')
    }

    throw new Error(`Error ${response.status} al iniciar sesión.`)
  }

  const rawResponse = await response.text()
  let responseData = null

  try {
    responseData = JSON.parse(rawResponse)
  } catch {
    responseData = rawResponse
  }

  const token =
    typeof responseData === 'string' && responseData.trim()
      ? responseData.trim()
      : extractTokenFromResponse(responseData)

  if (!token) {
    throw new Error('La respuesta de login no incluyo un token valido.')
  }

  localStorage.setItem(TOKEN_STORAGE_KEYS[0], token)
  return token
}
