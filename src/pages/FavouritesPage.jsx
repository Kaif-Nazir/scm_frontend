import { useEffect, useState } from 'react'
import ContactsList from '../components/ContactsList.jsx'
import apiClient from '../api/client.js'
import { useAlert } from '../context/AlertContext.jsx'

function FavouritesPage() {
  const { error: showError } = useAlert()
  const [contacts, setContacts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let isMounted = true
    const fetchFavourites = async () => {
      try {
        const response = await apiClient.get('/api/favourite')
        if (isMounted) {
          setContacts(response.data)
          setError('')
        }
      } catch (err) {
        if (isMounted) {
          const message = err?.response?.data?.message || 'Failed to load favourites.'
          setError(message)
          showError(message)
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }
    fetchFavourites()
    return () => {
      isMounted = false
    }
  }, [showError])

  if (isLoading) {
    return <div className="text-muted">Loading favourites...</div>
  }

  if (error) {
    return <div className="text-danger">{error}</div>
  }

  return (
    <ContactsList title="Favourites" contacts={contacts} hideUnfavourited />
  )
}

export default FavouritesPage
