import { useState } from 'react'
import AddContactForm from '../components/AddContactForm.jsx'
import apiClient from '../api/client.js'
import '../styles/pages/AddContactPage.css'

function AddContactPage() {
  const [status, setStatus] = useState({ type: '', message: '' })

  const handleSubmit = async (form) => {
    try {
      await apiClient.post('/api/addContact', form)
      setStatus({ type: 'success', message: 'Contact added successfully.' })
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to add contact.'
      setStatus({ type: 'error', message })
    }
  }

  return (
    <div className="scm-add-contact">
      {status.message && (
        <div className={`scm-add-contact__status ${status.type === 'error' ? 'text-danger' : 'text-success'}`}>
          {status.message}
        </div>
      )}
      <AddContactForm onSubmit={handleSubmit} />
    </div>
  )
}

export default AddContactPage
