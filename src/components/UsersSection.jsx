function UsersSection({ users, isLoadingUsers, usersError }) {
  let content = null

  if (isLoadingUsers) {
    content = <p className="text-body-secondary mb-0">Cargando usuarios...</p>
  } else if (usersError) {
    content = <p className="text-danger mb-0">{usersError}</p>
  } else if (users.length === 0) {
    content = <p className="text-body-secondary mb-0">No hay usuarios para mostrar.</p>
  } else {
    content = (
      <div className="list-group list-group-flush border rounded-3 overflow-hidden">
        {users.map((user) => (
          <article key={user.id ?? user.userId ?? user.email} className="list-group-item py-3 px-3">
            <p className="fw-semibold mb-1 d-flex align-items-center list-title-strong">
              <i className="bi bi-person-circle me-2 list-icon" aria-hidden="true" />
              {user.name ?? user.username ?? 'Sin nombre'}
            </p>
            <p className="text-body-secondary mb-0">{user.email ?? 'Sin email'}</p>
          </article>
        ))}
      </div>
    )
  }

  return (
    <section className="card shadow-sm border-0 main-content-card">
      <div className="card-body p-4">
        <h2 className="h4 mb-3">Usuarios</h2>
        {content}
      </div>
    </section>
  )
}

export default UsersSection
