import { useState } from 'react'

function ChangePasswordSection({ onChangePassword }) {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    setError('')
    setSuccess('')

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('Completa todos los campos.')
      return
    }

    if (newPassword !== confirmPassword) {
      setError('La nueva contraseña y su confirmación no coinciden.')
      return
    }

    if (newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres.')
      return
    }

    if (!onChangePassword) {
      setError('No hay una acción configurada para cambiar la contraseña.')
      return
    }

    setIsSubmitting(true)

    try {
      await onChangePassword({ currentPassword, newPassword })
      setSuccess('Contraseña actualizada correctamente.')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (err) {
      setError(err?.message || 'No fue posible cambiar la contraseña.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="card shadow-sm border-0 main-content-card">
      <div className="card-body p-4">
        <form className="create-user-form" onSubmit={handleSubmit}>
          <div className="create-user-head mb-3">
            <p className="create-user-kicker mb-1">Seguridad de la cuenta</p>
            <p className="create-user-subtitle mb-0">
              Ingresa tu contraseña actual y luego la nueva contraseña.
            </p>
          </div>

          <div className="row g-3">
            <div className="col-12 col-md-6">
              <label className="form-label mb-1" htmlFor="cp-current">
                Contraseña actual
              </label>
              <div className="create-user-control">
                <i className="bi bi-lock create-user-control-icon" aria-hidden="true" />
                <input
                  id="cp-current"
                  type="password"
                  className="form-control create-user-input"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

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
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="col-12 col-md-6">
              <label className="form-label mb-1" htmlFor="cp-confirm">
                Confirmar nueva contraseña
              </label>
              <div className="create-user-control">
                <i className="bi bi-lock-fill create-user-control-icon" aria-hidden="true" />
                <input
                  id="cp-confirm"
                  type="password"
                  className="form-control create-user-input"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="col-12 col-md-6 d-flex align-items-end">
              <button
                type="submit"
                className="btn create-user-submit w-100"
                disabled={isSubmitting}
              >
                <i
                  className={`bi ${isSubmitting ? 'bi-hourglass-split' : 'bi-key'} me-2`}
                  aria-hidden="true"
                />
                {isSubmitting ? 'Guardando...' : 'Cambiar contraseña'}
              </button>
            </div>
          </div>

          {error ? <p className="alert alert-danger mb-0 mt-3 py-2">{error}</p> : null}
          {success ? <p className="alert alert-success mb-0 mt-3 py-2">{success}</p> : null}
        </form>
      </div>
    </section>
  )
}

export default ChangePasswordSection
