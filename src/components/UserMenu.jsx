import { useEffect, useRef, useState } from 'react'

function UserMenu({ userName, userRole, onLogout }) {
  const [isOpen, setIsOpen] = useState(false)
  const [avatarUrl, setAvatarUrl] = useState('')
  const menuRef = useRef(null)
  const inputFileRef = useRef(null)

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

  const clearAvatarUrl = (currentAvatarUrl) => {
    if (currentAvatarUrl) {
      URL.revokeObjectURL(currentAvatarUrl)
    }
  }

  useEffect(() => {
    return () => {
      clearAvatarUrl(avatarUrl)
    }
  }, [avatarUrl])

  const handleAvatarUpload = (event) => {
    const selectedFile = event.target.files?.[0]
    if (!selectedFile) {
      return
    }

    const nextAvatarUrl = URL.createObjectURL(selectedFile)
    setAvatarUrl((currentAvatarUrl) => {
      clearAvatarUrl(currentAvatarUrl)

      return nextAvatarUrl
    })
    event.target.value = ''
  }

  const handleAvatarAction = () => {
    if (avatarUrl) {
      setAvatarUrl((currentAvatarUrl) => {
        clearAvatarUrl(currentAvatarUrl)

        return ''
      })
      return
    }

    inputFileRef.current?.click()
  }

  const renderAvatar = () => {
    if (avatarUrl) {
      return <img src={avatarUrl} alt="Foto de usuario" className="user-avatar-image" />
    }

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

            <input
              ref={inputFileRef}
              type="file"
              accept="image/*"
              className="d-none"
              onChange={handleAvatarUpload}
            />

            <div className="user-menu-actions d-flex flex-column align-items-start gap-2">
              <button
                type="button"
                className="btn btn-link p-0 text-decoration-none user-menu-action"
                onClick={handleAvatarAction}
              >
                {avatarUrl ? 'Eliminar foto' : 'Subir foto'}
              </button>

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