import './App.css'
import { useEffect, useState } from 'react'
import DashboardSummary from './components/DashboardSummary'
import SidebarNav from './components/SidebarNav'
import TasksSection from './components/TasksSection'
import UserMenu from './components/UserMenu'
import UsersSection from './components/UsersSection'
import { useDashboardData } from './hooks/useDashboardData'
import brandLogo from './assets/brand-logo-corporate.svg'

function App() {
  const [activeSection, setActiveSection] = useState('inicio')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const currentYear = new Date().getFullYear()

  const {
    users,
    tasks,
    isLoadingUsers,
    isLoadingTasks,
    usersError,
    tasksError,
    completedTasksCount,
  } = useDashboardData()

  useEffect(() => {
    document.body.classList.toggle('overflow-hidden', isMobileMenuOpen)

    return () => {
      document.body.classList.remove('overflow-hidden')
    }
  }, [isMobileMenuOpen])

  const menuItems = [
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

  const sectionTitles = {
    inicio: 'Panel principal',
    'usuarios-listar': 'Usuarios · Listar',
    'usuarios-crear': 'Usuarios · Crear',
    'usuarios-editar': 'Usuarios · Editar',
    'usuarios-buscar': 'Usuarios · Buscar',
    'usuarios-borrar': 'Usuarios · Borrar',
    'tareas-listar': 'Tareas · Listar todas',
    'tareas-mias': 'Tareas · Mis tareas',
    'tareas-crear': 'Tareas · Crear',
    'tareas-editar': 'Tareas · Editar',
    'tareas-buscar': 'Tareas · Buscar',
    'tareas-eliminar': 'Tareas · Eliminar tareas',
  }

  const sectionContent = {
    inicio: (
      <DashboardSummary
        usersCount={users.length}
        tasksCount={tasks.length}
        completedTasksCount={completedTasksCount}
      />
    ),
    'usuarios-listar': (
      <UsersSection users={users} isLoadingUsers={isLoadingUsers} usersError={usersError} />
    ),
    'usuarios-crear': (
      <UsersSection users={users} isLoadingUsers={isLoadingUsers} usersError={usersError} />
    ),
    'usuarios-editar': (
      <UsersSection users={users} isLoadingUsers={isLoadingUsers} usersError={usersError} />
    ),
    'usuarios-buscar': (
      <UsersSection users={users} isLoadingUsers={isLoadingUsers} usersError={usersError} />
    ),
    'usuarios-borrar': (
      <UsersSection users={users} isLoadingUsers={isLoadingUsers} usersError={usersError} />
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
    setActiveSection(section)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = () => {
    alert('Sesión cerrada')
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
                  userName="María González"
                  userRole="Administrador"
                  onLogout={handleLogout}
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
