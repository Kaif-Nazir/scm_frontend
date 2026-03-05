import AddContactForm from '../components/AddContactForm.jsx'
import apiClient from '../api/client.js'
import { useAlert } from '../context/AlertContext.jsx'
import '../styles/pages/AddContactPage.css'

function AddContactPage() {
  const { success, error: showError } = useAlert()

  const handleSubmit = async (form) => {
    try {
      await apiClient.post('/api/addContact', form)
      success('Contact added successfully.')
      return true
    } catch (error) {
      const message = error?.response?.data?.message || 'Failed to add contact.'
      showError(message)
      return false
    }
  }

  return (
    <div className="scm-add-contact">
      <AddContactForm onSubmit={handleSubmit} />
    </div>
  )
}

export default AddContactPage
