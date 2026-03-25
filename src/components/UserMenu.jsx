import { useEffect, useRef, useState } from 'react'

function UserMenu({ userName, userRole, onLogout, onChangePassword }) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef(null)

  const avatarInitial = userName.slice(0, 1).toUpperCase()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current || menuRef.current.contains(event.target)) {
        return
      }

      setIsOpen(false)
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const renderAvatar = () => {
    return (
      <span className="user-avatar" aria-hidden="true">
        {avatarInitial}
      </span>
    )
  }

  return (
    <div className="position-relative user-menu" ref={menuRef}>
      <button
        type="button"
        className="btn btn-light border d-flex align-items-center gap-2 user-menu-trigger"
        onClick={() => setIsOpen((currentOpen) => !currentOpen)}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {renderAvatar()}
        <span className="d-none d-sm-inline user-menu-name">{userName}</span>
        <i className={`bi ${isOpen ? 'bi-chevron-up' : 'bi-chevron-down'}`} aria-hidden="true" />
      </button>

      {isOpen && (
        <div className="card user-menu-panel" role="menu" aria-label="Menú de usuario">
          <div className="card-body p-3">
            <div className="d-flex align-items-center gap-2 mb-3">
              {renderAvatar()}
              <div>
                <p className="mb-0 fw-semibold user-menu-name">{userName}</p>
                <p className="mb-0 text-body-secondary small">{userRole}</p>
              </div>
            </div>

            <div className="user-menu-actions d-flex flex-column align-items-start gap-2">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none user-menu-action"
                onClick={() => {
                  setIsOpen(false)
                  onChangePassword?.()
                }}
              >
                <i className="bi bi-key me-2" aria-hidden="true" />
                Cambiar mi contraseña
              </button>
              <hr className="w-100 my-0" />
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none user-menu-action"
                onClick={onLogout}
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserMenu
