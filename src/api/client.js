const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

const request = async (path) => {
  if (!API_BASE_URL) {
    throw new Error('Falta configurar VITE_API_BASE_URL en el archivo .env')
  }

  const response = await fetch(`${API_BASE_URL}${path}`)

  if (!response.ok) {
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
