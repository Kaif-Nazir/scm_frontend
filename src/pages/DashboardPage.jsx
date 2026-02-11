import { useEffect, useState } from 'react'
import apiClient from '../api/client.js'
import '../styles/pages/DashboardPage.css'

function DashboardPage({ user, onStartAddContact }) {
  const [stats, setStats] = useState({ totalContacts: 0, totalFavourites: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [currentTime, setCurrentTime] = useState(() => new Date())

  useEffect(() => {
    let isMounted = true
    const fetchStats = async () => {
      try {
        const response = await apiClient.get('/api/contactStats')
        if (isMounted) {
          setStats(response.data)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          setError(err?.response?.data?.message || 'Failed to load stats.')
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    fetchStats()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <div className="scm-dashboard-header">
        <div>
          <h2 className="fw-semibold mb-1">Welcome back, {user?.name || 'User'}.</h2>
          <p className="text-muted mb-0">Pick an action from the left menu to get started.</p>
        </div>
        <div className="scm-dashboard-clock">
          {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
        </div>
      </div>
      {error && <div className="text-danger mb-3">{error}</div>}
      <div className="scm-dashboard-center">
        <div className="row g-4 mb-4 justify-content-center text-center">
          <div className="col-12 col-md-6">
            <div className="scm-stat">
              <div className="card-body text-center">
                <h3 className="fw-semibold mb-1">
                  {isLoading ? 'Loading...' : `${stats.totalContacts} Contacts`}
                </h3>
                <p className="text-muted mb-0">You have these contacts stored in your account.</p>
              </div>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <div className="scm-stat">
              <div className="card-body text-center">
                <h3 className="fw-semibold mb-1">
                  {isLoading ? 'Loading...' : `${stats.totalFavourites} Favorites`}
                </h3>
                <p className="text-muted mb-0">These contacts are your favorites.</p>
              </div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <button
            className="btn btn-outline-primary px-4 scm-dashboard-cta"
            type="button"
            onClick={onStartAddContact}
          >
            <span className = "cta-inner">Start adding contacts</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default DashboardPage
