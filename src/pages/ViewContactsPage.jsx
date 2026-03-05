import { useEffect, useState } from 'react'
import ContactsList from '../components/ContactsList.jsx'
import apiClient from '../api/client.js'
import { useAlert } from '../context/AlertContext.jsx'

function ViewContactsPage() {
  const { error: showError } = useAlert()
  const [contacts, setContacts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchContacts = async () => {
      try {
        const response = await apiClient.get('/api/getAllContacts')
        if (isMounted) {
          setContacts(response.data)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          const message = err?.response?.data?.message || 'Failed to load contacts.'
          setError(message)
          showError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    fetchContacts()
    return () => {
      isMounted = false
    }
  }, [showError])

  if (isLoading) {
    return <div className="text-muted">Loading contacts...</div>
  }

  if (error) {
    return <div className="text-danger">{error}</div>
  }

  return <ContactsList title="All Contacts" contacts={contacts} />
}

export default ViewContactsPage
