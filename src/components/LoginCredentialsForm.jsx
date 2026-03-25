import { useState } from 'react'

const LAST_EMAIL_KEY = 'login_last_email'

function LoginCredentialsForm({ onSubmit, isSubmitting, errorMessage }) {
  const [email, setEmail] = useState(() => localStorage.getItem(LAST_EMAIL_KEY) ?? '')
  const [password, setPassword] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()
    const trimmedEmail = email.trim()
    if (trimmedEmail) {
      localStorage.setItem(LAST_EMAIL_KEY, trimmedEmail)
    }
    await onSubmit({ email: trimmedEmail, password })
  }

  return (
    <form className="login-credentials-form" onSubmit={handleSubmit}>
      <div className="login-credentials-fields">
        <label className="login-credentials-label form-label mb-1" htmlFor="login-email">
          Correo
        </label>
        <div className="login-field-control">
          <i className="bi bi-envelope login-field-icon" aria-hidden="true" />
          <input
            id="login-email"
            type="email"
            className="form-control"
            placeholder="correo@ejemplo.com"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>
      </div>

      <div className="login-credentials-fields">
        <label className="login-credentials-label form-label mb-1" htmlFor="login-password">
          Contraseña
        </label>
        <div className="login-field-control">
          <i className="bi bi-lock login-field-icon" aria-hidden="true" />
          <input
            id="login-password"
            type="password"
            className="form-control"
            placeholder="********"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>
      </div>

      {errorMessage ? <p className="mb-0 text-danger small">{errorMessage}</p> : null}

      <button type="submit" className="btn btn-primary w-100 login-submit-button" disabled={isSubmitting}>
        <i className={`bi ${isSubmitting ? 'bi-hourglass-split' : 'bi-box-arrow-in-right'}`} aria-hidden="true" />
        <span>{isSubmitting ? 'Ingresando...' : 'Iniciar sesión'}</span>
      </button>

      <p className="login-credentials-note mb-0">Acceso seguro para administradores y colaboradores.</p>
    </form>
  )
}

export default LoginCredentialsForm
