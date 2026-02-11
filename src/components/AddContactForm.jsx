import { useState } from 'react'

const initialForm = {
  name: '',
  phoneNumber: '',
  email: '',
  address: '',
  picture: '',
  description: '',
  favourite: false,
  linkedinLink: '',
}

function AddContactForm({ onSubmit }) {
  const [form, setForm] = useState(initialForm)

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    if (onSubmit) {
      onSubmit(form)
      setForm(initialForm)
    }
  }

  return (
    <div className="card add-contact-card">
      <div className="card-body p-4">
        <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-2 mb-4">
          <div>
            <h3 className="fw-semibold mb-1">Add Contact</h3>
            <p className="text-muted mb-0">Store a new person in your address book.</p>
          </div>
        </div>
        <form className="row g-3 add-contact-form" onSubmit={handleSubmit}>
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" htmlFor="contact-name">
              Name
              <span className="text-danger ms-1">*</span>
            </label>
            <input
              className="form-control"
              id="contact-name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Full name"
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" htmlFor="contact-phone">
              Phone Number
              <span className="text-danger ms-1">*</span>
            </label>
            <input
              className="form-control"
              id="contact-phone"
              name="phoneNumber"
              type="tel"
              value={form.phoneNumber}
              onChange={handleChange}
              placeholder="10-digit number"
              minLength={10}
              maxLength={10}
              required
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" htmlFor="contact-email">
              Email
            </label>
            <input
              className="form-control"
              id="contact-email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="name@example.com"
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" htmlFor="contact-linkedin">
              LinkedIn Link
            </label>
            <input
              className="form-control"
              id="contact-linkedin"
              name="linkedinLink"
              type="url"
              value={form.linkedinLink}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/username"
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" htmlFor="contact-picture">
              Picture URL
            </label>
            <input
              className="form-control"
              id="contact-picture"
              name="picture"
              type="url"
              value={form.picture}
              onChange={handleChange}
              placeholder="https://image-url"
            />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label fw-semibold" htmlFor="contact-address">
              Address
            </label>
            <input
              className="form-control"
              id="contact-address"
              name="address"
              type="text"
              value={form.address}
              onChange={handleChange}
              placeholder="Street, city, state"
            />
          </div>
          <div className="col-12">
            <label className="form-label fw-semibold" htmlFor="contact-description">
              Description
            </label>
            <textarea
              className="form-control"
              id="contact-description"
              name="description"
              rows="3"
              value={form.description}
              onChange={handleChange}
              placeholder="Notes about this contact"
            />
          </div>
          <div className="col-12">
            <div className="add-contact__toggle">
              <input
                className="add-contact__toggle-input"
                id="contact-favourite"
                name="favourite"
                type="checkbox"
                checked={form.favourite}
                onChange={handleChange}
              />
              <label className="add-contact__toggle-label" htmlFor="contact-favourite">
                Mark as favourite
              </label>
            </div>
          </div>
          <div className="col-12 d-flex flex-wrap gap-4 pt-2 add-contact__actions">
            <button className="btn btn-outline-primary px-3 save_contact_btn" type="submit">
              <span>Save Contact</span>
            </button>
            <button
              className="btn btn-outline-danger px-4 clear_contact_btn"
              type="button"
              onClick={() => setForm(initialForm)}
            >
              <span>Clear</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddContactForm
