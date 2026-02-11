import { useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import MainFront from '../components/MainFront.jsx'
import '../styles/pages/LoginPage.css'

function LoginPage() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    const name = form.email ? form.email.split('@')[0] : 'User'
    login({ name, email: form.email })
  }

  return (
    <div className="container py-5 login-page">
      <div className="row g-4 align-items-center">
        <div className="col-12 col-lg-6">
          <MainFront />
        </div>
        <div className="col-12 col-lg-6">
          <div className="card shadow-sm border-0 login-card">
            <div className="card-body p-4">
              <h3 className="fw-semibold mb-1">Welcome back</h3>
              <p className="text-muted mb-4">Sign in to continue managing contacts.</p>
              <form onSubmit={handleSubmit} className="d-grid gap-3">
                <div>
                  <label className="form-label fw-semibold" htmlFor="login-email">
                    Email
                  </label>
                  <input
                    className="form-control"
                    id="login-email"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div>
                  <label className="form-label fw-semibold" htmlFor="login-password">
                    Password
                  </label>
                  <input
                    className="form-control"
                    id="login-password"
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button className="btn btn-primary" type="submit">
                  Log In
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
