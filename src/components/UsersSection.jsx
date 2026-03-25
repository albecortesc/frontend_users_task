import { useMemo, useState } from 'react'

function UsersSection({ users, isLoadingUsers, usersError, mode = 'list', onCreateUser, onUpdateUser, onDeleteUser, onChangeUserPassword }) {
  const roleLabelsByCode = {
    0: 'Root',
    1: 'Admin',
    2: 'User',
    3: 'Invited',
  }

  const [nombres, setNombres] = useState('')
  const [apellidos, setApellidos] = useState('')
  const [cedula, setCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('User')
  const [isSubmittingCreate, setIsSubmittingCreate] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')
  const [editLookup, setEditLookup] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [editNombres, setEditNombres] = useState('')
  const [editApellidos, setEditApellidos] = useState('')
  const [editCedula, setEditCedula] = useState('')
  const [editTelefono, setEditTelefono] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [editRole, setEditRole] = useState('User')
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false)
  const [editError, setEditError] = useState('')
  const [editSuccess, setEditSuccess] = useState('')
  const [deleteLookup, setDeleteLookup] = useState('')
  const [userToDelete, setUserToDelete] = useState(null)
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('')
  const [isSubmittingDelete, setIsSubmittingDelete] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [deleteSuccess, setDeleteSuccess] = useState('')

  const [cpLookup, setCpLookup] = useState('')
  const [cpUser, setCpUser] = useState(null)
  const [cpNewPassword, setCpNewPassword] = useState('')
  const [cpConfirmPassword, setCpConfirmPassword] = useState('')
  const [isSubmittingCp, setIsSubmittingCp] = useState(false)
  const [cpError, setCpError] = useState('')
  const [cpSuccess, setCpSuccess] = useState('')

  const [searchLookup, setSearchLookup] = useState('')
  const [searchResult, setSearchResult] = useState(null)
  const [searchError, setSearchError] = useState('')
  const [searchDone, setSearchDone] = useState(false)

  const isCreateMode = mode === 'create'
  const isListMode = mode === 'list'
  const isEditMode = mode === 'edit'
  const isDeleteMode = mode === 'delete'
  const isSearchMode = mode === 'search'
  const keepOnlyDigits = (value) => value.replace(/\D/g, '')
  const isChangePasswordMode = mode === 'change-password'

  const normalizedUsers = useMemo(() => {
    return users.map((user) => {
      const userId = user.id ?? user.userId ?? user._id ?? ''
      const userNombres = user.nombres ?? user.firstName ?? ''
      const userApellidos = user.apellidos ?? user.lastName ?? ''
      const userCedula = user.cedula ?? user.document ?? user.identificacion ?? ''
      const userTelefono = user.telefono ?? user.phone ?? user.celular ?? ''
      const userEmail = user.email ?? user.correo ?? ''
      const rawRole = user.role ?? user.rol ?? user.roleId ?? user.roleCode ?? 'User'
      const normalizedRoleCode =
        typeof rawRole === 'string' && rawRole.trim() !== '' ? Number(rawRole) : rawRole
      const userRole =
        roleLabelsByCode[normalizedRoleCode] ||
        (typeof rawRole === 'string' && rawRole.trim() ? rawRole.trim() : 'User')

      return {
        originalUser: user,
        userId,
        nombres: String(userNombres),
        apellidos: String(userApellidos),
        cedula: String(userCedula),
        telefono: String(userTelefono),
        email: String(userEmail),
        role: userRole,
      }
    })
  }, [users])

  const handleCreateSubmit = async (event) => {
    event.preventDefault()

    const nextNombres = nombres.trim()
    const nextApellidos = apellidos.trim()
    const nextCedula = cedula.trim()
    const nextTelefono = telefono.trim()
    const nextEmail = email.trim()
    const nextRole = role.trim()

    setCreateError('')
    setCreateSuccess('')

    if (!nextNombres || !nextApellidos || !nextCedula || !nextTelefono || !nextEmail || !password || !nextRole) {
      setCreateError('Completa todos los campos requeridos del formulario.')
      return
    }

    if (!onCreateUser) {
      setCreateError('No hay una acción configurada para crear usuarios.')
      return
    }

    setIsSubmittingCreate(true)

    try {
      await onCreateUser({
        nombres: nextNombres,
        apellidos: nextApellidos,
        cedula: nextCedula,
        telefono: nextTelefono,
        email: nextEmail,
        password,
        role: nextRole,
      })
      setNombres('')
      setApellidos('')
      setCedula('')
      setTelefono('')
      setEmail('')
      setPassword('')
      setRole('User')
      setCreateSuccess('Usuario creado correctamente.')
    } catch (error) {
      setCreateError(error?.message || 'No fue posible crear el usuario.')
    } finally {
      setIsSubmittingCreate(false)
    }
  }

  const handleFindUserToEdit = (event) => {
    event.preventDefault()

    const lookup = editLookup.trim().toLowerCase()

    setEditError('')
    setEditSuccess('')
    setSelectedUser(null)

    if (!lookup) {
      setEditError('Ingresa una cédula o correo para buscar el usuario.')
      return
    }

    const foundUser = normalizedUsers.find((user) => {
      const normalizedCedula = user.cedula.trim().toLowerCase()
      const normalizedEmail = user.email.trim().toLowerCase()
      return normalizedCedula === lookup || normalizedEmail === lookup
    })

    if (!foundUser) {
      setEditError('No se encontró un usuario con esa cédula o correo.')
      return
    }

    setSelectedUser(foundUser)
    setEditNombres(foundUser.nombres)
    setEditApellidos(foundUser.apellidos)
    setEditCedula(foundUser.cedula)
    setEditTelefono(foundUser.telefono)
    setEditEmail(foundUser.email)
    setEditRole(foundUser.role)
  }

  const handleEditSubmit = async (event) => {
    event.preventDefault()

    const nextNombres = editNombres.trim()
    const nextApellidos = editApellidos.trim()
    const nextCedula = editCedula.trim()
    const nextTelefono = editTelefono.trim()
    const nextEmail = editEmail.trim()
    const nextRole = editRole.trim()

    setEditError('')
    setEditSuccess('')

    if (!selectedUser?.userId) {
      setEditError('Selecciona primero un usuario para editar.')
      return
    }

    if (!nextNombres || !nextApellidos || !nextCedula || !nextTelefono || !nextEmail || !nextRole) {
      setEditError('Completa todos los campos requeridos para actualizar el usuario.')
      return
    }

    if (!onUpdateUser) {
      setEditError('No hay una acción configurada para actualizar usuarios.')
      return
    }

    setIsSubmittingEdit(true)

    try {
      await onUpdateUser({
        userId: selectedUser.userId,
        nombres: nextNombres,
        apellidos: nextApellidos,
        cedula: nextCedula,
        telefono: nextTelefono,
        email: nextEmail,
        role: nextRole,
      })

      setSelectedUser((prevUser) => {
        if (!prevUser) {
          return prevUser
        }

        return {
          ...prevUser,
          nombres: nextNombres,
          apellidos: nextApellidos,
          cedula: nextCedula,
          telefono: nextTelefono,
          email: nextEmail,
          role: nextRole,
        }
      })

      setEditSuccess('Usuario actualizado correctamente.')
    } catch (error) {
      setEditError(error?.message || 'No fue posible actualizar el usuario.')
    } finally {
      setIsSubmittingEdit(false)
    }
  }

  const handleSearchUser = (event) => {
    event.preventDefault()

    const lookup = searchLookup.trim().toLowerCase()

    setSearchError('')
    setSearchResult(null)
    setSearchDone(false)

    if (!lookup) {
      setSearchError('Ingresa una cédula o correo para buscar el usuario.')
      return
    }

    const foundUser = normalizedUsers.find((user) => {
      const normalizedCedula = user.cedula.trim().toLowerCase()
      const normalizedEmail = user.email.trim().toLowerCase()
      return normalizedCedula === lookup || normalizedEmail === lookup
    })

    setSearchDone(true)

    if (!foundUser) {
      setSearchError('No se encontró un usuario con esa cédula o correo.')
      return
    }

    setSearchResult(foundUser)
  }

  const handleFindUserToDelete = (event) => {

    event.preventDefault()

    const lookup = deleteLookup.trim().toLowerCase()

    setDeleteError('')
    setDeleteSuccess('')
    setUserToDelete(null)

    if (!lookup) {
      setDeleteError('Ingresa una cédula o correo para buscar el usuario a eliminar.')
      return
    }

    const foundUser = normalizedUsers.find((user) => {
      const normalizedCedula = user.cedula.trim().toLowerCase()
      const normalizedEmail = user.email.trim().toLowerCase()
      return normalizedCedula === lookup || normalizedEmail === lookup
    })

    if (!foundUser) {
      setDeleteError('No se encontró un usuario con esa cédula o correo.')
      return
    }

    setUserToDelete(foundUser)
    setDeleteConfirmationText('')
  }

  const handleDeleteSubmit = async (event) => {
    event.preventDefault()

    setDeleteError('')
    setDeleteSuccess('')

    if (!userToDelete?.userId) {
      setDeleteError('Selecciona primero un usuario válido para eliminar.')
      return
    }

    if (!onDeleteUser) {
      setDeleteError('No hay una acción configurada para eliminar usuarios.')
      return
    }

    if (deleteConfirmationText.trim() !== 'ELIMINAR') {
      setDeleteError('Para confirmar, escribe exactamente ELIMINAR.')
      return
    }

    setIsSubmittingDelete(true)

    try {
      await onDeleteUser({ userId: userToDelete.userId, cedula: userToDelete.cedula, email: userToDelete.email })
      setDeleteSuccess('Usuario eliminado correctamente.')
      setDeleteLookup('')
      setUserToDelete(null)
      setDeleteConfirmationText('')
    } catch (error) {
      setDeleteError(error?.message || 'No fue posible eliminar el usuario.')
    } finally {
      setIsSubmittingDelete(false)
    }
  }

  let content = null

  if (isLoadingUsers) {
    content = <p className="text-body-secondary mb-0">Cargando usuarios...</p>
  } else if (usersError) {
    content = <p className="text-danger mb-0">{usersError}</p>
  } else if (users.length === 0) {
    content = <p className="text-body-secondary mb-0">No hay usuarios para mostrar.</p>
  } else {
    content = (
      <div className="users-grid">
        {users.map((user) => {
          const fullName = `${user.nombres ?? ''} ${user.apellidos ?? ''}`.trim()
          const displayName = fullName || user.name || user.username || 'Sin nombre'
          const rawRole = user.role ?? user.rol ?? user.roleId ?? user.roleCode
          const normalizedRoleCode =
            typeof rawRole === 'string' && rawRole.trim() !== '' ? Number(rawRole) : rawRole
          const displayRole =
            user.roleName ||
            roleLabelsByCode[normalizedRoleCode] ||
            (typeof rawRole === 'string' && rawRole.trim() ? rawRole : 'Sin role')
          const nameInitial = displayName.charAt(0).toUpperCase()

          return (
            <article key={user.id ?? user.userId ?? user.email} className="users-card">
              <header className="users-card-header">
                <span className="users-avatar" aria-hidden="true">
                  {nameInitial || 'U'}
                </span>
                <div>
                  <p className="users-name mb-0">{displayName}</p>
                  <p className="users-subtitle mb-0">Usuario registrado</p>
                </div>
                <span className="users-role-chip">{displayRole}</span>
              </header>

              <div className="users-meta-row">
                <i className="bi bi-envelope users-meta-icon" aria-hidden="true" />
                <span className="users-meta-text">{user.email ?? 'Sin email'}</span>
              </div>

              <div className="users-meta-row">
                <i className="bi bi-person-badge users-meta-icon" aria-hidden="true" />
                <span className="users-meta-text">ID: {user.id ?? user.userId ?? 'N/D'}</span>
              </div>
            </article>
          )
        })}
      </div>
    )
  }

  return (
    <section className="card shadow-sm border-0 main-content-card">
      <div className="card-body p-4">
        {!isCreateMode && !isListMode && !isEditMode && !isSearchMode && !isChangePasswordMode && !isDeleteMode ? <h2 className="h4 mb-3">Usuarios</h2> : null}

        {isCreateMode ? (
          <form className="create-user-form mb-4" onSubmit={handleCreateSubmit}>
            <div className="create-user-head mb-3">
              <p className="create-user-kicker mb-1">Registro de usuario</p>
              <p className="create-user-subtitle mb-0">
                Completa la informacion para crear un nuevo usuario en el sistema.
              </p>
            </div>

            <div className="row g-3">
              <div className="col-12 col-md-6">
                <label className="form-label mb-1" htmlFor="create-user-nombres">
                  Nombres
                </label>
                <div className="create-user-control">
                  <i className="bi bi-person-badge create-user-control-icon" aria-hidden="true" />
                  <input
                    id="create-user-nombres"
                    type="text"
                    className="form-control create-user-input"
                    placeholder="Ej: Juan Carlos"
                    value={nombres}
                    onChange={(event) => setNombres(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label mb-1" htmlFor="create-user-apellidos">
                  Apellidos
                </label>
                <div className="create-user-control">
                  <i className="bi bi-person-vcard create-user-control-icon" aria-hidden="true" />
                  <input
                    id="create-user-apellidos"
                    type="text"
                    className="form-control create-user-input"
                    placeholder="Ej: Perez Gomez"
                    value={apellidos}
                    onChange={(event) => setApellidos(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label mb-1" htmlFor="create-user-cedula">
                  Cedula
                </label>
                <div className="create-user-control">
                  <i className="bi bi-credit-card create-user-control-icon" aria-hidden="true" />
                  <input
                    id="create-user-cedula"
                    type="text"
                    className="form-control create-user-input"
                    placeholder="Numero de documento"
                    value={cedula}
                    onChange={(event) => setCedula(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label mb-1" htmlFor="create-user-telefono">
                  Telefono
                </label>
                <div className="create-user-control">
                  <i className="bi bi-telephone create-user-control-icon" aria-hidden="true" />
                  <input
                    id="create-user-telefono"
                    type="tel"
                    className="form-control create-user-input"
                    placeholder="Ej: 3001234567"
                    value={telefono}
                    onChange={(event) => setTelefono(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label mb-1" htmlFor="create-user-email">
                  Correo
                </label>
                <div className="create-user-control">
                  <i className="bi bi-envelope create-user-control-icon" aria-hidden="true" />
                  <input
                    id="create-user-email"
                    type="email"
                    className="form-control create-user-input"
                    placeholder="correo@ejemplo.com"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label mb-1" htmlFor="create-user-password">
                  Contraseña
                </label>
                <div className="create-user-control">
                  <i className="bi bi-shield-lock create-user-control-icon" aria-hidden="true" />
                  <input
                    id="create-user-password"
                    type="password"
                    className="form-control create-user-input"
                    placeholder="Minimo 6 caracteres"
                    autoComplete="new-password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    minLength={6}
                  />
                </div>
              </div>

              <div className="col-12 col-md-6">
                <label className="form-label mb-1" htmlFor="create-user-role">
                  Role
                </label>
                <div className="create-user-control">
                  <i className="bi bi-person-gear create-user-control-icon" aria-hidden="true" />
                  <select
                    id="create-user-role"
                    className="form-select create-user-input"
                    value={role}
                    onChange={(event) => setRole(event.target.value)}
                    required
                  >
                    <option value="Root">Root</option>
                    <option value="Admin">Admin</option>
                    <option value="User">User</option>
                    <option value="Invited">Invited</option>
                  </select>
                </div>
              </div>

              <div className="col-12 col-md-6 d-flex align-items-end">
                <button
                  type="submit"
                  className="btn create-user-submit w-100"
                  disabled={isSubmittingCreate}
                >
                  <i
                    className={`bi ${isSubmittingCreate ? 'bi-hourglass-split' : 'bi-person-plus'} me-2`}
                    aria-hidden="true"
                  />
                  {isSubmittingCreate ? 'Creando usuario...' : 'Crear usuario'}
                </button>
              </div>
            </div>

            {createError ? <p className="alert alert-danger mb-0 mt-3 py-2">{createError}</p> : null}
            {createSuccess ? <p className="alert alert-success mb-0 mt-3 py-2">{createSuccess}</p> : null}
          </form>
        ) : null}

        {isEditMode ? (
          <>
            <form className="create-user-form mb-4" onSubmit={handleFindUserToEdit}>
              <div className="create-user-head mb-3">
                <p className="create-user-kicker mb-1">Búsqueda de usuario</p>
                <p className="create-user-subtitle mb-0">
                  Escribe la cédula o el correo del usuario que deseas editar.
                </p>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label className="form-label mb-1" htmlFor="edit-user-lookup">
                    Cédula o correo
                  </label>
                  <div className="create-user-control">
                    <i className="bi bi-search create-user-control-icon" aria-hidden="true" />
                    <input
                      id="edit-user-lookup"
                      type="text"
                      className="form-control create-user-input"
                      placeholder="Ej: 123456789 o correo@ejemplo.com"
                      value={editLookup}
                      onChange={(event) => setEditLookup(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4 d-flex align-items-end">
                  <button type="submit" className="btn create-user-submit w-100">
                    <i className="bi bi-search me-2" aria-hidden="true" />
                    Buscar usuario
                  </button>
                </div>
              </div>
            </form>

            {selectedUser ? (
              <form className="create-user-form" onSubmit={handleEditSubmit}>
                <div className="create-user-head mb-3">
                  <p className="create-user-kicker mb-1">Edición de usuario</p>
                  <p className="create-user-subtitle mb-0">
                    Modifica los datos del usuario seleccionado y guarda los cambios.
                  </p>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1" htmlFor="edit-user-nombres">
                      Nombres
                    </label>
                    <div className="create-user-control">
                      <i className="bi bi-person-badge create-user-control-icon" aria-hidden="true" />
                      <input
                        id="edit-user-nombres"
                        type="text"
                        className="form-control create-user-input"
                        value={editNombres}
                        onChange={(event) => setEditNombres(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1" htmlFor="edit-user-apellidos">
                      Apellidos
                    </label>
                    <div className="create-user-control">
                      <i className="bi bi-person-vcard create-user-control-icon" aria-hidden="true" />
                      <input
                        id="edit-user-apellidos"
                        type="text"
                        className="form-control create-user-input"
                        value={editApellidos}
                        onChange={(event) => setEditApellidos(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1" htmlFor="edit-user-cedula">
                      Cédula
                    </label>
                    <div className="create-user-control">
                      <i className="bi bi-credit-card create-user-control-icon" aria-hidden="true" />
                      <input
                        id="edit-user-cedula"
                        type="text"
                        className="form-control create-user-input"
                        value={editCedula}
                        onChange={(event) => setEditCedula(keepOnlyDigits(event.target.value))}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1" htmlFor="edit-user-telefono">
                      Teléfono
                    </label>
                    <div className="create-user-control">
                      <i className="bi bi-telephone create-user-control-icon" aria-hidden="true" />
                      <input
                        id="edit-user-telefono"
                        type="tel"
                        className="form-control create-user-input"
                        value={editTelefono}
                        onChange={(event) => setEditTelefono(keepOnlyDigits(event.target.value))}
                        inputMode="numeric"
                        pattern="[0-9]*"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1" htmlFor="edit-user-email">
                      Correo
                    </label>
                    <div className="create-user-control">
                      <i className="bi bi-envelope create-user-control-icon" aria-hidden="true" />
                      <input
                        id="edit-user-email"
                        type="email"
                        className="form-control create-user-input"
                        value={editEmail}
                        onChange={(event) => setEditEmail(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1" htmlFor="edit-user-role">
                      Rol
                    </label>
                    <div className="create-user-control">
                      <i className="bi bi-person-gear create-user-control-icon" aria-hidden="true" />
                      <select
                        id="edit-user-role"
                        className="form-select create-user-input"
                        value={editRole}
                        onChange={(event) => setEditRole(event.target.value)}
                        required
                      >
                        <option value="Root">Root</option>
                        <option value="Admin">Admin</option>
                        <option value="User">User</option>
                        <option value="Invited">Invited</option>
                      </select>
                    </div>
                  </div>

                  <div className="col-12 col-md-6 d-flex align-items-end">
                    <button
                      type="submit"
                      className="btn create-user-submit w-100"
                      disabled={isSubmittingEdit}
                    >
                      <i
                        className={`bi ${isSubmittingEdit ? 'bi-hourglass-split' : 'bi-pencil-square'} me-2`}
                        aria-hidden="true"
                      />
                      {isSubmittingEdit ? 'Guardando cambios...' : 'Guardar cambios'}
                    </button>
                  </div>
                </div>

                {editError ? <p className="alert alert-danger mb-0 mt-3 py-2">{editError}</p> : null}
                {editSuccess ? <p className="alert alert-success mb-0 mt-3 py-2">{editSuccess}</p> : null}
              </form>
            ) : null}

            {!selectedUser && !editError ? (
              <p className="text-body-secondary mb-0">
                Busca un usuario por cédula o correo para cargar el formulario de edición.
              </p>
            ) : null}

            {!selectedUser && editError ? <p className="alert alert-danger mb-0">{editError}</p> : null}
          </>
        ) : null}

        {isDeleteMode ? (
          <>
            <form className="create-user-form mb-4" onSubmit={handleFindUserToDelete}>
              <div className="create-user-head mb-3">
                <p className="create-user-kicker mb-1">Búsqueda para eliminar</p>
                <p className="create-user-subtitle mb-0">
                  Escribe la cédula o el correo del usuario que deseas eliminar.
                </p>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label className="form-label mb-1" htmlFor="delete-user-lookup">
                    Cédula o correo
                  </label>
                  <div className="create-user-control">
                    <i className="bi bi-search create-user-control-icon" aria-hidden="true" />
                    <input
                      id="delete-user-lookup"
                      type="text"
                      className="form-control create-user-input"
                      placeholder="Ej: 123456789 o correo@ejemplo.com"
                      value={deleteLookup}
                      onChange={(event) => setDeleteLookup(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4 d-flex align-items-end">
                  <button type="submit" className="btn create-user-submit w-100">
                    <i className="bi bi-search me-2" aria-hidden="true" />
                    Buscar usuario
                  </button>
                </div>
              </div>
            </form>

            {userToDelete ? (
              <form className="create-user-form" onSubmit={handleDeleteSubmit}>
                <div className="create-user-head mb-3">
                  <p className="create-user-kicker mb-1">Confirmar eliminación</p>
                  <p className="create-user-subtitle mb-0">
                    Verifica los datos del usuario antes de eliminarlo.
                  </p>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1">Nombres</label>
                    <input type="text" className="form-control create-user-input" value={userToDelete.nombres} disabled />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1">Apellidos</label>
                    <input
                      type="text"
                      className="form-control create-user-input"
                      value={userToDelete.apellidos}
                      disabled
                    />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1">Cédula</label>
                    <input type="text" className="form-control create-user-input" value={userToDelete.cedula} disabled />
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1">Correo</label>
                    <input type="text" className="form-control create-user-input" value={userToDelete.email} disabled />
                  </div>

                  <div className="col-12">
                    <p className="alert alert-warning mb-0 py-2">
                      Esta acción eliminará el usuario de forma permanente.
                    </p>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1" htmlFor="delete-user-confirmation-text">
                      Escribe ELIMINAR para confirmar
                    </label>
                    <input
                      id="delete-user-confirmation-text"
                      type="text"
                      className="form-control create-user-input"
                      placeholder="ELIMINAR"
                      value={deleteConfirmationText}
                      onChange={(event) => setDeleteConfirmationText(event.target.value.toUpperCase())}
                      autoComplete="off"
                      required
                    />
                  </div>

                  <div className="col-12 col-md-6 d-flex align-items-end">
                    <button
                      type="submit"
                      className="btn btn-danger w-100"
                      disabled={isSubmittingDelete || deleteConfirmationText.trim() !== 'ELIMINAR'}
                    >
                      <i className={`bi ${isSubmittingDelete ? 'bi-hourglass-split' : 'bi-trash'} me-2`} aria-hidden="true" />
                      {isSubmittingDelete ? 'Eliminando usuario...' : 'Eliminar usuario'}
                    </button>
                  </div>
                </div>
              </form>
            ) : null}

            {!userToDelete && !deleteError ? (
              <p className="text-body-secondary mb-0">
                Busca un usuario por cédula o correo para cargar la confirmación de borrado.
              </p>
            ) : null}

            {deleteError ? <p className="alert alert-danger mb-0 mt-3 py-2">{deleteError}</p> : null}
            {deleteSuccess ? <p className="alert alert-success mb-0 mt-3 py-2">{deleteSuccess}</p> : null}
          </>
        ) : null}

        {isChangePasswordMode ? (
          <>
            <form
              className="create-user-form mb-4"
              onSubmit={(e) => {
                e.preventDefault()
                const lookup = cpLookup.trim().toLowerCase()
                setCpError('')
                setCpSuccess('')
                setCpUser(null)
                setCpNewPassword('')
                setCpConfirmPassword('')

                if (!lookup) {
                  setCpError('Ingresa una cédula o correo para buscar el usuario.')
                  return
                }

                const found = normalizedUsers.find(
                  (user) =>
                    user.cedula.trim().toLowerCase() === lookup ||
                    user.email.trim().toLowerCase() === lookup,
                )

                if (!found) {
                  setCpError('No se encontró un usuario con esa cédula o correo.')
                  return
                }

                setCpUser(found)
              }}
            >
              <div className="create-user-head mb-3">
                <p className="create-user-kicker mb-1">Búsqueda de usuario</p>
                <p className="create-user-subtitle mb-0">
                  Escribe la cédula o el correo del usuario al que deseas cambiarle la contraseña.
                </p>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label className="form-label mb-1" htmlFor="cp-lookup">
                    Cédula o correo
                  </label>
                  <div className="create-user-control">
                    <i className="bi bi-search create-user-control-icon" aria-hidden="true" />
                    <input
                      id="cp-lookup"
                      type="text"
                      className="form-control create-user-input"
                      placeholder="Ej: 123456789 o correo@ejemplo.com"
                      value={cpLookup}
                      onChange={(e) => setCpLookup(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4 d-flex align-items-end">
                  <button type="submit" className="btn create-user-submit w-100">
                    <i className="bi bi-search me-2" aria-hidden="true" />
                    Buscar usuario
                  </button>
                </div>
              </div>
            </form>

            {cpUser ? (
              <form
                className="create-user-form"
                onSubmit={async (e) => {
                  e.preventDefault()
                  const newPwd = cpNewPassword.trim()
                  const confirmPwd = cpConfirmPassword.trim()

                  setCpError('')
                  setCpSuccess('')

                  if (!newPwd || !confirmPwd) {
                    setCpError('Completa ambos campos de contraseña.')
                    return
                  }

                  if (newPwd !== confirmPwd) {
                    setCpError('Las contraseñas no coinciden.')
                    return
                  }

                  if (newPwd.length < 6) {
                    setCpError('La contraseña debe tener al menos 6 caracteres.')
                    return
                  }

                  if (!onChangeUserPassword) {
                    setCpError('No hay una acción configurada para cambiar la contraseña.')
                    return
                  }

                  setIsSubmittingCp(true)

                  try {
                    await onChangeUserPassword({
                      userId: cpUser.userId,
                      cedula: cpUser.cedula,
                      email: cpUser.email,
                      newPassword: newPwd,
                    })
                    setCpSuccess('Contraseña actualizada correctamente.')
                    setCpNewPassword('')
                    setCpConfirmPassword('')
                    setCpLookup('')
                    setCpUser(null)
                  } catch (error) {
                    setCpError(error?.message || 'No fue posible cambiar la contraseña.')
                  } finally {
                    setIsSubmittingCp(false)
                  }
                }}
              >
                <div className="create-user-head mb-3">
                  <p className="create-user-kicker mb-1">Nueva contraseña</p>
                  <p className="create-user-subtitle mb-0">
                    Usuario: <strong>{cpUser.nombres} {cpUser.apellidos}</strong> - {cpUser.email}
                  </p>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1" htmlFor="cp-new">
                      Nueva contraseña
                    </label>
                    <div className="create-user-control">
                      <i className="bi bi-lock-fill create-user-control-icon" aria-hidden="true" />
                      <input
                        id="cp-new"
                        type="password"
                        className="form-control create-user-input"
                        value={cpNewPassword}
                        onChange={(e) => setCpNewPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <label className="form-label mb-1" htmlFor="cp-confirm">
                      Confirmar contraseña
                    </label>
                    <div className="create-user-control">
                      <i className="bi bi-lock-fill create-user-control-icon" aria-hidden="true" />
                      <input
                        id="cp-confirm"
                        type="password"
                        className="form-control create-user-input"
                        value={cpConfirmPassword}
                        onChange={(e) => setCpConfirmPassword(e.target.value)}
                        autoComplete="new-password"
                        required
                      />
                    </div>
                  </div>

                  <div className="col-12 col-md-6 d-flex align-items-end">
                    <button
                      type="submit"
                      className="btn create-user-submit w-100"
                      disabled={isSubmittingCp}
                    >
                      <i
                        className={`bi ${isSubmittingCp ? 'bi-hourglass-split' : 'bi-key'} me-2`}
                        aria-hidden="true"
                      />
                      {isSubmittingCp ? 'Guardando...' : 'Cambiar contraseña'}
                    </button>
                  </div>
                </div>

                {cpError ? <p className="alert alert-danger mb-0 mt-3 py-2">{cpError}</p> : null}
                {cpSuccess ? <p className="alert alert-success mb-0 mt-3 py-2">{cpSuccess}</p> : null}
              </form>
            ) : null}

            {!cpUser && !cpError ? (
              <p className="text-body-secondary mb-0">
                Busca un usuario por cédula o correo para cambiar su contraseña.
              </p>
            ) : null}

            {!cpUser && cpError ? <p className="alert alert-danger mb-0">{cpError}</p> : null}
            {cpSuccess ? <p className="alert alert-success mb-0 mt-3 py-2">{cpSuccess}</p> : null}
          </>
        ) : null}

        {isListMode ? content : null}

        {isSearchMode ? (
          <>
            <form className="create-user-form mb-4" onSubmit={handleSearchUser}>
              <div className="create-user-head mb-3">
                <p className="create-user-kicker mb-1">Búsqueda de usuario</p>
                <p className="create-user-subtitle mb-0">
                  Escribe la cédula o el correo del usuario que deseas consultar.
                </p>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label className="form-label mb-1" htmlFor="search-user-lookup">
                    Cédula o correo
                  </label>
                  <div className="create-user-control">
                    <i className="bi bi-search create-user-control-icon" aria-hidden="true" />
                    <input
                      id="search-user-lookup"
                      type="text"
                      className="form-control create-user-input"
                      placeholder="Ej: 123456789 o correo@ejemplo.com"
                      value={searchLookup}
                      onChange={(event) => setSearchLookup(event.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="col-12 col-md-4 d-flex align-items-end">
                  <button type="submit" className="btn create-user-submit w-100">
                    <i className="bi bi-search me-2" aria-hidden="true" />
                    Buscar usuario
                  </button>
                </div>
              </div>
            </form>

            {searchResult ? (
              <div className="create-user-form">
                <div className="create-user-head mb-3">
                  <p className="create-user-kicker mb-1">Resultado</p>
                  <p className="create-user-subtitle mb-0">Datos del usuario encontrado.</p>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <p className="form-label mb-1">Nombres</p>
                    <div className="create-user-control">
                      <i className="bi bi-person-badge create-user-control-icon" aria-hidden="true" />
                      <span className="form-control create-user-input bg-light">{searchResult.nombres || '—'}</span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <p className="form-label mb-1">Apellidos</p>
                    <div className="create-user-control">
                      <i className="bi bi-person-vcard create-user-control-icon" aria-hidden="true" />
                      <span className="form-control create-user-input bg-light">{searchResult.apellidos || '—'}</span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <p className="form-label mb-1">Cédula</p>
                    <div className="create-user-control">
                      <i className="bi bi-credit-card create-user-control-icon" aria-hidden="true" />
                      <span className="form-control create-user-input bg-light">{searchResult.cedula || '—'}</span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <p className="form-label mb-1">Teléfono</p>
                    <div className="create-user-control">
                      <i className="bi bi-telephone create-user-control-icon" aria-hidden="true" />
                      <span className="form-control create-user-input bg-light">{searchResult.telefono || '—'}</span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <p className="form-label mb-1">Correo</p>
                    <div className="create-user-control">
                      <i className="bi bi-envelope create-user-control-icon" aria-hidden="true" />
                      <span className="form-control create-user-input bg-light">{searchResult.email || '—'}</span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <p className="form-label mb-1">Rol</p>
                    <div className="create-user-control">
                      <i className="bi bi-person-gear create-user-control-icon" aria-hidden="true" />
                      <span className="form-control create-user-input bg-light">{searchResult.role || '—'}</span>
                    </div>
                  </div>

                  <div className="col-12 col-md-6">
                    <p className="form-label mb-1">ID</p>
                    <div className="create-user-control">
                      <i className="bi bi-hash create-user-control-icon" aria-hidden="true" />
                      <span className="form-control create-user-input bg-light">{searchResult.userId || '—'}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {!searchResult && !searchDone ? (
              <p className="text-body-secondary mb-0">
                Busca un usuario por cédula o correo para ver su información.
              </p>
            ) : null}

            {!searchResult && searchError ? <p className="alert alert-danger mb-0">{searchError}</p> : null}
          </>
        ) : null}

      </div>
    </section>
  )
}

export default UsersSection
