import './App.css'
import { useEffect, useMemo, useState } from 'react'
import DashboardSummary from './components/DashboardSummary'
import SidebarNav from './components/SidebarNav'
import TasksSection from './components/TasksSection'
import LoginCredentialsForm from './components/LoginCredentialsForm'
import UserMenu from './components/UserMenu'
import UsersSection from './components/UsersSection'
import { useDashboardData } from './hooks/useDashboardData'
import { createUser, deleteUser, loginUser, updateUser } from './api/client'
import ChangePasswordSection from './components/ChangePasswordSection'
import brandLogo from './assets/brand-logo-corporate.svg'

const tokenStorageKeys = ['token', 'jwt', 'access_token', 'authToken']
const activeSectionStorageKey = 'dashboard_active_section'

const clearStoredTokens = () => {
  tokenStorageKeys.forEach((key) => localStorage.removeItem(key))
}

const getStoredToken = () => {
  for (const key of tokenStorageKeys) {
    const value = localStorage.getItem(key)
    if (value?.trim()) {
      return value.trim()
    }
  }

  return ''
}

const parseJwtPayload = (token) => {
  if (!token || !token.includes('.')) {
    return null
  }

  try {
    const payloadBase64 = token.split('.')[1]
    const normalized = payloadBase64.replace(/-/g, '+').replace(/_/g, '/')
    const decodedPayload = atob(normalized)

    return JSON.parse(decodedPayload)
  } catch {
    return null
  }
}

const isJwtExpired = (payload) => {
  if (!payload || typeof payload !== 'object' || typeof payload.exp !== 'number') {
    return false
  }

  return payload.exp * 1000 <= Date.now()
}

const getValidSessionToken = () => {
  const envToken = (import.meta.env.VITE_API_TOKEN ?? '').trim()

  if (envToken) {
    return envToken
  }

  const storedToken = getStoredToken()

  if (!storedToken) {
    return ''
  }

  const payload = parseJwtPayload(storedToken)

  if (!payload || isJwtExpired(payload) || !getUserFromJwt(payload)) {
    clearStoredTokens()
    return ''
  }

  return storedToken
}

const getUserFromJwt = (payload) => {
  if (!payload) {
    return null
  }

  const nameCandidates = [
    payload.name,
    payload.username,
    payload.preferred_username,
    payload.unique_name,
    payload.email,
    payload.sub,
  ]

  const roleCandidates = [
    payload.role,
    payload.roles?.[0],
    payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'],
  ]

  const name = nameCandidates.find((value) => typeof value === 'string' && value.trim())?.trim()
  const role = roleCandidates.find((value) => typeof value === 'string' && value.trim())?.trim()

  if (!name) {
    return null
  }

  return { name, role: role || 'Usuario' }
}

function App() {
  const [activeSection, setActiveSection] = useState(
    () => localStorage.getItem(activeSectionStorageKey)?.trim() || 'inicio',
  )
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [sessionToken, setSessionToken] = useState(() => getValidSessionToken())
  const [loginError, setLoginError] = useState('')
  const [isSubmittingLogin, setIsSubmittingLogin] = useState(false)
  const currentYear = new Date().getFullYear()

  const isAuthenticated = Boolean(sessionToken)

  const {
    users,
    tasks,
    isLoadingUsers,
    isLoadingTasks,
    usersError,
    tasksError,
    completedTasksCount,
    reloadUsers,
  } = useDashboardData({ enabled: isAuthenticated })

  const currentUser = useMemo(() => {
    if (!sessionToken) {
      return { name: '', role: 'Sin sesión' }
    }

    const payload = parseJwtPayload(sessionToken)

    if (!payload || isJwtExpired(payload)) {
      return { name: '', role: 'Sin sesión' }
    }

    const userFromJwt = getUserFromJwt(payload)

    if (userFromJwt) {
      return userFromJwt
    }

    return { name: '', role: 'Sin sesión' }
  }, [sessionToken])

  const normalizedRole = String(currentUser.role ?? '').trim().toLowerCase()
  const canAccessUsersManagement = normalizedRole === 'root' || normalizedRole === 'admin'

  useEffect(() => {
    if (!sessionToken) {
      return
    }

    const payload = parseJwtPayload(sessionToken)

    if (!payload || isJwtExpired(payload) || !getUserFromJwt(payload)) {
      clearStoredTokens()
      setSessionToken((import.meta.env.VITE_API_TOKEN ?? '').trim())
      setLoginError('La sesión guardada no es válida. Inicia sesión nuevamente.')
    }
  }, [sessionToken])

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isMobileMenuOpen)

    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isMobileMenuOpen])

  useEffect(() => {
    localStorage.setItem(activeSectionStorageKey, activeSection)
  }, [activeSection])

  const menuItems = useMemo(() => {
    const items = [
      { key: 'inicio', label: 'Inicio', icon: 'bi-house-door' },
      {
        key: 'usuarios',
        label: 'Usuarios',
        icon: 'bi-people',
        children: [
          { key: 'usuarios-listar', label: 'Listar usuarios', icon: 'bi-list-ul' },
          { key: 'usuarios-crear', label: 'Crear usuario', icon: 'bi-person-plus' },
          { key: 'usuarios-editar', label: 'Editar usuario', icon: 'bi-pencil-square' },
          { key: 'usuarios-buscar', label: 'Buscar usuario', icon: 'bi-search' },
          { key: 'usuarios-password', label: 'Cambiar contraseña de un usuario', icon: 'bi-key' },
          { key: 'usuarios-borrar', label: 'Borrar usuario', icon: 'bi-trash' },
        ],
      },
      {
        key: 'tareas',
        label: 'Tareas',
        icon: 'bi-list-check',
        children: [
          { key: 'tareas-listar', label: 'Listar todas las tareas', icon: 'bi-list-ul' },
          { key: 'tareas-mias', label: 'Listar mis tareas', icon: 'bi-person-check' },
          { key: 'tareas-crear', label: 'Crear tarea', icon: 'bi-plus-square' },
          { key: 'tareas-editar', label: 'Editar tarea', icon: 'bi-pencil-square' },
          { key: 'tareas-buscar', label: 'Buscar tarea', icon: 'bi-search' },
          { key: 'tareas-eliminar', label: 'Eliminar tareas', icon: 'bi-trash' },
        ],
      },
    ]

    if (!canAccessUsersManagement) {
      return items.filter((item) => item.key !== 'usuarios')
    }

    return items
  }, [canAccessUsersManagement])

  useEffect(() => {
    if (!canAccessUsersManagement && activeSection.startsWith('usuarios-')) {
      setActiveSection('inicio')
    }
  }, [activeSection, canAccessUsersManagement])

  const sectionTitles = {
    inicio: 'Panel principal',
    'cambiar-contrasena': 'Cambiar contraseña',
    'usuarios-listar': 'Usuarios · Listar',
    'usuarios-crear': 'Usuarios · Crear',
    'usuarios-editar': 'Usuarios · Editar',
    'usuarios-buscar': 'Usuarios · Buscar',
    'usuarios-password': 'Usuarios · Cambiar contraseña',
    'usuarios-borrar': 'Usuarios · Borrar',
    'tareas-listar': 'Tareas · Listar todas',
    'tareas-mias': 'Tareas · Mis tareas',
    'tareas-crear': 'Tareas · Crear',
    'tareas-editar': 'Tareas · Editar',
    'tareas-buscar': 'Tareas · Buscar',
    'tareas-eliminar': 'Tareas · Eliminar tareas',
  }

  const sectionContent = {
    'cambiar-contrasena': <ChangePasswordSection onChangePassword={handleChangePassword} />,
    inicio: (
      <DashboardSummary
        usersCount={users.length}
        tasksCount={tasks.length}
        completedTasksCount={completedTasksCount}
      />
    ),
    'usuarios-listar': (
      <UsersSection users={users} isLoadingUsers={isLoadingUsers} usersError={usersError} mode="list" />
    ),
    'usuarios-crear': (
      <UsersSection
        users={users}
        isLoadingUsers={isLoadingUsers}
        usersError={usersError}
        mode="create"
        onCreateUser={handleCreateUser}
      />
    ),
    'usuarios-editar': (
      <UsersSection
        users={users}
        isLoadingUsers={isLoadingUsers}
        usersError={usersError}
        mode="edit"
        onUpdateUser={handleUpdateUser}
      />
    ),
    'usuarios-buscar': (
      <UsersSection users={users} isLoadingUsers={isLoadingUsers} usersError={usersError} mode="search" />
    ),
    'usuarios-password': (
      <UsersSection
        users={users}
        isLoadingUsers={isLoadingUsers}
        usersError={usersError}
        mode="change-password"
        onChangeUserPassword={handleChangeUserPassword}
      />
    ),
    'usuarios-borrar': (
      <UsersSection
        users={users}
        isLoadingUsers={isLoadingUsers}
        usersError={usersError}
        mode="delete"
        onDeleteUser={handleDeleteUser}
      />
    ),
    'tareas-listar': (
      <TasksSection tasks={tasks} isLoadingTasks={isLoadingTasks} tasksError={tasksError} />
    ),
    'tareas-mias': (
      <TasksSection tasks={tasks} isLoadingTasks={isLoadingTasks} tasksError={tasksError} />
    ),
    'tareas-crear': (
      <TasksSection tasks={tasks} isLoadingTasks={isLoadingTasks} tasksError={tasksError} />
    ),
    'tareas-editar': (
      <TasksSection tasks={tasks} isLoadingTasks={isLoadingTasks} tasksError={tasksError} />
    ),
    'tareas-buscar': (
      <TasksSection tasks={tasks} isLoadingTasks={isLoadingTasks} tasksError={tasksError} />
    ),
    'tareas-eliminar': (
      <TasksSection tasks={tasks} isLoadingTasks={isLoadingTasks} tasksError={tasksError} />
    ),
  }

  const handleSectionChange = (section) => {
    if (!canAccessUsersManagement && section.startsWith('usuarios-')) {
      setActiveSection('inicio')
      setIsMobileMenuOpen(false)
      return
    }

    setActiveSection(section)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    clearStoredTokens()
    localStorage.removeItem(activeSectionStorageKey)
    setSessionToken((import.meta.env.VITE_API_TOKEN ?? '').trim())
    setActiveSection('inicio')
    setLoginError('')
  }

  const handleLogin = async ({ email, password }) => {
    setLoginError('')

    if (!email || !password) {
      setLoginError('Debes ingresar correo y contraseña.')
      return
    }

    setIsSubmittingLogin(true)

    try {
      const nextToken = await loginUser({ email, password })
      setSessionToken(nextToken)
    } catch (error) {
      setLoginError(error.message)
    } finally {
      setIsSubmittingLogin(false)
    }
  }

  async function handleCreateUser({ nombres, apellidos, cedula, telefono, email, password, role }) {
    await createUser({ nombres, apellidos, cedula, telefono, email, password, role })
    await reloadUsers()
  }

  async function handleUpdateUser({ userId, nombres, apellidos, cedula, telefono, email, role }) {
    await updateUser({ userId, nombres, apellidos, cedula, telefono, email, role })
    await reloadUsers()
  }

  async function handleDeleteUser({ userId, cedula, email }) {
    await deleteUser({ userId, cedula, email })
    await reloadUsers()
  }

  async function handleChangeUserPassword({ userId, cedula, email, newPassword }) {
    const changePasswordPath = (import.meta.env.VITE_ADMIN_CHANGE_USER_PASSWORD_PATH ?? '').trim()

    if (!changePasswordPath) {
      throw new Error(
        'El endpoint para cambiar la contraseña de un usuario no está configurado. Agrega VITE_ADMIN_CHANGE_USER_PASSWORD_PATH en .env.',
      )
    }

    const token = (import.meta.env.VITE_API_TOKEN ?? '').trim() || sessionToken
    const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')
    const cedulaValue = String(cedula ?? '').trim()
    const emailValue = String(email ?? '').trim()
    const params = new URLSearchParams()
    if (cedulaValue) params.set('cedula', cedulaValue)
    if (emailValue) params.set('email', emailValue)
    const qs = params.toString() ? `?${params.toString()}` : ''

    const response = await fetch(`${apiBase}${changePasswordPath}${qs}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        cedula: cedulaValue || undefined,
        email: emailValue || undefined,
        newPassword,
      }),
    })

    if (!response.ok) {
      const raw = await response.text()
      let detail = raw
      try { detail = JSON.stringify(JSON.parse(raw)) } catch { /* usa texto plano */ }
      throw new Error(
        `Error ${response.status} al cambiar la contraseña del usuario.${detail ? ` Detalle: ${detail}` : ''}`,
      )
    }
  }

  async function handleChangePassword({ currentPassword, newPassword }) {
    // Integra aquí la llamada al endpoint de cambio de contraseña cuando el backend lo exponga.
    // Por ahora lanza un error descriptivo si no hay endpoint configurado.
    const changePasswordPath = (import.meta.env.VITE_CHANGE_PASSWORD_PATH ?? '').trim()

    if (!changePasswordPath) {
      throw new Error(
        'El endpoint para cambiar la contraseña no está configurado. Agrega VITE_CHANGE_PASSWORD_PATH en .env.',
      )
    }

    const token = (import.meta.env.VITE_API_TOKEN ?? '').trim() || sessionToken
    const apiBase = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '')

    const response = await fetch(`${apiBase}${changePasswordPath}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    })

    if (!response.ok) {
      const raw = await response.text()
      let detail = raw
      try {
        detail = JSON.stringify(JSON.parse(raw))
      } catch { /* usa el texto plano */ }
      throw new Error(
        `Error ${response.status} al cambiar la contraseña.${detail ? ` Detalle: ${detail}` : ''}`,
      )
    }
  }

  const renderBrand = (compact = false) => {
    return (
      <div className={`brand-block ${compact ? 'brand-block-compact' : ''}`}>
        <img src={brandLogo} alt="Logo Gestor" className="brand-logo" />
        <div>
          <p className="brand-title mb-0">Gestor</p>
          {!compact && <p className="brand-subtitle mb-0">Usuarios y tareas</p>}
        </div>
      </div>
    )
  }

  const renderSidebarInstitutionalInfo = () => {
    return (
      <section className="sidebar-footer-info" aria-label="Información institucional">
        <p className="sidebar-footer-title mb-2">Información institucional</p>

        <div className="sidebar-footer-logos mb-2">
          <div className="sidebar-footer-logo-slot" aria-label="Espacio para logo de la universidad">
            <img
              src="/logo-usco.png"
              alt="Logo Universidad Surcolombiana"
              className="sidebar-footer-logo-image"
            />
          </div>
          <div className="sidebar-footer-logo-slot" aria-label="Espacio para logo del grupo">
            <img src="/logo-grupo.ico" alt="Logo grupo GETI" className="sidebar-footer-logo-image" />
          </div>
        </div>

        <p className="sidebar-footer-text mb-1">
          Grupo de Electrónica, Telecomunicaciones e Informática - GETI
        </p>
        <p className="sidebar-footer-text mb-1">Universidad Surcolombiana</p>
        <p className="sidebar-footer-meta mb-1">Creado por: Albeiro Cortés Cabezas</p>
        <p className="sidebar-footer-meta mb-0">© {currentYear}</p>
      </section>
    )
  }

  if (!isAuthenticated) {
    return (
      <div className="auth-page">
        <div className="auth-page-brand-panel">
          <div className="auth-page-brand-inner">
            <div className="auth-page-brand-top">
              <img src={brandLogo} alt="Logo Gestor" className="auth-page-logo" />
              <p className="auth-page-app-name mb-0">Gestor</p>
            </div>

            <div>
              <h1 className="auth-page-headline">Gestión de usuarios y tareas</h1>
              <p className="auth-page-lead mb-0">
                Plataforma centralizada para administrar usuarios, roles y tareas del equipo de trabajo.
              </p>
            </div>

            <ul className="auth-page-features" aria-label="Características de la aplicación">
              <li className="auth-page-feature-item">
                <i className="bi bi-people-fill auth-page-feature-icon" aria-hidden="true" />
                <span>Administración de usuarios y roles</span>
              </li>
              <li className="auth-page-feature-item">
                <i className="bi bi-list-check auth-page-feature-icon" aria-hidden="true" />
                <span>Gestión y seguimiento de tareas</span>
              </li>
              <li className="auth-page-feature-item">
                <i className="bi bi-shield-lock-fill auth-page-feature-icon" aria-hidden="true" />
                <span>Autenticación segura con JWT</span>
              </li>
            </ul>

            <div className="auth-page-inst">
              <div className="auth-page-inst-logos">
                <div className="auth-page-inst-logo-slot">
                  <img src="/logo-usco.png" alt="Logo Universidad Surcolombiana" className="auth-page-inst-logo-img" />
                </div>
                <div className="auth-page-inst-logo-slot">
                  <img src="/logo-grupo.ico" alt="Logo grupo GETI" className="auth-page-inst-logo-img" />
                </div>
              </div>
              <p className="auth-page-inst-name mb-1">Grupo GETI · Universidad Surcolombiana</p>
              <p className="auth-page-inst-meta mb-0">Creado por: Albeiro Cortés Cabezas · © {currentYear}</p>
            </div>
          </div>
        </div>

        <div className="auth-page-form-panel">
          <article className="auth-card">
            <div className="auth-card-header">
              <p className="auth-kicker mb-2">Bienvenido</p>
              <h2 className="h3 mb-1 auth-title">Iniciar sesión</h2>
              <p className="auth-subtitle mb-0">Ingresa tus credenciales para acceder al sistema.</p>
            </div>

            <LoginCredentialsForm
              onSubmit={handleLogin}
              isSubmitting={isSubmittingLogin}
              errorMessage={loginError}
            />
          </article>
        </div>
      </div>
    )
  }

  return (
    <>
      <header className="d-flex d-md-none align-items-center justify-content-between px-3 py-2 border-bottom bg-light">
        {renderBrand(true)}
        <button
          type="button"
          className="btn btn-outline-secondary btn-sm"
          onClick={() => setIsMobileMenuOpen(true)}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobileMenu"
          aria-label="Abrir menú"
        >
          <i className="bi bi-list" aria-hidden="true" />
        </button>
      </header>

      <div
        className={`offcanvas offcanvas-start d-md-none ${isMobileMenuOpen ? 'show' : ''}`}
        tabIndex="-1"
        id="mobileMenu"
        aria-modal={isMobileMenuOpen ? 'true' : undefined}
        role="dialog"
        style={{ visibility: isMobileMenuOpen ? 'visible' : 'hidden' }}
      >
        <div className="offcanvas-header border-bottom">
          <h2 className="offcanvas-title h5 mb-0">Menú</h2>
          <button
            type="button"
            className="btn-close"
            aria-label="Cerrar"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
        <div className="offcanvas-body d-flex flex-column gap-3">
          <SidebarNav
            menuItems={menuItems}
            activeSection={activeSection}
            onSelect={handleSectionChange}
          />
          {renderSidebarInstitutionalInfo()}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div
          className="offcanvas-backdrop fade show d-md-none"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className="container-fluid px-0">
        <div className="row g-0 app-layout">
          <aside className="d-none d-md-flex flex-column col-md-3 col-lg-2 sidebar p-3 p-lg-4">
            <div className="mb-4">{renderBrand()}</div>

            <SidebarNav
              menuItems={menuItems}
              activeSection={activeSection}
              onSelect={handleSectionChange}
            />

            {renderSidebarInstitutionalInfo()}
          </aside>

          <main className="col-12 col-md-9 col-lg-10 p-3 p-lg-4">
            <nav className="top-nav-bar navbar mb-3 mb-lg-4" aria-label="Barra superior">
              <div className="container-fluid px-3 px-lg-4 top-nav-content">
                <h1 className="h4 mb-0 page-title">{sectionTitles[activeSection]}</h1>
                <UserMenu
                  userName={currentUser.name}
                  userRole={currentUser.role}
                  onLogout={handleLogout}
                  onChangePassword={() => handleSectionChange('cambiar-contrasena')}
                />
              </div>
            </nav>
            {sectionContent[activeSection] ?? sectionContent.inicio}
          </main>
        </div>
      </div>
    </>
  )
}

export default App
